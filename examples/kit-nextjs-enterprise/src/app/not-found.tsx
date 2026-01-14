import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-body antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-6xl font-bold" style={{ color: '#FFADAD' }}>
              404
            </h1>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Page Not Found</h2>
            <p className="mb-8 text-gray-600">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium text-gray-900 transition-colors"
              style={{ backgroundColor: '#FFADAD' }}
            >
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
