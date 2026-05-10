# WatchHell 🚀

**WatchHell** is a full-stack creator streaming studio built with React, Vite, Node.js, Express, and MongoDB.

It supports:
- user authentication
- video uploads
- comments and likes
- subscriptions
- profile and settings management
- Cloudinary image uploads

---

## ⭐ Highlights

- Modern React + Vite frontend
- Backend API with Express and MongoDB
- JWT authentication with refresh token support
- Profile settings for username, full name, email, and password
- Clean separate Settings page
- Deployment-ready structure for Vercel + Render

---

## 🧰 Tech Stack

- Frontend: **React**, **Vite**, **Tailwind CSS**, **React Router**
- Backend: **Node.js**, **Express**, **MongoDB**, **Mongoose**
- Auth: **JWT**
- Uploads: **Cloudinary**
- Deploy: **Vercel** (frontend) + **Render** (backend)

---

## 📁 Repo structure

- `client/` — React frontend app
- `src/` — backend source code
- `src/app.js` — Express app and route registration
- `src/index.js` — backend entry point
- `src/controllers/` — request handlers
- `src/routes/` — API routes
- `src/models/` — Mongoose schemas
- `src/utils/` — helpers, error wrappers, Cloudinary helper

---

## 🚀 Local setup

### 1. Install dependencies

```bash
cd "c:\Users\Lenovo\OneDrive\Documents\New project\WatchHell"
npm install
cd client
npm install
```

### 2. Configure backend env

Create `./.env` in the backend root.

> These are example variables only — do not commit secrets.

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173,https://watch-hell.vercel.app
ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Configure frontend env (optional)

Create `client/.env` for local frontend API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

> `VITE_API_BASE_URL` is read at build time, so frontend must be rebuilt after changing it.

### 4. Run locally

Backend:

```bash
cd "c:\Users\Lenovo\OneDrive\Documents\New project\WatchHell"
npm run dev
```

Frontend:

```bash
cd "c:\Users\Lenovo\OneDrive\Documents\New project\WatchHell\client"
npm run dev
```

Open the Vite app URL shown in the terminal.

---

## ☁️ Deployment

### Backend on Render

This repo uses **Render** for backend deployment.

- Deploy the backend service on **Render**
- Add the same env vars from your local `.env`
- Set `CORS_ORIGIN` to your frontend domain:

```text
https://watch-hell.vercel.app
```

> Do not use `*` with `credentials: true`.

### Frontend on Vercel

- Deploy the `client/` app on **Vercel**
- Add this env var in Vercel:

```text
VITE_API_BASE_URL=https://<your-render-backend-domain>/api/v1
```

- Redeploy the app after saving the variable.

---

## 🔌 Main API endpoints

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/logout`
- `GET /api/v1/users/current-user`
- `PATCH /api/v1/users/update-account`
- `POST /api/v1/users/password-change`
- `GET /api/v1/video`
- `POST /api/v1/video`
- `GET /api/v1/comment/:videoId`
- `POST /api/v1/comment/:videoId`

---

## 📝 Notes

- Keep secret keys out of GitHub.
- `VITE_API_BASE_URL` is only applied during the frontend build.
- `CORS_ORIGIN` cannot be `*` with `credentials: true`.
- Use Render for backend and Vercel for frontend.

---

## 📄 License

MIT
