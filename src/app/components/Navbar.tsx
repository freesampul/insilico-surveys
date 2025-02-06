"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext"; // Import the custom auth context
import { signOut } from "firebase/auth"; // Firebase sign-out method
import { auth } from "../../utils/firebase.utils"; // Import auth from utils
import Link from "next/link"; // Link for routing between pages

const Navbar = () => {
    const { user, tokens, loading } = useAuth(); // Get the user and tokens from context
    const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

    const handleSignOut = async () => {
        try {
            await signOut(auth); // Sign out the user from Firebase
            console.log("✅ User signed out successfully");
        } catch (error) {
            console.error("❌ Error signing out:", error);
        }
    };

    if (loading) {
        return (
            <nav className="bg-gray-800 p-4">
                <p className="text-white">Loading...</p>
            </nav>
        );
    }

    return (
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
            <div className="text-white">
                <h1 className="text-lg font-bold">Insilico Surveys</h1>
            </div>
            <div className="flex items-center space-x-6">
                <Link href="/" className="text-white hover:text-green-500">
                    Home
                </Link>
                <Link href="/tokens" className="text-white hover:text-green-500">
                    Tokens
                </Link>
                <Link href="/surveys" className="text-white hover:text-green-500">
                    Surveys
                </Link>
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown visibility
                            className="text-white hover:text-green-500"
                        >
                            Welcome, {user.displayName}!
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 bg-gray-700 text-white rounded-lg shadow-lg w-40">
                                <div className="p-2 text-sm">
                                    <p className="text-gray-300">Tokens: {tokens}</p>
                                </div>
                                <button
                                    onClick={handleSignOut} // Handle sign-out
                                    className="w-full text-left p-2 hover:bg-gray-600 rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/signin" className="text-white hover:text-green-500">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;