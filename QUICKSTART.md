# 🚀 Quick Start Guide - Recyconnect

## ⚡ Fast Local Setup (5 minutes)

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (free)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd Recyconnect-mern

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 3. Database Setup
```bash
# Create database
createdb recyconnect_db

# Run schema
cd backend
psql -d recyconnect_db -f database/schema.sql

# Run migrations
psql -d recyconnect_db -f database/add_user_fields.sql
psql -d recyconnect_db -f database/add_anonymity_to_donated_items.sql
psql -d recyconnect_db -f database/add_user_status.sql
psql -d recyconnect_db -f database/add_image_urls_to_concerns.sql
```

### 4. Environment Variables

**Backend (.env):**
```env
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=recyconnect_db
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8080
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

### 7. Test Credentials

**Admin:**
- Email: `admin@chitkara.edu.in`
- College Code: `CHIT01`
- Password: `admin@chitkara.edu.in`

**User:**
- Email: `user@chitkara.edu.in`
- College Code: `CHIT01`
- Password: `user@chitkara.edu.in`

## 📚 Full Documentation

- **Deployment Guide:** See `VERCEL_DEPLOYMENT.md`
- **Complete README:** See `README.md`
- **Viva Documentation:** See `VIVA_DOCUMENTATION.md`

## 🔧 Common Issues

**Database connection failed:**
```bash
# Make sure PostgreSQL is running
sudo service postgresql start  # Linux
brew services start postgresql # Mac
# Windows: Check Services app
```

**Port already in use:**
```bash
# Change PORT in backend/.env to 8081 or other
# Update VITE_API_URL in frontend/.env accordingly
```

**Images not uploading:**
- Verify Cloudinary credentials
- Check API key permissions in Cloudinary dashboard

## 🎯 Next Steps

1. ✅ Test all features
2. ✅ Customize branding
3. ✅ Deploy to production (see VERCEL_DEPLOYMENT.md)
4. ✅ Add custom domain

---

**Need help?** Check README.md or deployment guide!
