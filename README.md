# Blog API

A RESTful API for a blogging platform that allows users to register, authenticate, and manage blog posts. This project is built with Node.js and follows a clean, modular backend architecture.

## 🚀 Features

* User authentication (register & login)
* JWT-based authorization
* Create, read, update, delete (CRUD) blog posts
* Structured API routes
* Database integration with ORM
* Environment-based configuration
* Scalable backend structure

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **Prisma ORM**
* **PostgreSQL** (or your configured DB)
* **JWT Authentication**

---

## 📁 Project Structure

```
.
├── prisma/             # Database schema & migrations
├── src/
│   ├── controllers/   # Request handlers
│   ├── routes/        # API routes
│   ├── middlewares/   # Auth & error handling
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
├── .env               # Environment variables
├── package.json
└── server.js / index.js
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Farzaamm/Blog-API.git
cd Blog-API
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 4. Setup database

```bash
npx prisma migrate dev
npx prisma generate
```

---

### 5. Run the server

```bash
npm run dev
```

or

```bash
node index.js
```

---

## 📌 API Endpoints

### Auth

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| POST   | /auth/register | Register user |
| POST   | /auth/login    | Login user    |

---

### Posts

| Method | Endpoint   | Description     |
| ------ | ---------- | --------------- |
| GET    | /posts     | Get all posts   |
| GET    | /posts/:id | Get single post |
| POST   | /posts     | Create post     |
| PUT    | /posts/:id | Update post     |
| DELETE | /posts/:id | Delete post     |

---

## 🔐 Authentication

* Uses JWT tokens
* Include token in headers:

```
Authorization: Bearer <your_token>
```

---

## 🧪 Testing

```bash
npm run test
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Pull requests are welcome. If you find a bug or want to improve something, feel free to fork and submit a PR.

---

## 💡 Notes

* Make sure your database is running before starting the server
* Keep your `.env` file private (don’t push it to GitHub)
