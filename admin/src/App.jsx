import { useCallback, useEffect, useState } from "react";
import PostCard from "./components/PostCard.jsx";
import { login, fetchCurrentUser, logout } from "./services/auth.js";
import {
  createPost,
  deletePost,
  fetchAllPosts,
  publishPost,
  unpublishPost,
} from "./services/posts.js";
import "./App.css";

const INITIAL_FORM = { title: "", content: "" };
const INITIAL_CREDENTIALS = { email: "", password: "" };

export default function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [credentials, setCredentials] = useState(INITIAL_CREDENTIALS);
  const [authLoading, setAuthLoading] = useState(false);

  const loadPosts = useCallback(async (signal) => {
    if (!user || user.role !== "ADMIN") {
      setPosts([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPosts(signal);
      setPosts(data);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const token = window.localStorage.getItem("blog_admin_token");
    if (!token) {
      return;
    }
    const controller = new AbortController();
    async function hydrate() {
      try {
        const profile = await fetchCurrentUser(controller.signal);
        setUser(profile);
      } catch (err) {
        if (err.name !== "AbortError") {
          logout();
          setUser(null);
        }
      }
    }
    hydrate();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      return;
    }
    const controller = new AbortController();
    loadPosts(controller.signal);
    return () => controller.abort();
  }, [user, loadPosts]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCredentialChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const payload = await login({
        email: credentials.email.trim(),
        password: credentials.password,
      });
      setUser(payload.user);
      setCredentials(INITIAL_CREDENTIALS);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPosts([]);
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPost({ title: form.title.trim(), content: form.content.trim() });
      setForm(INITIAL_FORM);
      await loadPosts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runPostAction = async (id, action) => {
    setProcessingId(id);
    setError(null);
    try {
      await action(id);
      await loadPosts();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) {
    return (
      <div className="layout">
        <header>
          <h1>Admin Dashboard</h1>
          <p>Sign in with an administrator account to manage posts.</p>
        </header>

        <section>
          <h2>Sign in</h2>
          <form
            onSubmit={handleLogin}
            className="post-card"
            style={{ display: "grid", gap: "1rem", maxWidth: "420px" }}
          >
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleCredentialChange}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleCredentialChange}
                placeholder="********"
                required
              />
            </div>
            {authError ? <p className="error">{authError}</p> : null}
            <button type="submit" className="primary" disabled={authLoading}>
              {authLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="layout">
        <header>
          <h1>Admin Dashboard</h1>
          <p>Your account does not have administrator privileges.</p>
        </header>
        <button type="button" className="secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="layout">
      <header>
        <h1>Admin Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <p style={{ margin: 0 }}>Signed in as {user.username}</p>
          <button type="button" className="secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section>
        <h2>Create a new post</h2>
        <form onSubmit={handleCreatePost} className="post-card" style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleInputChange}
              placeholder="Post title"
              required
            />
          </div>
          <div>
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleInputChange}
              placeholder="Write your draft..."
              rows={6}
              required
            />
          </div>
          {formError ? <p className="error">{formError}</p> : null}
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save draft"}
          </button>
        </form>
      </section>

      <section>
        <h2>Posts</h2>
        {loading ? <p>Loading posts...</p> : null}
        {error ? <p className="error">{error}</p> : null}
        {!loading && posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Draft your first article above.</p>
          </div>
        ) : null}
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPublish={(id) => runPostAction(id, publishPost)}
              onUnpublish={(id) => runPostAction(id, unpublishPost)}
              onDelete={(id) => runPostAction(id, deletePost)}
              isProcessing={processingId === post.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
