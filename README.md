# WatchHell

WatchHell is a full-stack creator streaming studio built with React, Vite, Node.js, Express, and MongoDB. It supports user authentication, video uploads, comments, subscriptions, and profile management.

## Features

- User signup, login, and JWT-based authentication
- Video upload and listing
- Comments and likes
- Channel subscription system
- Profile page with avatar and cover images
- Profile settings page to update username, full name, email, and password
- Cloudinary integration for image uploads

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT
- Image uploads: Cloudinary
- Deployment: Vercel (frontend) + Render / Railway / other Node host (backend)

## Repo structure

- `client/` - React frontend app
- `src/` - backend source code
- `src/app.js` - Express app and routes
- `src/index.js` - backend entry point
- `src/controllers/` - request handlers
- `src/routes/` - API route definitions
- `src/models/` - Mongoose models
- `src/utils/` - custom helpers and error wrappers

## Getting started locally

### 1. Install dependencies

```bash
cd "c:\Users\Lenovo\OneDrive\Documents\New project\WatchHell"
npm install
cd client
npm install
```

### 2. Configure environment variables

Create a `.env` file in the backend root with required variables, for example:

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

In the frontend `client/` directory, optionally create `client/.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Run locally

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

Then open the Vite URL shown in the terminal.

## Deployment

### Backend

- Deploy the backend on Render, Railway, or another Node hosting service.
- Set environment variables on the host exactly as in the `.env` file.
- Set `CORS_ORIGIN` to your frontend domain, for example:

```text
https://watch-hell.vercel.app
```

### Frontend

- Deploy the `client/` app on Vercel.
- Add a Vercel environment variable:

```text
VITE_API_BASE_URL=https://<your-backend-domain>/api/v1
```

- Redeploy after updating env vars.

## API Endpoints

Some main backend routes:

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

## Notes

- `VITE_API_BASE_URL` is only read at build time, so update it in Vercel and redeploy.
- The backend uses CORS with `credentials: true`, so `CORS_ORIGIN` cannot be `*`.
- Keep `.env` out of GitHub; `.gitignore` already ignores it.

## License

MIT
