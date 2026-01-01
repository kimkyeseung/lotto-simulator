import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test'
})

afterEach(() => {
  // Clean up after each test if needed
})

afterAll(() => {
  // Global cleanup
})
