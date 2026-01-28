import "./globals.css";
import Navbar from "..ui/components/Navbar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
