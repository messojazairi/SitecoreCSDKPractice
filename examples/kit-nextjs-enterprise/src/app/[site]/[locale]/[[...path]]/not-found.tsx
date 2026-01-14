import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-pastel-pink">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-pastel-pink px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-pastel-peach"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
