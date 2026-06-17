function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
