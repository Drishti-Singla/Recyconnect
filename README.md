# 🌱 Recyconnect - Sustainable Community Platform

**A full-stack MERN application promoting sustainability through item donation, marketplace, and lost & found services**

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎁 Core Features
- ✅ **Item Marketplace** - Buy and sell within community
- ✅ **Donation System** - Post items for free
- ✅ **Lost & Found** - Report and search items
- ✅ **Real-time Chat** - Direct messaging
- ✅ **User Authentication** - Secure JWT-based auth
- ✅ **Image Upload** - Cloudinary integration

</td>
<td width="50%">

### 🛡️ Admin Features
- ✅ **User Management** - Moderate users
- ✅ **Content Moderation** - Review items/concerns
- ✅ **Analytics Dashboard** - Usage statistics
- ✅ **Flag System** - Report inappropriate content
- ✅ **Messaging Monitor** - Oversee conversations
- ✅ **Bulk Actions** - Efficient moderation

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

**Frontend:** React 19.1.1, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4

**Backend:** Node.js 18+, Express 4.18, PostgreSQL 14+, Socket.io 4.8

**Services:** Cloudinary (Image Storage), Vercel (Hosting)

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
Cloudinary Account
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Drishti-Singla/Recyconnect.git
cd Recyconnect
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Setup database
createdb recyconnect_db
psql -d recyconnect_db -f database/schema.sql

# Start backend
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Start frontend
npm run dev
```

4. **Access Application**
```
Frontend: http://localhost:5173
Backend:  http://localhost:8080
```

---

## 🎮 Demo Credentials

| Role  | Email | College Code | Password |
|-------|-------|--------------|----------|
| **Admin** | admin@chitkara.edu.in | CHIT01 | admin@chitkara.edu.in |
| **User** | user@chitkara.edu.in | CHIT01 | user@chitkara.edu.in |

---

## 📁 Project Structure

```
Recyconnect/
├── backend/
│   ├── config/          # Database, Cloudinary config
│   ├── controllers/     # Business logic
│   ├── database/        # SQL schema & migrations
│   ├── middleware/      # Auth, validation
│   ├── routes/          # API endpoints
│   ├── socket/          # Real-time chat handlers
│   ├── utils/           # Email service, helpers
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── services/    # API client
    │   ├── hooks/       # Custom React hooks
    │   └── lib/         # Utilities
    └── public/          # Static assets
```

---

## 🌐 API Endpoints

<details>
<summary><b>Authentication</b></summary>

```
POST   /api/users/register     - Register new user
POST   /api/users/login        - Login user
GET    /api/users/profile      - Get profile (protected)
PUT    /api/users/profile      - Update profile (protected)
```
</details>

<details>
<summary><b>Items & Donations</b></summary>

```
GET    /api/items              - Get marketplace items
POST   /api/items              - Create item (protected)
GET    /api/donated-items      - Get donated items
POST   /api/donated-items      - Create donation (protected)
GET    /api/reported           - Get lost/found reports
POST   /api/reported           - Report item (protected)
```
</details>

<details>
<summary><b>Chat & Messaging</b></summary>

```
GET    /api/messages/conversations    - Get conversations
POST   /api/messages                  - Send message
WebSocket: /                          - Real-time chat
```
</details>

---

## 🎨 Features Showcase

### 🔐 Secure Authentication
- JWT-based authentication
- Password hashing with bcryptjs
- College email verification
- Role-based access control (Admin/User)

### 📱 Responsive Design
- Mobile-first approach
- Dark/Light theme support
- Smooth animations
- Accessible UI components (shadcn/ui)

### 💬 Real-time Chat
- Socket.io powered messaging
- Online status indicators
- Typing indicators
- Message read receipts

### 🖼️ Image Management
- Cloudinary integration
- Multiple image uploads
- Image preview before upload
- Optimized delivery via CDN

### 🛡️ Admin Features
- User moderation (suspend/activate)
- Content review and approval
- Analytics dashboard
- Bulk actions
- Flag management system

---

## 🔒 Security Features

- ✅ Password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Input validation (express-validator)

---

## 🚢 Deployment

### Deploy to Vercel

**Backend:**
1. Import repository to Vercel
2. Set root directory: `backend`
3. Add environment variables
4. Deploy

**Frontend:**
1. Import repository to Vercel
2. Set root directory: `frontend`
3. Framework: Vite
4. Add `VITE_API_URL` env variable
5. Deploy



---

## 👥 Team

**Drishti Singla**
- Email: drishtisingla868@gmail.com
- Phone: +91 6239336010

**Team Member**
- Email: asthabalda777@gmail.com
- Phone: +91 70270 50244

---

## 🙏 Acknowledgments

- Chitkara University - For the opportunity
- shadcn/ui - Amazing UI components
- Cloudinary - Image hosting
- Vercel - Deployment platform

---

## 📞 Support

For support, email drishtisingla868@gmail.com or create an issue in this repository.

---



