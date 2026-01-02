# Recyconnect Frontend

React + TypeScript + Vite frontend for the Recyconnect sustainable community platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:5173

## 🛠️ Tech Stack

- **React 19.1.1** - UI Library
- **TypeScript** - Type safety
- **Vite 5.4.21** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router DOM** - Routing
- **Socket.io Client** - Real-time chat

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer
│   └── ui/             # shadcn components
├── pages/              # All page components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Explore.tsx
│   ├── Donate.tsx
│   ├── LostFound.tsx
│   ├── Feedback.tsx
│   └── Admin.tsx
├── services/
│   └── api.ts          # API client
├── hooks/              # Custom hooks
├── lib/                # Utilities
├── App.tsx
└── main.tsx
```

## 🔧 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

For production, use `.env.production`:

```env
VITE_API_URL=https://your-backend.vercel.app
```

## 📦 Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Features

- ✅ Responsive design (mobile-first)
- ✅ Dark/Light theme support
- ✅ Real-time chat
- ✅ Image upload with preview
- ✅ Advanced filtering
- ✅ Admin dashboard
- ✅ User authentication
- ✅ Form validation

## 🚀 Deployment

See `VERCEL_DEPLOYMENT.md` for complete deployment instructions.

Quick deploy to Vercel:

```bash
npm run build
vercel
```

## 📝 License

MIT

