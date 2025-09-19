import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api/client.js";

export default function PostView() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

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
      <p>{post.content}</p>

      <section style={{ marginTop: "3rem" }}>
        <h2>Comments</h2>
        {comments.length === 0 ? (
          <p className="empty">No comments yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
            {comments.map((comment) => (
              <li key={comment.id} style={{ background: "#f1f5f9", padding: "1rem", borderRadius: "0.75rem" }}>
                <strong>{comment.user?.username ?? "Anonymous"}</strong>
                <p style={{ marginTop: "0.5rem" }}>{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link className="button" to="/">
        Back to list
      </Link>
    </main>
  );
}
