"use client";

import { useRouter } from "next/navigation"; // Importing router for programmatic navigation
import SignInButton from "../components/SignInButton";
import Link from "next/link"; // For navigation links

export default function Signin() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Sign up and start polling</h1>
      
      {/* Sign In Button */}
      <SignInButton />
      </div>
  );
}