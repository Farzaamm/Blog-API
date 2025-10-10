import { useMemo } from "react";
import DOMPurify from "dompurify";
import "../App.css";

export default function PostCard({ post, onPublish, onUnpublish, onDelete, isProcessing }) {
  const published = post.published;
  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(post.content ?? ""),
    [post.content]
  );

  return (
    <article className="post-card">
      <header>
        <h2>{post.title}</h2>
        <span className={`status-badge ${published ? "published" : "draft"}`}>
          {published ? "Published" : "Draft"}
        </span>
      </header>
      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      <footer className="actions">
        {published ? (
          <button
            type="button"
            className="secondary"
            onClick={() => onUnpublish(post.id)}
            disabled={isProcessing}
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() => onPublish(post.id)}
            disabled={isProcessing}
          >
            Publish
          </button>
        )}
        <button
          type="button"
          className="secondary"
          onClick={() => onDelete(post.id)}
          disabled={isProcessing}
        >
          Delete
        </button>
      </footer>
    </article>
  );
}
