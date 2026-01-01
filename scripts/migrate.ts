import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env manually
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = envContent.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=')
  if (key && !key.startsWith('#')) {
    acc[key.trim()] = value.join('=').trim()
  }
  return acc
}, {} as Record<string, string>)

const DATABASE_URL = envVars.DATABASE_URL || process.env.DATABASE_URL

async function migrate() {
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }
  const sql = neon(DATABASE_URL)

  const migrationPath = join(__dirname, '../drizzle/0000_lush_infant_terrible.sql')
  const migration = readFileSync(migrationPath, 'utf-8')

  // Split by statement breakpoint and execute each statement
  const statements = migration.split('--> statement-breakpoint')

  console.log('Starting migration...')

  for (const statement of statements) {
    const trimmed = statement.trim()
    if (trimmed) {
      try {
        console.log('Executing:', trimmed.substring(0, 50) + '...')
        await sql(trimmed)
        console.log('Success!')
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log('Skipped (already exists)')
        } else {
          console.error('Error:', error.message)
        }
      }
    }
  }

  console.log('Migration completed!')
}

migrate()
