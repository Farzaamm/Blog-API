# Blog API

A full-stack blog application with a robust RESTful backend API, admin dashboard, and public reader frontend.

Built with **Node.js + Express** on the backend and **React + Vite** on the frontend.

---

## ✨ Features

### Backend (`/api`)
- RESTful API built with **Express.js**
- Database management with **Prisma ORM** + PostgreSQL (or any supported DB)
- Clean architecture (controllers, routes, middlewares, config)
- Authentication & authorization (JWT likely)
- CRUD operations for posts, categories, users, comments, etc.
- ESLint + Prettier for code quality

### Admin Dashboard (`/admin`)
- React + Vite frontend for content management
- Create, edit, delete, and manage blog posts
- User and category management
- Modern, responsive UI

### Reader / Public Site (`/reader`)
- Clean, fast frontend for blog readers
- Browse posts, categories, and search
- Optimized for reading experience

---

## 📁 Project Structure

```bash
Blog-API/
├── api/                  # Backend (Node.js + Express + Prisma)
│   ├── prisma/           # Database schema & migrations
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── admin/                # React Admin Dashboard (Vite)
│   └── package.json
│
├── reader/               # React Public Reader (Vite)
│   └── package.json
│
├── .gitignore
└── README.md
