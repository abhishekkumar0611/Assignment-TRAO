export default function ErrorMessage({
  message,
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <h3 className="font-semibold text-red-800">
        Something went wrong
      </h3>

      <p className="mt-1 text-sm text-red-700">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}