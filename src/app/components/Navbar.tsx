"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext"; 
import { signOut } from "firebase/auth"; 
import { auth } from "../../utils/firebase.utils"; 
import Link from "next/link"; 
import { usePathname } from "next/navigation"; 
import { FaCoins, FaBars, FaTimes } from "react-icons/fa"; 

const Navbar = () => {
    const { user, tokens, loading } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log("✅ User signed out successfully");
        } catch (error) {
            console.error("❌ Error signing out:", error);
        }
    };

    if (loading) {
        return <nav className="bg-cream p-4"><p className="text-black">.</p></nav>;
    }

    return (
        <nav className="bg-[#f5ebe0] p-4 flex items-center justify-between shadow-md border-b border-[#e4dacd] relative">
            {/* Left Side: Logo */}
            <div className="text-black font-bold text-xl">nsilico</div>

            {/* Center: Navigation Links (Hidden on Mobile) */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6">
                <NavItem href="/" pathname={pathname}>Home</NavItem>
                <NavItem href="/tokens" pathname={pathname}>Tokens</NavItem>
                <NavItem href="/surveys" pathname={pathname}>Surveys</NavItem>
            </div>

            {/* Right Side: User Info & Hamburger Menu */}
            <div className="flex items-center space-x-3">
                {user ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="text-black font-semibold px-3 py-1 rounded-md hover:bg-black hover:text-white transition-all flex items-center gap-2"
                        >
                            {user.displayName}
                            <FaCoins className="text-yellow-500 text-lg" />
                            <span className="font-bold text-black">{tokens}</span>
                        </button>

                        {/* Sign Out Dropdown */}
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 bg-[#d6ccc2] text-black rounded-lg shadow-lg w-40 z-50">
                                <button
                                    onClick={handleSignOut}
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

                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-black focus:outline-none z-50" 
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Menu (Visible only when open) */}
            <div 
                className={`fixed inset-0 bg-[#f5ebe0] z-40 flex flex-col items-center justify-center transition-transform ${
                    menuOpen ? "translate-x-0" : "-translate-x-full"
                } md:hidden`}
            >
                <NavItem href="/" pathname={pathname} onClick={() => setMenuOpen(false)}>Home</NavItem>
                <NavItem href="/tokens" pathname={pathname} onClick={() => setMenuOpen(false)}>Tokens</NavItem>
                <NavItem href="/surveys" pathname={pathname} onClick={() => setMenuOpen(false)}>Surveys</NavItem>
                <button 
                    className="absolute top-5 right-5 text-black" 
                    onClick={() => setMenuOpen(false)}
                >
                    <FaTimes size={24} />
                </button>
            </div>
        </nav>
    );
};

// Reusable Nav Item
const NavItem = ({ href, pathname, children, onClick }: { href: string, pathname: string, children: React.ReactNode, onClick?: () => void }) => {
    const isActive = pathname === href;
    
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`font-semibold px-3 py-2 rounded-md transition-all ${
                isActive ? "bg-black text-white" : "text-black hover:bg-black hover:text-white"
            }`}
        >
            {children}
        </Link>
    );
};

export default Navbar;