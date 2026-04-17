# 🌐 SocialNet — Full-Stack Social Network

A modern social network built with React + Node.js + MongoDB + Socket.io.

## ✨ Features

- 🔐 **Auth** — Register / Login with JWT, bcrypt password hashing
- 📰 **Feed** — Infinite scroll, create posts with images, like & comment
- 👤 **Profiles** — Edit username, bio, avatar; view user posts
- 💬 **Messages** — Real-time chat via Socket.io, typing indicators
- 🌙 **Dark Mode** — Smooth theme toggle persisted to localStorage
- 📱 **Responsive** — Mobile-first design, bottom nav on mobile
- 🛡️ **Security** — XSS protection, JWT-protected routes, input validation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

---

### 1. Backend Setup

```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

The server starts at **http://localhost:5000**

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app opens at **http://localhost:5173**

---

## ⚙️ Environment Variables (server/.env)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/socialnet` |
| `JWT_SECRET` | Secret key for JWT signing | `change_this_to_something_long` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

> **Note:** Cloudinary is optional. If you skip it, post images work via URL input.

---

## 📁 Project Structure

```
socialnet/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Avatar.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── MessageItem.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── SkeletonCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── globals.css
│   └── package.json
│
└── server/                 # Node.js + Express backend
    ├── config/db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── messageController.js
    │   ├── postController.js
    │   └── userController.js
    ├── middleware/authMiddleware.js
    ├── models/
    │   ├── Message.js
    │   ├── Post.js
    │   └── User.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── messageRoutes.js
    │   ├── postRoutes.js
    │   └── userRoutes.js
    ├── server.js
    └── package.json
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts?page=1&limit=10` | Get paginated feed |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |
| GET | `/api/posts/user/:userId` | Get user's posts |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update profile |
| GET | `/api/users/search?q=query` | Search users |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get conversations list |
| GET | `/api/messages/:userId` | Get chat history |
| POST | `/api/messages` | Send message |

---

## 🎨 Tech Stack

**Frontend:** React 18, Vite, TailwindCSS, React Router v6, Axios, Socket.io-client, react-hot-toast, date-fns

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Socket.io, express-validator, xss

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** tokens with 30-day expiry
- **XSS sanitisation** on all user-generated text
- **express-validator** input validation
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`)
- Protected API routes via auth middleware
- CORS restricted to frontend origin

---

## 📱 Screenshots

The app includes:
- Minimalist light/dark theme (Instagram/Threads-inspired)
- Animated post feed with staggered entrance
- Real-time heart animation on likes
- Skeleton loading states
- Fully responsive mobile layout with bottom nav
- Real-time chat with typing indicators

---

## 🚢 Deployment

### Frontend (Vercel / Netlify)
```bash
cd client
npm run build
# Upload /dist folder
```

### Backend (Railway / Render / DigitalOcean)
```bash
cd server
# Set environment variables in dashboard
npm start
```

> Remember to update `CLIENT_URL` in server `.env` to your production frontend URL.
