# Recyconnect Backend

Backend server for Recyconnect application built with Express, Node.js, PostgreSQL, Cloudinary, and Socket.io.

## Features

- ✅ RESTful API with Express.js
- ✅ PostgreSQL database
- ✅ JWT authentication
- ✅ Cloudinary image storage
- ✅ Real-time chat with Socket.io
- ✅ User management
- ✅ Items marketplace
- ✅ Donation system
- ✅ Lost & Found reporting
- ✅ Messaging system
- ✅ User concerns & flags
- ✅ Admin dashboard support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Cloudinary account (free tier available)

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:
   - Database credentials (PostgreSQL)
   - JWT secret key
   - Cloudinary credentials (cloud_name, api_key, api_secret)

3. **Set up PostgreSQL database:**
   
   Create a database:
   ```sql
   CREATE DATABASE recyconnect;
   ```

   Run the schema:
   ```bash
   psql -U your_username -d recyconnect -f database/schema.sql
   ```

4. **Start the server:**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

   Server will run on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create item (protected)
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item (protected)
- `DELETE /api/items/:id` - Delete item (protected)

### Donated Items
- `GET /api/donated-items` - Get all donated items
- `POST /api/donated-items` - Create donated item (protected)
- `GET /api/donated-items/:id` - Get donated item by ID
- `PUT /api/donated-items/:id` - Update donated item (protected)
- `DELETE /api/donated-items/:id` - Delete donated item (protected)

### Reported Items (Lost & Found)
- `GET /api/reported` - Get all reported items
- `POST /api/reported` - Create reported item (protected)
- `GET /api/reported/:id` - Get reported item by ID
- `PUT /api/reported/:id` - Update reported item (protected)
- `DELETE /api/reported/:id` - Delete reported item (protected)

### Messages
- `POST /api/messages` - Send message (protected)
- `GET /api/messages/conversations` - Get conversations (protected)
- `GET /api/messages/conversation/:userId` - Get conversation with user (protected)
- `GET /api/messages/unread-count` - Get unread count (protected)

### Chat (Real-time)
- `GET /api/chat/conversations` - Get chat conversations (protected)
- `GET /api/chat/messages/:userId` - Get chat messages (protected)
- `POST /api/chat/messages` - Send chat message (protected)

### Concerns
- `POST /api/concerns` - Create concern (protected)
- `GET /api/concerns` - Get all concerns (admin)
- `GET /api/concerns/my-concerns` - Get user's concerns (protected)
- `PATCH /api/concerns/:id` - Update concern status (protected)

### Flags
- `POST /api/flags` - Create flag (protected)
- `GET /api/flags` - Get all flags (admin)
- `GET /api/flags/target/:targetType/:targetId` - Get flags for target
- `GET /api/flags/count/:targetType/:targetId` - Get flag counts

### Upload
- `POST /api/upload/image` - Upload single image (protected)
- `POST /api/upload/images` - Upload multiple images (protected)

## Socket.io Events

### Client to Server
- `chat_message` - Send chat message
- `typing` - Send typing indicator
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room
- `message_read` - Mark message as read
- `get_online_users` - Get list of online users

### Server to Client
- `new_chat_message` - Receive new message
- `message_sent` - Message sent confirmation
- `user_typing` - User is typing
- `user_online` - User online status
- `online_users` - List of online users
- `message_read_receipt` - Message read confirmation

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `items` - Marketplace items
- `donated_items` - Items for donation
- `reported_items` - Lost & found items
- `messages` - Direct messages
- `chat_messages` - Real-time chat messages
- `user_concerns` - User concerns/reports
- `flags` - Content flagging system

See `database/schema.sql` for complete schema.

## Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Add them to your `.env` file

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Helmet.js for security headers
- CORS protection
- Input validation with express-validator
- SQL injection prevention with parameterized queries

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name recyconnect-api
   ```

## License

MIT

## Support

For issues or questions, please contact the development team.
