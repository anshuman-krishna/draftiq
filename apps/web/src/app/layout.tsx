import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "draftiq — configure smarter. quote faster. close instantly.",
  description:
    "the conversion engine for service businesses. replace manual quoting with intelligent pricing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {/* background blobs */}
        <div className="bg-blobs">
          <div className="absolute -left-32 top-0 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
        </div>

        {children}
      </body>
    </html>
  );
}
