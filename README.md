# 🌱 Recyconnect - Sustainable Community Platform

A full-stack MERN application promoting sustainability through item donation, marketplace, and lost & found services with real-time chat functionality.

## 🚀 Features

- ✅ **Item Marketplace** - Buy and sell items within the community
- ✅ **Donation System** - Post items for free donation (with anonymity option)
- ✅ **Lost & Found** - Report and search for lost/found items
- ✅ **Real-time Chat** - Direct messaging with Socket.io
- ✅ **Admin Dashboard** - Comprehensive moderation tools
- ✅ **Image Upload** - Cloudinary integration for image storage
- ✅ **Secure Authentication** - JWT-based auth with password hashing
- ✅ **User Concerns** - Report issues and provide feedback

## 📋 Demo Credentials

**Admin Account:**
- Email: `admin@chitkara.edu.in`
- College Code: `CHIT01`
- Password: `admin@chitkara.edu.in`

**User Account:**
- Email: `user@chitkara.edu.in`
- College Code: `CHIT01`
- Password: `user@chitkara.edu.in`

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Socket.io Client
- React Router DOM

### Backend
- Node.js + Express.js
- PostgreSQL
- Socket.io
- JWT Authentication
- Cloudinary (Image Storage)
- Nodemailer (Email Service)

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Cloudinary Account

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   
   Create `.env` file in `backend/` directory:
   ```env
   # Server
   PORT=8080
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=recyconnect_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email (Optional - for feedback notifications)
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASSWORD=your_app_password
   ADMIN_EMAIL=admin@email.com
   ```

3. **Setup PostgreSQL Database:**
   ```bash
   # Create database
   createdb recyconnect_db

   # Run schema
   psql -U your_username -d recyconnect_db -f database/schema.sql

   # Run migrations (if any)
   psql -U your_username -d recyconnect_db -f database/add_user_fields.sql
   psql -U your_username -d recyconnect_db -f database/add_anonymity_to_donated_items.sql
   ```

4. **Create admin user (optional):**
   ```bash
   node scripts/createAdmin.js
   ```

5. **Start backend server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment (if needed):**
   
   Create `.env` file in `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

## 🌐 Deployment on Vercel

### Backend Deployment (Vercel)

1. **Prepare backend for Vercel:**
   
   Create `vercel.json` in `backend/` directory:
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
         "dest": "/server.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

2. **Setup PostgreSQL (Choose one):**
   
   **Option A: Vercel Postgres (Recommended)**
   - Go to your Vercel project
   - Navigate to Storage tab
   - Create new Postgres database
   - Copy connection string

   **Option B: External PostgreSQL**
   - Use Neon, Supabase, or Railway
   - Get connection string

3. **Deploy to Vercel:**
   ```bash
   cd backend
   vercel
   ```

4. **Configure Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env` file:
     - `DATABASE_URL` (PostgreSQL connection string)
     - `JWT_SECRET`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `FRONTEND_URL` (your frontend URL)
     - `EMAIL_USER`, `EMAIL_PASSWORD`, `ADMIN_EMAIL` (optional)

5. **Update CORS settings:**
   
   In `server.js`, update CORS to allow your frontend domain:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
     credentials: true
   }));
   ```

### Frontend Deployment (Vercel)

1. **Update API URL:**
   
   Create `.env.production` in `frontend/`:
   ```env
   VITE_API_URL=https://your-backend.vercel.app
   ```

2. **Update API configuration:**
   
   In `frontend/src/services/api.ts`, ensure base URL uses environment variable:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
   ```

3. **Build and deploy:**
   ```bash
   cd frontend
   npm run build
   vercel
   ```

4. **Configure Vercel:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Post-Deployment Steps

1. **Run database migrations on production:**
   ```bash
   # Connect to your production database
   psql YOUR_PRODUCTION_DATABASE_URL -f database/schema.sql
   ```

2. **Create admin user:**
   ```bash
   # Update backend/scripts/createAdmin.js with production DB connection
   node scripts/createAdmin.js
   ```

3. **Test the application:**
   - Visit your frontend URL
   - Login with demo credentials
   - Test all major features:
     - User registration/login
     - Post donation/marketplace items
     - Report lost/found items
     - Send messages
     - Admin dashboard (if admin)

4. **Monitor logs:**
   ```bash
   vercel logs YOUR_PROJECT_NAME
   ```

## 📱 Project Structure

```
Recyconnect-mern/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── chatController.js
│   │   ├── concernController.js
│   │   ├── donatedItemController.js
│   │   ├── itemController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── migrations/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   ├── concernRoutes.js
│   │   ├── donatedItemRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── reportedItemRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── socket/
│   │   └── chatHandler.js
│   ├── utils/
│   │   └── emailService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── ui/ (shadcn components)
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── Donate.tsx
│   │   │   ├── LostFound.tsx
│   │   │   ├── Feedback.tsx
│   │   │   ├── RaiseConcern.tsx
│   │   │   └── Admin.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- HTTP-only cookies (if implemented)
- Helmet.js security headers
- CORS protection
- SQL injection prevention (parameterized queries)
- Input validation with express-validator
- XSS protection

## 📊 Database Schema

### Main Tables
- **users** - User accounts and authentication
- **items** - Marketplace items (for sale)
- **donated_items** - Free donation items
- **reported_items** - Lost & found reports
- **messages** - Direct messaging
- **user_concerns** - User feedback and reports
- **flags** - Content moderation flags

See `backend/database/schema.sql` for complete schema.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [Your Email]

## 🙏 Acknowledgments

- Chitkara University
- All contributors and testers
- Open source community

---

**Built with ❤️ for a sustainable future**
