import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { apiGet, apiRequest } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

export default function PostView() {
  const { id } = useParams();
  const {
    user,
    isAuthenticated,
    status: authStatus,
    authPending,
    login,
    register,
    logout,
  } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [interactionError, setInteractionError] = useState(null);
  const [commentPending, setCommentPending] = useState(false);
  const [likeBusyId, setLikeBusyId] = useState(null);
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
        const [postData, commentsData] = await Promise.all([
          apiGet(`/posts/${id}`, { signal: controller.signal }),
          apiGet(`/comments/post/${id}`, { signal: controller.signal }),
        ]);
        setPost(postData);
        setComments(commentsData);
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
  }, [id]);

  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(post?.content ?? ""),
    [post?.content],
  );

  const handleCommentChange = (event) => {
    if (commentError) {
      setCommentError(null);
    }
    setCommentContent(event.target.value);
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      return;
    }
    setInteractionError(null);
    const trimmed = commentContent.trim();
    if (!trimmed) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setCommentPending(true);
    try {
      const newComment = await apiRequest("/comments", {
        method: "POST",
        body: { postId: id, content: trimmed },
      });
      setComments((prev) => [...prev, { ...newComment, likes: newComment.likes ?? [] }]);
      setCommentContent("");
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentPending(false);
    }
  };

  const handleLikeToggle = async (commentId, liked) => {
    if (!isAuthenticated) {
      return;
    }
    setInteractionError(null);
    setLikeBusyId(commentId);
    try {
      if (liked) {
        await apiRequest("/likes", { method: "DELETE", body: { commentId } });
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: (comment.likes ?? []).filter((like) => like.userId !== user.id),
                }
              : comment,
          ),
        );
      } else {
        const like = await apiRequest("/likes", { method: "POST", body: { commentId } });
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: [
                    ...(comment.likes ?? []),
                    { id: like.id, userId: like.userId ?? user.id },
                  ],
                }
              : comment,
          ),
        );
      }
    } catch (err) {
      setInteractionError(err.message);
    } finally {
      setLikeBusyId(null);
    }
  };

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError(null);
    setInteractionError(null);
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
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((mode) => (mode === "login" ? "register" : "login"));
    setAuthError(null);
  };

  if (status === "loading") {
    return (
      <main className="page">
        <p className="loading">Loading post...</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="page">
        <p className="error">{error}</p>
        <Link className="button" to="/">
          Go back
        </Link>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="page">
        <p className="empty">Post not found.</p>
        <Link className="button" to="/">
          Go back
        </Link>
      </main>
    );
  }

  return (
    <main className="page article">
      <h1>{post.title}</h1>
      <div className="meta">
        <span>By {post.author?.username ?? "Unknown"}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <section style={{ marginTop: "3rem" }}>
        <h2>Comments</h2>
        {interactionError ? <p className="error">{interactionError}</p> : null}
        {isAuthenticated ? (
          <div className="comment-form">
            <div className="comment-form__meta">
              <p>
                Signed in as <strong>{user.username}</strong>
              </p>
              <button type="button" className="link-button" onClick={logout}>
                Sign out
              </button>
            </div>
            <form onSubmit={handleCommentSubmit} className="comment-form__fields">
              <label htmlFor="new-comment" className="sr-only">
                Write a comment
              </label>
              <textarea
                id="new-comment"
                rows="4"
                value={commentContent}
                onChange={handleCommentChange}
                placeholder="Share your thoughts..."
                required
              />
              {commentError ? <p className="error">{commentError}</p> : null}
              <button type="submit" className="button" disabled={commentPending}>
                {commentPending ? "Posting..." : "Post comment"}
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-panel">
            <h3>
              {authMode === "login"
                ? "Sign in to join the conversation"
                : "Create an account to join the conversation"}
            </h3>
            {authStatus === "loading" ? (
              <p className="loading">Checking your session...</p>
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-form">
                {authMode === "register" ? (
                  <div className="auth-form__field">
                    <label htmlFor="auth-username">Username</label>
                    <input
                      id="auth-username"
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
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    value={authForm.email}
                    onChange={handleAuthInputChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="auth-form__field">
                  <label htmlFor="auth-password">Password</label>
                  <input
                    id="auth-password"
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
                    <label htmlFor="auth-confirm-password">Confirm password</label>
                    <input
                      id="auth-confirm-password"
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
            <button type="button" className="link-button" onClick={toggleAuthMode}>
              {authMode === "login"
                ? "Need an account? Register"
                : "Have an account? Sign in"}
            </button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="empty">No comments yet.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => {
              const likes = comment.likes ?? [];
              const likeCount = likes.length;
              const likedByUser =
                isAuthenticated && likes.some((like) => like.userId === user?.id);
              return (
                <li key={comment.id} className="comment-card">
                  <div className="comment-card__header">
                    <strong>{comment.user?.username ?? "Anonymous"}</strong>
                    <span>{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p>{comment.content}</p>
                  <div className="comment-actions">
                    <button
                      type="button"
                      className="comment-like-button"
                      onClick={() => handleLikeToggle(comment.id, likedByUser)}
                      disabled={!isAuthenticated || likeBusyId === comment.id}
                      title={
                        isAuthenticated
                          ? undefined
                          : "Sign in to like comments"
                      }
                    >
                      {likedByUser ? "Unlike" : "Like"} ({likeCount})
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link className="button" to="/">
        Back to list
      </Link>
    </main>
  );
}
