// app/layout.tsx
import { AuthProvider } from "@/app/context/AuthContext";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata = {
  title: "nsilico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}