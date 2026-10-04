import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "OpsPilot — Your Startup's AI Execution Layer",
  description:
    'OpsPilot is an AI finance-operations agent that processes invoices, reconciles them against purchase orders, detects anomalies, evaluates risk, and autonomously handles safe actions while requiring human approval for consequential decisions.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-canvas-950 text-graphite-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
