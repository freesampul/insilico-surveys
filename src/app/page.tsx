"use client"
// app/page.tsx
import SignInButton from "./components/SignInButton";


export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to insilico surveys.</h1>
      <SignInButton />
    </main>
  );
}