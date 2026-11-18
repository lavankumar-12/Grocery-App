const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')

dotenv.config({ path: path.join(__dirname, '.env') })

const productRoutes = require('./routes/ProductRoutes')
const adminRoutes = require('./routes/AdminRoutes')
const emailRoutes = require('./routes/emailRoutes')
const cartRoutes = require('./routes/cartRoutes')

const app = express()

// CORS configuration: allow CLIENT_URL (comma-separated) or all origins when unset
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
)

app.use(express.json())

// Ensure uploads directory exists on fresh cloud deployments
const uploadsDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MONGO DB Connected Successfully')
  })
  .catch((err) => {
    console.error('MongoDB Connection Failed:', err.message)
  })

// Health check endpoint for cloud platforms (Railway, Render, etc.)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
  })
})

app.use('/api', productRoutes)
app.use('/uploads', express.static(uploadsDir))
app.use('/admin', adminRoutes)
app.use('/email', emailRoutes)
app.use('/cart', cartRoutes)

// Serve built React frontend automatically for single-service deployments
const frontendDistDir = path.join(__dirname, '..', 'frontend', 'dist')
const frontendIndexHtml = path.join(frontendDistDir, 'index.html')

if (fs.existsSync(frontendIndexHtml)) {
  app.use(express.static(frontendDistDir))
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api') &&
      !req.path.startsWith('/admin/') &&
      !req.path.startsWith('/email') &&
      !req.path.startsWith('/cart') &&
      !req.path.startsWith('/uploads') &&
      !req.path.startsWith('/health')
    ) {
      return res.sendFile(frontendIndexHtml)
    }
    // Also support client-side /admin/login and /admin/dashboard SPA routes on browser refresh
    if (
      req.method === 'GET' &&
      (req.path === '/admin' || req.path === '/admin/login' || req.path === '/admin/dashboard')
    ) {
      return res.sendFile(frontendIndexHtml)
    }
    return next()
  })
}

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`)
})
