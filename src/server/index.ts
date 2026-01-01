import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { commentsRoute } from './routes/comments'
import { likesRoute } from './routes/likes'
import { usersRoute } from './routes/users'

const app = new Hono().basePath('/api')

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'https://lotto-simulator-three.vercel.app'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Routes
app.route('/users', usersRoute)
app.route('/comments', commentsRoute)
app.route('/likes', likesRoute)

export default app
export type AppType = typeof app
