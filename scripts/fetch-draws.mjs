/**
 * 동행복권 로또 6/45 역대 당첨번호를 받아 public/data/draws.json에 저장한다.
 * - 기존 파일이 있으면 마지막 회차 이후만 이어서 받는다.
 * - 동행복권 홈페이지 내부 API(비공식)를 사용하므로 응답 형식이 바뀌면 검증 단계에서 실패한다.
 *
 * 사용법: node scripts/fetch-draws.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public/data/draws.json'
)
const API_URL = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do'
const REQUEST_DELAY_MS = 300
const MAX_REQUESTS = 300

const log = (message) => process.stdout.write(`${message}\n`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(params) {
  const url = `${API_URL}?${new URLSearchParams(params)}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
    },
  })
  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status}): ${url}`)
  }
  const body = await response.json()
  const list = body?.data?.list
  if (!Array.isArray(list)) {
    throw new Error(`예상하지 못한 응답 형식: ${url}`)
  }
  return list
}

function toDraw(raw) {
  const numbers = [
    raw.tm1WnNo,
    raw.tm2WnNo,
    raw.tm3WnNo,
    raw.tm4WnNo,
    raw.tm5WnNo,
    raw.tm6WnNo,
  ]
    .map(Number)
    .sort((a, b) => a - b)
  const bonus = Number(raw.bnsWnNo)
  const all = [...numbers, bonus]
  const date = String(raw.ltRflYmd)

  const isValid =
    Number.isInteger(raw.ltEpsd) &&
    all.every((n) => Number.isInteger(n) && n >= 1 && n <= 45) &&
    new Set(all).size === 7 &&
    /^\d{8}$/.test(date)
  if (!isValid) {
    throw new Error(`잘못된 회차 데이터: ${JSON.stringify(raw)}`)
  }

  return {
    no: raw.ltEpsd,
    date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    numbers,
    bonus,
    // 1~5등 1게임당 당첨금 (원). 해당 등수 당첨자가 없으면 0
    prizes: [
      raw.rnk1WnAmt,
      raw.rnk2WnAmt,
      raw.rnk3WnAmt,
      raw.rnk4WnAmt,
      raw.rnk5WnAmt,
    ].map((amount) => Number(amount) || 0),
  }
}

async function readExisting() {
  try {
    const file = JSON.parse(await readFile(OUTPUT_PATH, 'utf8'))
    return Array.isArray(file.draws) ? file.draws : []
  } catch {
    return []
  }
}

async function main() {
  const draws = new Map((await readExisting()).map((d) => [d.no, d]))
  const startCount = draws.size
  let cursor = Math.max(0, ...draws.keys())

  for (let i = 0; i < MAX_REQUESTS; i++) {
    // 'latest' 방향은 커서 다음 회차부터 최대 10개를 돌려준다. 1회차는 커서 0으로 조회되지 않아 'center'로 받는다.
    const list =
      cursor === 0
        ? await fetchPage({ srchDir: 'center', srchLtEpsd: '1' })
        : await fetchPage({ srchDir: 'latest', srchCursorLtEpsd: String(cursor) })

    const newDraws = list.map(toDraw).filter((d) => d.no > cursor)
    if (newDraws.length === 0) break

    for (const draw of newDraws) draws.set(draw.no, draw)
    cursor = Math.max(cursor, ...newDraws.map((d) => d.no))
    log(`~${cursor}회차까지 수집`)
    await sleep(REQUEST_DELAY_MS)
  }

  const sorted = [...draws.values()].sort((a, b) => a.no - b.no)
  sorted.forEach((draw, index) => {
    if (draw.no !== index + 1) {
      throw new Error(`${index + 1}회차가 누락되었습니다.`)
    }
  })

  if (sorted.length === startCount) {
    log(`새 회차 없음 (최신 ${cursor}회)`)
    return
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(
    OUTPUT_PATH,
    `${JSON.stringify({ latest: cursor, draws: sorted })}\n`
  )
  log(`${sorted.length - startCount}개 회차 추가 → 총 ${sorted.length}회`)
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`)
  process.exit(1)
})
