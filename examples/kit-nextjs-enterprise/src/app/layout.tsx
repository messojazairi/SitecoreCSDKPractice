import type { Metadata } from 'next';
import '@/assets/styles/globals.css';

export const metadata: Metadata = {
  title: 'Enterprise Starter',
  description: 'Sitecore Content SDK Enterprise Starter Template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
