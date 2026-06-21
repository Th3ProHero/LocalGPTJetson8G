import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LocalGPT — Private AI Chat',
  description:
    'Self-hosted AI chat interface powered by local LLMs on NVIDIA Jetson. No cloud, no tracking, full privacy.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} antialiased bg-void-black text-text-primary`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
