import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api/client.js";

export default function HomeView() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

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

  return (
    <main className="page">
      <h1>Latest Articles</h1>
      <p>Discover the most recent posts from our authors.</p>

      {status === "loading" ? <p className="loading">Loading posts...</p> : null}
      {status === "error" ? <p className="error">{error}</p> : null}
      {status === "success" && posts.length === 0 ? (
        <p className="empty">No published posts yet. Check back soon!</p>
      ) : null}

      <div className="post-list">
        {posts.map((post) => {
          const preview = (post.content ?? "").slice(0, 160);
          const needsEllipsis = (post.content ?? "").length > 160;
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
        )}
      </div>
    </main>
  );
}
