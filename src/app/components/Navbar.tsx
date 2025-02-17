"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext"; // Import the custom auth context
import { signOut } from "firebase/auth"; // Firebase sign-out method
import { auth } from "../../utils/firebase.utils"; // Import auth from utils
import Link from "next/link"; // Link for routing between pages
import { usePathname } from "next/navigation"; // Import usePathname to get the current path
import { FaCoins } from "react-icons/fa"; // Import token icon

const Navbar = () => {
    const { user, tokens, loading } = useAuth(); // Get the user and tokens from context
    const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
    const pathname = usePathname(); // Get the current path

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
                <p className="text-black">.</p>
            </nav>
        );
    }

    return (
        <nav className="bg-[#f5ebe0] p-4 flex items-center justify-between shadow-md border-b border-[#e4dacd] relative">
            {/* Left Side: Logo */}
            <div className="text-black font-bold text-xl">nsilico</div>

            {/* Center: Navigation Links */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-6">
                <NavItem href="/" pathname={pathname}>Home</NavItem>
                <NavItem href="/tokens" pathname={pathname}>Tokens</NavItem>
                <NavItem href="/surveys" pathname={pathname}>Surveys</NavItem>
            </div>

            {/* Right Side: User Section */}
            <div className="flex items-center space-x-3">
                {user ? (
                    <div className="relative">
                        {/* Username + Token Count */}
                        <button
                            onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown visibility
                            className="text-black font-semibold px-3 py-1 rounded-md hover:bg-black hover:text-white transition-all flex items-center gap-2"
                        >
                            {user.displayName}
                            <FaCoins className="text-yellow-500 text-lg" />
                            <span className="font-bold text-black">{tokens}</span>
                        </button>

                        {/* Sign Out Dropdown - Positioned Below */}
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 bg-[#d6ccc2] text-black rounded-lg shadow-lg w-40">
                                <button
                                    onClick={handleSignOut} // Handle sign-out
                                    className="w-full text-left p-2 hover:bg-[#e4dacd] rounded-lg"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <NavItem href="/signin" pathname={pathname}>Sign In</NavItem>
                )}
            </div>
        </nav>
    );
};

// Reusable Nav Item with active page highlighting
const NavItem = ({ href, pathname, children }: { href: string, pathname: string, children: React.ReactNode }) => {
    const isActive = pathname === href;
    
    return (
        <Link
            href={href}
            className={`font-semibold px-3 py-1 rounded-md transition-all ${
                isActive ? "bg-black text-white" : "text-black hover:bg-black hover:text-white"
            }`}
        >
            {children}
        </Link>
    );
};

export default Navbar;