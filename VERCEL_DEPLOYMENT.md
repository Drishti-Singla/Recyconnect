# 🚀 Complete Vercel Deployment Guide for Recyconnect

This guide provides step-by-step instructions for deploying both backend and frontend to Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Cloudinary account
- PostgreSQL database (we'll set this up)

## 🔧 Part 1: Prepare Your Code

### 1.1 Create Vercel Configuration for Backend

Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }
  ]
}
```

### 1.2 Update Backend for Serverless

Edit `backend/server.js` - add this at the end:

```javascript
// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
```

### 1.3 Update CORS Configuration

In `backend/server.js`, update CORS settings:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 1.4 Create Frontend Environment File

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-app.vercel.app
```

### 1.5 Update Frontend API Configuration

Verify `frontend/src/services/api.ts` has:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

## 🗄️ Part 2: Setup PostgreSQL Database

### Option A: Vercel Postgres (Recommended - Simple)

1. **Go to Vercel Dashboard**
   - Select your project (create one if needed)
   - Navigate to **Storage** tab
   - Click **Create Database**
   - Select **Postgres**

2. **Get Connection Details**
   - Vercel will provide connection strings
   - Copy the `POSTGRES_URL` for later use

3. **Connect and Run Schema**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Pull environment variables
   vercel env pull

   # Connect to database
   psql "YOUR_POSTGRES_URL_FROM_VERCEL"

   # Run schema
   \i backend/database/schema.sql

   # Run migrations
   \i backend/database/add_user_fields.sql
   \i backend/database/add_anonymity_to_donated_items.sql
   \i backend/database/add_user_status.sql
   \i backend/database/add_image_urls_to_concerns.sql
   ```

### Option B: Neon (Free Tier, Recommended Alternative)

1. **Sign up at [Neon](https://neon.tech/)**
   - Create new project
   - Copy connection string

2. **Connect and Setup**
   ```bash
   # Connect using psql
   psql "postgresql://user:password@endpoint.region.neon.tech/dbname?sslmode=require"

   # Run all SQL files
   \i backend/database/schema.sql
   \i backend/database/add_user_fields.sql
   \i backend/database/add_anonymity_to_donated_items.sql
   \i backend/database/add_user_status.sql
   \i backend/database/add_image_urls_to_concerns.sql
   ```

### Option C: Supabase (Free Tier with Extra Features)

1. **Sign up at [Supabase](https://supabase.com/)**
   - Create new project
   - Wait for database to initialize
   - Go to **Settings** → **Database**
   - Copy connection string (Connection pooling)

2. **Run Schema via Supabase Dashboard**
   - Go to **SQL Editor**
   - Paste contents of `schema.sql`
   - Click **Run**
   - Repeat for migration files

## 🚀 Part 3: Deploy Backend to Vercel

### 3.1 Push Code to GitHub

```bash
cd Recyconnect-mern
git init
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/recyconnect.git
git push -u origin main
```

### 3.2 Deploy Backend via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New..." → "Project"**

3. **Import Git Repository**
   - Connect your GitHub account
   - Select your repository
   - Click **Import**

4. **Configure Backend Project**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

5. **Add Environment Variables** (Click "Environment Variables")
   
   Add these one by one:

   ```
   NODE_ENV=production
   PORT=8080
   
   # Database (use your connection string from Part 2)
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   
   # OR individual variables
   DB_HOST=your-host.postgres.database.azure.com
   DB_PORT=5432
   DB_NAME=recyconnect_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your_super_secret_key_minimum_32_characters_long_change_this
   JWT_EXPIRE=7d
   
   # Cloudinary (from your Cloudinary dashboard)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email (optional - for feedback notifications)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ADMIN_EMAIL=admin@email.com
   
   # Frontend URL (you'll update this after frontend deployment)
   FRONTEND_URL=http://localhost:5173
   ```

6. **Deploy**
   - Click **Deploy**
   - Wait for deployment to complete
   - **Copy the deployment URL** (e.g., `https://recyconnect-backend.vercel.app`)

7. **Update FRONTEND_URL**
   - After frontend is deployed, come back here
   - Go to Settings → Environment Variables
   - Update `FRONTEND_URL` to your frontend URL
   - Redeploy

### 3.3 Test Backend

Visit `https://your-backend.vercel.app/api/users/` - you should see API response

## 🎨 Part 4: Deploy Frontend to Vercel

### 4.1 Update Environment Variables

Create/update `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.vercel.app
```

Commit this change:

```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push
```

### 4.2 Deploy Frontend via Vercel Dashboard

1. **Click "Add New..." → "Project"** (or use the same project)

2. **If creating new project:**
   - Import same repository
   - Configure as separate deployment

3. **Configure Frontend Project**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```

5. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - **Copy the frontend URL** (e.g., `https://recyconnect.vercel.app`)

### 4.3 Update Backend FRONTEND_URL

