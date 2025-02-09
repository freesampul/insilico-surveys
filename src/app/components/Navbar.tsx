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
            <nav className="bg-cream p-4">
                <p className="text-black">Loading...</p>
            </nav>
        );
    }

    return (
        <nav className="bg-[#FFFFDF] p-4 flex justify-center items-center shadow-md">
            <div className="text-black text-center">
                <h1 className="text-xl font-bold">Insilico Surveys</h1>
            </div>
            <div className="flex items-center space-x-6 ml-10">
                <NavItem href="/">Home</NavItem>
                <NavItem href="/tokens">Tokens</NavItem>
                <NavItem href="/surveys">Surveys</NavItem>
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown visibility
                            className="text-black font-semibold px-3 py-1 rounded-md hover:bg-black hover:text-white transition-all"
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
                    <NavItem href="/signin">Sign In</NavItem>
                )}
            </div>
        </nav>
    );
};

// Reusable Nav Item with hover effect
const NavItem = ({ href, children }) => (
    <Link
        href={href}
        className="text-black font-semibold px-3 py-1 rounded-md hover:bg-black hover:text-white transition-all"
    >
        {children}
    </Link>
);

export default Navbar;