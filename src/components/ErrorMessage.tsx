export function ErrorMessage({ 
  message,
  onRetry 
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="error-message">
      <div className="error-content">
        <p>{message}</p>
        <button 
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </div>
  );
}