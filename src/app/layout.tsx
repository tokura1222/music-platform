import type { Metadata } from 'next';
import './globals.css';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';
import Script from "next/script"
export const metadata: Metadata = {
  title: 'Zion Online',
  description: 'Zion Online — Music and Apps.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-LSB0X30FST" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-LSB0X30FST');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background antialiased">
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
