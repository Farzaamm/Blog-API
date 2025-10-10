import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client.js";
import DOMPurify from "dompurify";
import { useAuth } from "../auth/AuthContext.jsx";

const DOM_FRAGMENT_OPTIONS = { RETURN_DOM_FRAGMENT: true };

function extractPlainText(html) {
  if (!html) {
    return "";
  }
  const fragment = DOMPurify.sanitize(html, DOM_FRAGMENT_OPTIONS);
  const text = fragment.textContent ?? "";
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export default function HomeView() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const {
    user,
    isAuthenticated,
    status: authStatus,
    authPending,
    login,
    register,
    logout,
  } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setStatus("loading");
      setError(null);
      try {
        const data = await apiGet("/posts", { signal: controller.signal });
        setPosts(data);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        setError(err.message);
        setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuth(false);
      setAuthError(null);
      setAuthForm({ username: "", email: "", password: "", confirmPassword: "" });
    }
  }, [isAuthenticated]);

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError(null);
    try {
      if (authMode === "login") {
        await login({
          email: authForm.email.trim(),
          password: authForm.password,
        });
      } else {
        if (authForm.password !== authForm.confirmPassword) {
          setAuthError("Passwords do not match");
          return;
        }
        const username = authForm.username.trim();
        if (!username) {
          setAuthError("Username is required");
          return;
        }
        await register({
          username,
          email: authForm.email.trim(),
          password: authForm.password,
        });
      }
      setAuthForm({ username: "", email: "", password: "", confirmPassword: "" });
      setShowAuth(false);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((mode) => (mode === "login" ? "register" : "login"));
    setAuthError(null);
  };

  const openAuthPanel = (mode) => {
    setShowAuth(true);
    setAuthMode(mode);
    setAuthError(null);
  };

  const closeAuthPanel = () => {
    setShowAuth(false);
    setAuthError(null);
  };

  return (
    <main className="page">
      <header className="home-hero">
        <div className="home-hero__copy">
          <h1>Latest Articles</h1>
          <p>Discover the most recent posts from our authors.</p>
        </div>
        <div className="home-auth-area">
          {isAuthenticated ? (
            <div className="home-auth-profile">
              <div>
                <span>Signed in as </span>
                <strong>{user.username}</strong>
              </div>
              <button type="button" className="link-button" onClick={() => logout()}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="home-auth-actions">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => openAuthPanel("login")}
                  disabled={authStatus === "loading"}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => openAuthPanel("register")}
                  disabled={authStatus === "loading"}
                >
                  Create account
                </button>
              </div>
              {authStatus === "loading" ? (
                <p className="home-auth-hint">Checking your session...</p>
              ) : null}
            </>
          )}
        </div>
      </header>

      {!isAuthenticated && showAuth ? (
        <div className="auth-panel home-auth-panel">
          <button
            type="button"
            className="auth-panel__close"
            onClick={closeAuthPanel}
            aria-label="Close authentication panel"
          >
            x
          </button>
          <h3>
            {authMode === "login"
              ? "Sign in to follow your favourite authors"
              : "Join the community"}
          </h3>
          {authStatus === "loading" ? (
            <p className="home-auth-hint">Checking your session...</p>
          ) : (
            <form onSubmit={handleAuthSubmit} className="auth-form">
              {authMode === "register" ? (
                <div className="auth-form__field">
                  <label htmlFor="home-auth-username">Username</label>
                  <input
                    id="home-auth-username"
                    name="username"
                    type="text"
                    value={authForm.username}
                    onChange={handleAuthInputChange}
                    placeholder="yourname"
                    required
                  />
                </div>
              ) : null}
              <div className="auth-form__field">
                <label htmlFor="home-auth-email">Email</label>
                <input
                  id="home-auth-email"
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={handleAuthInputChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="auth-form__field">
                <label htmlFor="home-auth-password">Password</label>
                <input
                  id="home-auth-password"
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthInputChange}
                  placeholder="********"
                  required
                />
              </div>
              {authMode === "register" ? (
                <div className="auth-form__field">
                  <label htmlFor="home-auth-confirm-password">Confirm password</label>
                  <input
                    id="home-auth-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={handleAuthInputChange}
                    placeholder="********"
                    required
                  />
                </div>
              ) : null}
              {authError ? <p className="error">{authError}</p> : null}
              <button type="submit" className="button" disabled={authPending}>
                {authPending
                  ? authMode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : authMode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>
          )}
          <div className="auth-panel__links">
            <button type="button" className="link-button" onClick={toggleAuthMode}>
              {authMode === "login"
                ? "Need an account? Register"
                : "Have an account? Sign in"}
            </button>
            <button type="button" className="link-button" onClick={closeAuthPanel}>
              Close
            </button>
          </div>
        </div>
      ) : null}

      {status === "loading" ? <p className="loading">Loading posts...</p> : null}
      {status === "error" ? <p className="error">{error}</p> : null}
      {status === "success" && posts.length === 0 ? (
        <p className="empty">No published posts yet. Check back soon!</p>
      ) : null}

      <div className="post-list">
        {posts.map((post) => {
          const plainContent = extractPlainText(post.content);
          const preview = plainContent.slice(0, 160);
          const needsEllipsis = plainContent.length > 160;
          return (
            <article key={post.id} className="post-preview">
              <div className="meta">
                <span>By {post.author?.username ?? "Unknown"}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <h2>{post.title}</h2>
              <p>
                {preview}
                {needsEllipsis ? "..." : ""}
              </p>
              <Link className="button" to={`/posts/${post.id}`}>
                Read more
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
