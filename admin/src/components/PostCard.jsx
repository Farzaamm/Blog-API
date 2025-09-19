import "../App.css";

export default function PostCard({ post, onPublish, onUnpublish, onDelete, isProcessing }) {
  const published = post.published;

  return (
    <article className="post-card">
      <header>
        <h2>{post.title}</h2>
        <span className={`status-badge ${published ? "published" : "draft"}`}>
          {published ? "Published" : "Draft"}
        </span>
      </header>
      <p>{post.content}</p>
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
