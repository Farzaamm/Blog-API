# Blog Admin Front-End

This React app is built with Vite and connects to the Blog API under `../api`.

## Getting started

```bash
cd admin
npm install
npm run dev
```

Create a `.env` file if you need a different API base URL:

```
VITE_API_URL=http://localhost:3000/api
```

Sign in with an administrator email + password (backed by the `/api/users/login` endpoint). The JWT is stored in `localStorage` under the `blog_admin_token` key. Replace this quick-start auth storage when you wire in a production-ready flow.
