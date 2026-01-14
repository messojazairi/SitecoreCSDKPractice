'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-body antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-6xl font-bold" style={{ color: '#FFADAD' }}>
              Error
            </h1>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Something went wrong</h2>
            <p className="mb-8 text-gray-600">{error.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium text-gray-900 transition-colors hover:opacity-90"
              style={{ backgroundColor: '#FFADAD' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
