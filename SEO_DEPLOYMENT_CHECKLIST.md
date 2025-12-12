# SEO 배포 후 체크리스트

배포 완료 후 반드시 확인해야 할 SEO 관련 작업 목록입니다.

## ✅ 완료된 작업

- [x] 기본 메타 태그 추가 (index.html)
- [x] Open Graph 태그 추가
- [x] Twitter Card 태그 추가
- [x] JSON-LD 구조화 데이터 추가
- [x] sitemap.xml 날짜 수정
- [x] OG 이미지 제작 및 추가 (og-image.jpg)
- [x] robots.txt 설정
- [x] manifest.webmanifest 설정
- [x] 빌드 테스트 통과

## 📋 배포 후 즉시 해야 할 작업

### 1. SNS 공유 미리보기 테스트 (5분)

다음 도구들로 OG 태그가 제대로 적용되었는지 확인:

#### Facebook Sharing Debugger
- URL: https://developers.facebook.com/tools/debug/
- 입력: `https://lotto-simulator-three.vercel.app/`
- 확인사항:
  - [x] 타이틀 제대로 표시
  - [x] 설명 제대로 표시
  - [x] OG 이미지(1200x630px) 로드
  - [x] 깨진 이미지 없음

#### Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- 입력: `https://lotto-simulator-three.vercel.app/`
- 확인사항:
  - [x] Card type: summary_large_image
  - [x] 이미지 미리보기 정상
  - [x] 텍스트 가독성

#### LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- 입력: `https://lotto-simulator-three.vercel.app/`
- 확인사항:
  - [x] 미리보기 정상 표시

### 2. Google Search Console 등록 (10분)

#### 사이트 소유권 확인
1. https://search.google.com/search-console 접속
2. 속성 추가 → URL 접두어 방식 선택
3. `https://lotto-simulator-three.vercel.app/` 입력
4. 소유권 확인 방법 선택:
   - **HTML 태그 방식** (권장)
   - 또는 DNS 레코드 방식

**HTML 태그 추가 방법:**
```html
<!-- index.html <head> 섹션에 추가 -->
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

#### Sitemap 제출
1. Search Console → Sitemaps 메뉴
2. 새 사이트맵 추가: `https://lotto-simulator-three.vercel.app/sitemap.xml`
3. 제출 버튼 클릭

#### URL 검사 및 색인 요청
1. Search Console → URL 검사
2. 메인 URL 입력: `https://lotto-simulator-three.vercel.app/`
3. "색인 생성 요청" 클릭

### 3. 구조화 데이터 검증 (5분)

#### Rich Results Test
- URL: https://search.google.com/test/rich-results
- 입력: `https://lotto-simulator-three.vercel.app/`
- 확인사항:
  - [x] WebApplication 스키마 인식
  - [x] Organization 스키마 인식
  - [x] BreadcrumbList 스키마 인식
  - [x] 오류 없음

### 4. 성능 및 SEO 점수 확인 (10분)

#### Google PageSpeed Insights
- URL: https://pagespeed.web.dev/
- 입력: `https://lotto-simulator-three.vercel.app/`
- 목표 점수:
  - Performance: 90+ (모바일), 95+ (데스크톱)
  - SEO: 95+
  - Best Practices: 95+
  - Accessibility: 90+

**개선이 필요한 경우:**
- 이미지 최적화 (WebP 변환)
- 폰트 최적화 (font-display: swap)
- 불필요한 JavaScript 제거

#### Lighthouse (Chrome DevTools)
1. Chrome 개발자 도구 열기 (F12)
2. Lighthouse 탭 선택
3. "분석 생성" 클릭
4. 카테고리별 점수 확인

### 5. 모바일 친화성 테스트 (3분)

#### Mobile-Friendly Test
- URL: https://search.google.com/test/mobile-friendly
- 입력: `https://lotto-simulator-three.vercel.app/`
- 확인사항:
  - [x] "페이지가 모바일 친화적입니다" 메시지
  - [x] 텍스트 가독성
  - [x] 터치 요소 간격

## 📊 추가 SEO 도구 설정 (선택사항)

### Naver Search Advisor (네이버 검색 등록)
1. https://searchadvisor.naver.com/ 접속
2. 웹마스터 도구 → 사이트 등록
3. 사이트맵 제출: `https://lotto-simulator-three.vercel.app/sitemap.xml`
4. RSS 제출 (있는 경우)

### Bing Webmaster Tools
1. https://www.bing.com/webmasters 접속
2. 사이트 추가
3. Sitemap 제출

### Google Analytics 4 연동 확인
- 현재 구현된 GoogleAnalytics 컴포넌트 작동 확인
- 실시간 보고서에서 트래픽 확인

## 🔍 SEO 모니터링 (지속적)

### 주간 체크
- [ ] Search Console에서 검색 성능 확인
- [ ] 색인 생성 상태 확인
- [ ] 크롤링 오류 확인

### 월간 체크
- [ ] PageSpeed Insights 점수 추이
- [ ] Core Web Vitals 지표 확인
- [ ] 키워드 순위 변화 모니터링

## 🚀 추가 최적화 작업 (우선순위 중)

### 이미지 최적화
```bash
# OG 이미지 용량 줄이기 (현재 553KB)
# 목표: 200KB 이하

# 방법 1: ImageOptim (macOS)
# 방법 2: TinyPNG (https://tinypng.com/)
# 방법 3: WebP 변환
```

### Preload 중요 리소스
```html
<!-- index.html에 추가 -->
<link rel="preload" href="/images/og-image.jpg" as="image" />
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin />
```

### DNS Prefetch
```html
<!-- index.html에 이미 추가됨 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

## 📈 성공 지표

배포 후 2주 내 달성 목표:
- [x] Google Search Console에 사이트 등록
- [x] Sitemap 크롤링 완료
- [ ] 메인 페이지 색인 등록
- [ ] PageSpeed Insights 점수 90+ (모바일)
- [ ] SNS 공유 시 미리보기 정상 작동

배포 후 1개월 내 달성 목표:
- [ ] 자연 검색 유입 발생
- [ ] "로또 시뮬레이터" 키워드 검색 시 1페이지 노출
- [ ] Core Web Vitals 모든 지표 "양호"

## 🛠️ 문제 해결

### OG 이미지가 SNS에서 안 보이는 경우
1. 캐시 문제: Facebook Debugger에서 "Scrape Again" 클릭
2. 이미지 경로 확인: 절대 URL 사용 확인
3. 이미지 크기 확인: 1200x630px 정확히 맞춰야 함
4. 파일 크기: 8MB 이하 (권장: 300KB 이하)

### Google에서 색인이 안 되는 경우
1. robots.txt 확인: Allow: / 되어있는지
2. noindex 메타 태그 없는지 확인
3. Search Console에서 수동 색인 요청
4. 최소 1-2주 대기 (자동 크롤링 주기)

### 성능 점수가 낮은 경우
1. 이미지 최적화 (WebP 변환, lazy loading)
2. JavaScript 번들 최적화 (code splitting)
3. 폰트 최적화 (font-display: swap)
4. CDN 사용 고려

## 📞 참고 자료

- [Google Search Console 가이드](https://support.google.com/webmasters)
- [Open Graph 프로토콜](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Web.dev](https://web.dev/learn/)

---

**마지막 업데이트**: 2024-12-07
**다음 리뷰 예정일**: 배포 후 1주일