1. Go to backend project on Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your new frontend URL
4. Redeploy backend:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## ✅ Part 5: Post-Deployment Setup

### 5.1 Create Admin User

Connect to your production database and run:

```sql
-- Create admin user
INSERT INTO users (username, email, password, phone, role, college_code, created_at)
VALUES (
  'admin',
  'admin@chitkara.edu.in',
  '$2a$10$8K1p/a0dL3.GyVMeRUqX2exZpCd7Jf9mFWHr3p1Fm8Zh4UqGJ5bvS', -- password: admin@chitkara.edu.in
  '1234567890',
  'admin',
  'CHIT01',
  NOW()
);

-- Create test user
INSERT INTO users (username, email, password, phone, role, college_code, created_at)
VALUES (
  'testuser',
  'user@chitkara.edu.in',
  '$2a$10$lYPj8Ua/qI5d8dN1ZqPkEOWmXQY0qJZrjfN7CchZgBqHxXCvJl5RG', -- password: user@chitkara.edu.in
  '9876543210',
  'user',
  'CHIT01',
  NOW()
);
```

Or use the script (update with production DB credentials):

```bash
# Update backend/scripts/createAdmin.js with production DATABASE_URL
DATABASE_URL="your_production_url" node backend/scripts/createAdmin.js
```

### 5.2 Test Your Application

1. **Visit your frontend URL**
   - Example: `https://recyconnect.vercel.app`

2. **Test Login**
   - Admin: `admin@chitkara.edu.in` / `CHIT01` / `admin@chitkara.edu.in`
   - User: `user@chitkara.edu.in` / `CHIT01` / `user@chitkara.edu.in`

3. **Test Features**
   - ✅ User registration
   - ✅ Login/logout
   - ✅ Post donation item
   - ✅ Post marketplace item
   - ✅ Report lost/found item
   - ✅ Browse explore page
   - ✅ Upload images
   - ✅ Send messages (real-time chat)
   - ✅ Submit feedback
   - ✅ Admin dashboard (with admin account)

### 5.3 Configure Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to project Settings
   - Click **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables:**
   - Update `FRONTEND_URL` in backend
   - Update `VITE_API_URL` in frontend
   - Redeploy both

## 🔍 Part 6: Monitoring & Troubleshooting

### View Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View backend logs
vercel logs YOUR_BACKEND_PROJECT_URL

# View frontend logs  
vercel logs YOUR_FRONTEND_PROJECT_URL
```

### Common Issues

**Issue: CORS Error**
- Solution: Ensure `FRONTEND_URL` in backend matches your exact frontend URL
- Redeploy backend after updating

**Issue: Database Connection Failed**
- Check `DATABASE_URL` format
- Ensure `?sslmode=require` is added for most hosted DBs
- Test connection string locally first

**Issue: 500 Internal Server Error**
- Check Vercel logs: `vercel logs`
- Verify all environment variables are set
- Check database connection

**Issue: Images Not Uploading**
- Verify Cloudinary credentials
- Check API key permissions
- Test Cloudinary directly

**Issue: Real-time Chat Not Working**
- Note: Vercel Serverless has limitations with WebSockets
- Consider using Vercel Edge Functions or Railway for backend
- Alternative: Use Pusher or Ably for production chat

### WebSocket Limitations on Vercel

⚠️ **Important:** Vercel serverless functions have a 10-second timeout and don't support persistent WebSocket connections well.

**Solutions:**

1. **Use Railway for Backend** (Recommended for production)
   - Deploy backend to Railway (persistent server)
   - Keep frontend on Vercel
   - Railway has better WebSocket support

2. **Use Pusher/Ably for Chat**
   - Replace Socket.io with managed service
   - More reliable for serverless

3. **Use Vercel Edge Functions**
   - Experimental WebSocket support
   - Requires code refactoring

## 📊 Part 7: Monitoring

### Setup Vercel Analytics

1. Go to your project on Vercel
2. Navigate to **Analytics** tab
3. Enable Web Analytics
4. Add tracking code if needed

### Database Monitoring

- **Neon:** Built-in monitoring dashboard
- **Supabase:** Built-in monitoring + logs
- **Vercel Postgres:** Built-in monitoring

## 🔄 Continuous Deployment

Every push to your main branch will automatically trigger a new deployment!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel will automatically deploy!
```

## 📱 Share Your App

Your app is now live! Share these URLs:

- **Frontend:** `https://recyconnect.vercel.app`
- **Backend API:** `https://recyconnect-backend.vercel.app`
- **Admin Panel:** `https://recyconnect.vercel.app/admin`

## 🎉 You're Done!

Your Recyconnect application is now deployed and accessible worldwide!

---

**Need Help?**
- Check Vercel Logs
- Review Vercel Documentation
- Check database provider documentation
- Review this guide again

**Good luck! 🚀**
