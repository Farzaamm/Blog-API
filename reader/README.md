# Blog Reader Front-End

This React + Vite app displays published content from the Blog API.

## Getting started

```bash
cd reader
npm install
npm run dev
```

Create a `.env` file if you need a custom API endpoint:

```
VITE_API_URL=http://localhost:3000/api
```

The router is already configured with `/` for the feed and `/posts/:id` for the detail view. Expand it with authentication, profile pages, or pagination as you evolve the product.
