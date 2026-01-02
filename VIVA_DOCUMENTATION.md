# 🎓 RECYCONNECT - VIVA DOCUMENTATION

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Dependencies Explained](#dependencies-explained)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Project Flow](#project-flow)
8. [Security Features](#security-features)
9. [Key Features](#key-features)

---

## 1. PROJECT OVERVIEW

### **Project Name:** Recyconnect

### **Description:**
Recyconnect is a MERN stack web application designed to promote sustainability and community engagement through item donation, lost and found services, and peer-to-peer exchanges. Built with React on the frontend and Express.js/Node.js on the backend, the platform enables users to post items for donation, report and search for lost or found belongings, and explore available items within their community. The application features real-time chat functionality powered by Socket.io for direct user communication, Cloudinary integration for image uploads, and JWT-based authentication for secure access. An administrative dashboard provides comprehensive moderation tools to manage users, monitor donations and lost items, handle reported content and user flags, and oversee messaging activity. The system uses PostgreSQL for data persistence and incorporates location-based categorization to help users connect with nearby community members, ultimately facilitating the circular economy by giving items a second life and reducing waste.

### **Objectives:**
- Reduce waste by facilitating item reuse and donation
- Create a trusted community platform for lost & found items
- Enable direct peer-to-peer communication
- Provide robust admin moderation tools
- Ensure data security and user privacy

---

## 2. TECHNOLOGY STACK

### **Frontend:**
- **React 19.1.1** - UI library for building component-based interfaces
- **React Router DOM 7.8.1** - Client-side routing and navigation
- **Bootstrap 5.3.8** - Responsive CSS framework
- **Socket.io Client 4.8.1** - Real-time WebSocket communication

### **Backend:**
- **Node.js** - JavaScript runtime environment
- **Express.js 4.18.2** - Web application framework
- **PostgreSQL** - Relational database management system
- **Socket.io 4.6.1** - Real-time bidirectional communication

### **Authentication & Security:**
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **bcryptjs 2.4.3** - Password hashing
- **Helmet 7.1.0** - Security headers
- **CORS 2.8.5** - Cross-Origin Resource Sharing

### **File Storage:**
- **Cloudinary 1.41.0** - Cloud image storage and CDN
- **Multer 1.4.5** - File upload handling
- **Multer-storage-cloudinary 4.0.0** - Cloudinary integration

### **Development Tools:**
- **Nodemon 3.0.2** - Auto-restart server on changes
- **Morgan 1.10.0** - HTTP request logger
- **dotenv 16.3.1** - Environment variable management

---

## 3. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   React Frontend (Port 3000)                        │   │
│  │   - Components (Login, Dashboard, Explore, etc.)    │   │
│  │   - Services (API calls, Socket.io client)          │   │
│  │   - Context (Theme, Auth state)                     │   │
│  └──────────────────┬──────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │ HTTP/HTTPS Requests
                      │ WebSocket Connection
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Express Backend Server (Port 8080)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                   │   │
│  │  - Helmet (Security)                                │   │
│  │  - CORS (Cross-Origin)                              │   │
│  │  - Authentication (JWT Verify)                      │   │
│  │  - Validation (Express-validator)                   │   │
│  │  - Compression (Response gzip)                      │   │
│  │  - Morgan (Logging)                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes                                             │   │
│  │  /api/users | /api/items | /api/donated-items      │   │
│  │  /api/messages | /api/concerns | /api/flags        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Controllers                                        │   │
│  │  - Business Logic                                   │   │
│  │  - Database Queries                                 │   │
│  │  - Response Formatting                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Socket.io Server (Chat Handler)                   │   │
│  │  - Real-time messaging                              │   │
│  │  - Room management                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────┬──────────────────────┬─────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌──────────────────┐
│   PostgreSQL    │    │   Cloudinary     │
│   Database      │    │   Image Storage  │
│                 │    │   & CDN          │
│  - Users        │    │                  │
│  - Items        │    │  - Upload        │
│  - Donations    │    │  - Transform     │
│  - Messages     │    │  - Deliver URLs  │
│  - Concerns     │    │                  │
│  - Flags        │    │                  │
└─────────────────┘    └──────────────────┘
```

---

## 4. DEPENDENCIES EXPLAINED

### **Backend Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 4.18.2 | Web server framework for building REST APIs |
| `pg` | 8.11.3 | PostgreSQL database client for Node.js |
| `dotenv` | 16.3.1 | Loads environment variables from .env file |
| `bcryptjs` | 2.4.3 | Hash passwords before storing in database |
| `jsonwebtoken` | 9.0.2 | Generate and verify JWT tokens for authentication |
| `helmet` | 7.1.0 | Sets security HTTP headers to protect against attacks |
| `cors` | 2.8.5 | Enable Cross-Origin Resource Sharing for frontend access |
| `cloudinary` | 1.41.0 | Cloud storage service for uploading and hosting images |
| `multer` | 1.4.5 | Middleware for handling multipart/form-data file uploads |
| `multer-storage-cloudinary` | 4.0.0 | Multer plugin to upload directly to Cloudinary |
| `socket.io` | 4.6.1 | WebSocket library for real-time bidirectional chat |
| `express-validator` | 7.0.1 | Validates and sanitizes request data |
| `morgan` | 1.10.0 | HTTP request logger middleware for debugging |
| `compression` | 1.7.4 | Compresses HTTP responses to reduce bandwidth |
| `nodemon` | 3.0.2 | Auto-restarts server when code changes (dev only) |

### **Frontend Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.1.1 | UI library for building component-based interfaces |
| `react-dom` | 19.1.1 | React renderer for web browsers |
| `react-router-dom` | 7.8.1 | Client-side routing for navigation between pages |
| `react-scripts` | 5.0.1 | Build tooling and development server (CRA) |
| `bootstrap` | 5.3.8 | CSS framework for responsive design and styling |
| `socket.io-client` | 4.8.1 | Client-side WebSocket library for real-time chat |

### **Environment Variables (.env):**

**Backend .env:**
```env
PORT=8080                                    # Server port number
DATABASE_URL=postgresql://user:pass@host/db  # PostgreSQL connection string
JWT_SECRET=your_secret_key_here              # Secret key for signing JWT tokens
JWT_EXPIRE=7d                                # Token expiration time (7 days)
CLOUDINARY_CLOUD_NAME=your_cloud_name        # Cloudinary account name
CLOUDINARY_API_KEY=your_api_key              # Cloudinary API key
CLOUDINARY_API_SECRET=your_api_secret        # Cloudinary API secret
FRONTEND_URL=http://localhost:3000           # Frontend URL for CORS
NODE_ENV=development                         # Environment (development/production)
```

**Frontend .env:**
```env
REACT_APP_API_URL=http://localhost:8080/api   # Backend API endpoint
REACT_APP_SOCKET_URL=http://localhost:8080    # Socket.io server URL
```

**Why .env?**
- Keeps sensitive data (passwords, API keys) out of source code
- Allows different configurations for dev/staging/production
- Prevents accidental exposure on version control (Git)

---

## 5. DATABASE SCHEMA

### **Tables:**

1. **users**
   - id, username, email, password (hashed), phone, bio, role, status, created_at

2. **items** (Lost & Found)
   - id, user_id, title, description, category, status, location, image_urls, created_at

3. **donated_items**
   - id, user_id, title, description, category, condition, location, status, is_anonymous, image_urls, created_at

4. **messages**
   - id, sender_id, receiver_id, content, related_item_id, read_at, created_at

5. **user_concerns**
   - id, user_id, title, description, concern_type, priority, status, image_urls, created_at

6. **flags**
   - id, flagger_id, target_type, target_id, reason, severity, status, admin_notes, created_at

7. **reported_items**
   - id, user_id, title, description, type, category, location, status, image_urls, created_at

---

## 6. API DOCUMENTATION

### **Authentication APIs:**
```
POST   /api/users/register      - Create new user account
POST   /api/users/login          - Authenticate and get JWT token
GET    /api/users/profile        - Get current user profile
PUT    /api/users/profile        - Update own profile
PUT    /api/users/change-password - Change password
DELETE /api/users/profile        - Delete own account
```

### **User Management APIs (Admin):**
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get user by ID
PUT    /api/users/:id           - Update user (admin)
DELETE /api/users/:id           - Delete user (admin)
```

### **Item APIs (Lost & Found):**
```
GET    /api/items               - Get all items with filters
POST   /api/items               - Create new item
GET    /api/items/:id           - Get item details
GET    /api/items/user/:userId  - Get user's items
PUT    /api/items/:id           - Update item (owner)
DELETE /api/items/:id           - Delete item (owner)
```

### **Donated Item APIs:**
```
GET    /api/donated-items                - Get all donations
POST   /api/donated-items                - Post donation
GET    /api/donated-items/user/my-donations - Get my donations
PUT    /api/donated-items/:id            - Update donation (owner)
PATCH  /api/donated-items/:id            - Update status
DELETE /api/donated-items/:id            - Delete donation (owner)
```

### **Message APIs:**
```
POST   /api/messages                     - Send message
GET    /api/messages/conversations       - Get conversation list
GET    /api/messages/conversation/:userId - Get chat with user
```

### **Concern APIs:**
```
POST   /api/concerns                     - Submit concern
GET    /api/concerns/my-concerns         - Get my concerns
GET    /api/concerns                     - Get all concerns (admin)
PATCH  /api/concerns/:id                 - Update concern (admin)
DELETE /api/concerns/:id                 - Delete concern
```

### **Flag APIs:**
```
POST   /api/flags                        - Flag content
GET    /api/flags                        - Get all flags (admin)
GET    /api/flags/user/:userId           - Get user flags
GET    /api/flags/target/:type/:id       - Get target flags
PATCH  /api/flags/:id                    - Update flag (admin)
DELETE /api/flags/:id                    - Delete flag (admin)
```

### **Upload APIs:**
```
POST   /api/upload/image                 - Upload single image
POST   /api/upload/images                - Upload multiple images (max 5)
```

---

## 7. PROJECT FLOW

### **A. User Registration & Login Flow:**

```
Step 1: User visits signup page
Step 2: Fill form (username, email, password, phone)
Step 3: Frontend validates inputs (client-side)
Step 4: POST /api/users/register → Backend
Step 5: Express-validator validates data (server-side)
Step 6: bcryptjs hashes password
Step 7: Store user in PostgreSQL database
Step 8: Return success message
Step 9: Redirect to login page
Step 10: Enter email + password
Step 11: POST /api/users/login → Backend
Step 12: Backend checks email exists in database
Step 13: bcryptjs.compare() verifies password hash
Step 14: jsonwebtoken generates JWT token
Step 15: Return token to frontend
Step 16: authUtils.setToken() stores in sessionStorage
Step 17: Redirect to Dashboard
```

### **B. Post Donation Flow:**

```
Step 1: User clicks "Donate Item" button
Step 2: authenticateToken middleware verifies JWT
Step 3: User fills form (title, description, category, condition, location)
Step 4: User uploads image (ImageUpload component)
Step 5: POST /api/upload/image with file
Step 6: Multer receives multipart/form-data
Step 7: Multer-storage-cloudinary uploads to Cloudinary
Step 8: Cloudinary returns image URL
Step 9: User submits form with image URL
Step 10: POST /api/donated-items with data
Step 11: Express-validator validates required fields
Step 12: donatedItemController.createDonatedItem() executes
Step 13: INSERT query to PostgreSQL donated_items table
Step 14: Return success + donated item object
Step 15: Frontend redirects to item details page
Step 16: Display newly created donation
```

### **C. Real-time Chat Flow:**

```
Step 1: User clicks "Message Seller" on item
Step 2: Socket.io client connects to server
Step 3: Emit 'join-room' event with userId
Step 4: chatHandler.js creates/joins room
Step 5: User types message in chat input
Step 6: Emit 'send-message' event with content
Step 7: Backend receives message via Socket.io
Step 8: Save message to PostgreSQL messages table
Step 9: Socket.io broadcasts message to receiver's room
Step 10: Receiver gets real-time update (no refresh needed)
Step 11: Message appears instantly in chat window
Step 12: Update conversation list with latest message
```

### **D. Admin Moderation Flow:**

```
Step 1: Admin logs in with admin credentials
Step 2: isAdmin middleware checks user.role === 'admin'
Step 3: Access AdminDashboard component
Step 4: Navigate tabs (Users, Donations, Flags, Concerns)
Step 5: GET /api/flags?status=pending
Step 6: Display flagged content in table
Step 7: Admin clicks flag to review details
Step 8: Modal opens with flag information
Step 9: Admin takes action:
        - Resolve flag (valid report)
        - Dismiss flag (false report)
        - Delete content (violates policy)
        - Ban user (repeat offender)
Step 10: PATCH /api/flags/:id with status update
Step 11: Database updates flag status
Step 12: Frontend refreshes flag list
Step 13: Email notification sent to reporter (optional)
```

### **E. Complete Request-Response Cycle:**

```
Frontend Action (User clicks button)
        ↓
React Component calls API function (e.g., itemAPI.createItem())
        ↓
api.js apiCall() function executes
        ↓
authUtils.getToken() retrieves JWT from sessionStorage
        ↓
fetch() sends HTTP request with Authorization header
        ↓
Request reaches Express server (port 8080)
        ↓
Morgan logs the request (console)
        ↓
Helmet adds security headers
        ↓
CORS checks if origin is allowed
        ↓
Compression middleware compresses response
        ↓
Express router matches URL pattern (/api/items)
        ↓
Middleware chain executes:
  1. authenticateToken - Verify JWT signature
  2. isAdmin (if needed) - Check user role
  3. validateItem - Validate request body
        ↓
Controller function executes (itemController.createItem)
        ↓
Database query via pg.query()
        ↓
PostgreSQL executes INSERT/SELECT/UPDATE/DELETE
        ↓
Database returns result rows
        ↓
Controller formats response JSON
        ↓
Response sent back through middleware chain
        ↓
Frontend receives response
        ↓
React component updates state
        ↓
UI re-renders with new data
```

---

## 8. SECURITY FEATURES

### **Authentication & Authorization:**
- JWT token-based authentication
- Password hashing with bcrypt (salt rounds: 10)
- Session storage (auto-logout on browser close)
- Role-based access control (user/admin)

### **Validation:**
- Client-side form validation (React)
- Server-side validation (express-validator)
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization)

### **HTTP Security:**
- Helmet middleware sets security headers
- CORS restricts cross-origin requests
- HTTPS recommended for production
- Rate limiting (can be added)

### **Data Protection:**
- Passwords never stored in plain text
- Sensitive data in .env (not committed to Git)
- User can post anonymously (donations)
- Image URLs use Cloudinary CDN (not direct server access)

---

## 9. KEY FEATURES

### **For Users:**
✅ **Donate Items** - Post items for free to help community  
✅ **Lost & Found** - Report and search for lost belongings  
✅ **Browse Items** - Explore available donations and items  
✅ **Real-time Chat** - Direct messaging with other users  
✅ **Image Upload** - Upload photos via Cloudinary  
✅ **Anonymous Donations** - Donate without revealing identity  
✅ **Location-based** - Filter by location/campus  
✅ **Search & Filter** - Find items by category, status, etc.  
✅ **Profile Management** - Update bio, change password  
✅ **Raise Concerns** - Report issues to admins  

### **For Admins:**
✅ **User Management** - View, edit, delete users  
✅ **Content Moderation** - Review flagged items/users  
✅ **Concern Management** - Handle user complaints  
✅ **Donation Oversight** - Monitor all donations  
✅ **Lost & Found Admin** - Manage reported items  
✅ **Message Monitoring** - View chat activity  
✅ **Analytics Dashboard** - View statistics  
✅ **Flag System** - Review and resolve flags  

### **Technical Highlights:**
🚀 **Real-time Updates** - Socket.io WebSocket connection  
🔒 **Secure Authentication** - JWT with bcrypt hashing  
☁️ **Cloud Storage** - Cloudinary for images  
📱 **Responsive Design** - Bootstrap mobile-friendly UI  
⚡ **Performance** - Compression middleware, optimized queries  
🛡️ **Security** - Helmet, CORS, validation, sanitization  
📊 **Scalable** - RESTful API architecture  
🔍 **Advanced Search** - SQL queries with filters  

---

## 10. DEPLOYMENT & HOSTING

### **Recommended Hosting:**
- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** Heroku, Railway, Render, or AWS EC2
- **Database:** ElephantSQL, Heroku Postgres, or AWS RDS
- **Images:** Cloudinary (already integrated)

### **Production Checklist:**
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up proper CORS origins
- [ ] Add rate limiting (express-rate-limit)
- [ ] Enable database connection pooling
- [ ] Set up error monitoring (Sentry)
- [ ] Configure log rotation
- [ ] Add database backups
- [ ] Minify frontend build

---

## 11. POTENTIAL INTERVIEW QUESTIONS & ANSWERS

### **Q1: Why did you choose MERN stack?**
**A:** MERN (MongoDB/PostgreSQL, Express, React, Node.js) allows full-stack JavaScript development, enabling code reuse and faster development. React provides component-based UI, Express simplifies API creation, and Node.js offers event-driven, non-blocking I/O for scalability. We chose PostgreSQL over MongoDB for relational data integrity (users, items, messages require relationships).

### **Q2: How does JWT authentication work?**
**A:** When user logs in, server verifies credentials and generates JWT token signed with secret key. Token contains user ID and role. Frontend stores token in sessionStorage and sends it in Authorization header for protected routes. Server middleware (authenticateToken) verifies token signature and decodes payload to identify user without database lookup each time.

### **Q3: Why Socket.io instead of polling?**
**A:** Socket.io provides real-time bidirectional communication via WebSockets. Traditional polling (periodic HTTP requests) wastes bandwidth and has latency. Socket.io maintains persistent connection, allowing instant message delivery without constant server polling, reducing server load and improving user experience.

### **Q4: How do you prevent SQL injection?**
**A:** We use parameterized queries with pg library. Instead of string concatenation (`SELECT * FROM users WHERE id = ${id}`), we use placeholders (`SELECT * FROM users WHERE id = $1`, [id]). The database driver properly escapes values, preventing malicious SQL code injection.

### **Q5: Explain the image upload flow.**
**A:** User selects file → Multer middleware intercepts multipart/form-data → Multer-storage-cloudinary plugin uploads to Cloudinary cloud → Cloudinary processes, stores, and returns public URL → Backend saves URL in database → Frontend displays image via Cloudinary CDN. This offloads storage from our server and provides fast CDN delivery.

### **Q6: What is middleware and give examples?**
**A:** Middleware functions execute between receiving request and sending response. Examples: `authenticateToken` verifies JWT before protected routes, `express-validator` validates input data, `helmet` adds security headers, `morgan` logs requests, `cors` handles cross-origin requests. They run in sequence as defined in server.js.

### **Q7: How do you handle errors?**
**A:** Backend uses try-catch blocks in controllers, sending appropriate HTTP status codes (400 for validation, 401 for auth, 404 for not found, 500 for server errors). Frontend apiCall() function catches errors, parses error messages, and displays user-friendly notifications. We also log errors for debugging.

### **Q8: Difference between PUT and PATCH?**
**A:** PUT replaces entire resource (update profile with all fields), PATCH updates specific fields (update only item status). We use PUT for /api/users/profile (full update) and PATCH for /api/donated-items/:id (status change only).

### **Q9: Why separate frontend and backend?**
**A:** Separation of concerns - frontend handles UI/UX, backend handles business logic. Allows independent scaling (scale frontend CDN separately from backend servers), easier testing, and flexibility to build mobile app using same API later.

### **Q10: How would you scale this application?**
**A:** 
- Horizontal scaling: Multiple backend servers behind load balancer
- Database: Read replicas for queries, caching layer (Redis) for frequent data
- Frontend: CDN distribution for static assets
- Socket.io: Redis adapter for multi-server WebSocket sync
- Image optimization: Cloudinary transformations for responsive images
- API: Rate limiting, pagination, lazy loading

---

## 12. PROJECT STATISTICS

**Total Lines of Code:** ~5000+ lines  
**Backend Files:** 25+ files  
**Frontend Components:** 15+ components  
**API Endpoints:** 40+ endpoints  
**Database Tables:** 7 tables  
**Dependencies:** 15 backend + 6 frontend  

**Development Time:** ~2-3 months  
**Team Size:** 1-4 developers  
**Target Users:** College students, community members  

---

## 13. CONCLUSION

Recyconnect successfully demonstrates full-stack web development principles, combining modern technologies to create a practical solution for community sustainability. The project showcases proficiency in:

- RESTful API design and implementation
- Real-time communication with WebSockets
- Secure authentication and authorization
- Database design and SQL queries
- Cloud service integration (Cloudinary)
- Responsive UI development with React
- Security best practices
- Error handling and validation

**Future Enhancements:**
- Email notifications for messages/concerns
- Mobile app (React Native)
- AI-based item matching (lost & found)
- Payment integration for premium features
- Analytics dashboard for admins
- Multi-language support
- Push notifications
- Geolocation for nearby items

---

## 14. REPOSITORY & CONTACT

**GitHub:** [Your Repository URL]  
**Live Demo:** [Deployment URL if available]  
**Developer:** [Your Name]  
**Email:** [Your Email]  
**LinkedIn:** [Your LinkedIn]  

**Documentation Date:** December 23, 2025

---

**Good Luck with Your Viva! 🎓✨**
