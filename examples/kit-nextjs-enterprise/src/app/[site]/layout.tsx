export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-body antialiased">
        {children}
      </body>
    </html>
  );
}
