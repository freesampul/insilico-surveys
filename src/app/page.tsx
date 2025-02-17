"use client";

import Link from "next/link";
import drew from "./founder-photos/drew.jpeg";
import sam from "./founder-photos/smam.jpeg";
import Image from "next/image";
import SignInButton from "./components/SignInButton";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const options = ["students", "elderly", "doctors", "entrepreneurs", "researchers"];
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let typingSpeed = 80;
    let deletingSpeed = 40;
    let pauseBeforeDelete = 1000;
    let pauseBeforeType = 500;

    const updateText = () => {
      if (typing) {
        if (charIndex < options[index].length) {
          setDisplayedText(options[index].substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          setTimeout(() => setTyping(false), pauseBeforeDelete);
        }
      } else {
        if (charIndex > 0) {
          setDisplayedText(options[index].substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          setTimeout(() => {
            setIndex((prevIndex) => (prevIndex + 1) % options.length);
            setTyping(true);
          }, pauseBeforeType);
        }
      }
    };

    const timer = setTimeout(updateText, typing ? typingSpeed : deletingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, typing, index]);
  return (
    <main className="flex flex-col min-h-screen bg-[#f5ebe0] text-gray-900 font-serif items-center">
       {/* Hero Section - Centered */}
            <section className="flex flex-col justify-center items-center text-center px-0 min-h-[35vh] mb-0">
              <h1 className="text-6xl font-medium text-[#1a1a1a] leading-tight mb-1">
                Get survey answers from{" "}
                <span className="text-green-600 text-6xl">{displayedText}</span>
                <span className="text-green-600 text-6xl animate-blink">|</span>
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mb-6">
                Accurate and diverse survey results at a fraction of the cost.
              </p>
              <SignInButton />
            </section>
      

      {/* Mission Section */}
      <section className="relative w-full  flex justify-center">
        <div className="about-box max-w-3xl p-10 relative">
          <h2 className="text-3xl font-bold text-center mb-6">Mission</h2>
          <p className="text-lg text-black leading-relaxed text-center">
            Before nsilico, data collection was difficult. Either you spent weeks collecting data or you paid $$$ to an online platform like Prolific or MTurk. Now, our AI-powered platform generates realistic survey responses for cents and in seconds, so you can focus on what matters most: <b>making data-driven decisions.</b>
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-2xl font-bold text-green-600 mb-2">Sign Up</h3>
              <p className="text-gray-800">Quickly join with your Google account.</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-2xl font-bold text-green-600 mb-2">Ask a Question</h3>
              <p className="text-gray-800">
                Design your survey and specify your target demographic.
              </p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h3 className="text-2xl font-bold text-green-600 mb-2">Generate Data</h3>
              <p className="text-gray-800">
                Our system produces realistic responses in under a minute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="relative w-full  flex flex-col items-center">
        <h2 className="text-4xl font-bold text-center mb-6">Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
          <div className="founder-card">
            <div className="founder-image">
              <Image src={drew} alt="Andrew Wesel" width={120} height={120} className="rounded-full object-cover w-32 h-32 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-black mt-4">Andrew Wesel</h3>
            <p className="text-gray-700 text-center"><span className="text-green-600">Research </span>| <a href="https://awesel.com">awesel.com</a></p> 
            
          </div>

          <div className="founder-card">
            <div className="founder-image">
              <Image src={sam} alt="Sam Pulaski" width={120} height={120} className="rounded-full object-cover w-32 h-32 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-black mt-4">Sam Pulaski</h3>
            <p className="text-gray-700 text-center"><span className="text-green-600">Software</span> | <a href="https://sampul.net">sampul.net</a></p> 
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5ebe0] w-full text-center py-6 mt-auto text-gray-500">
        <p>© 2025 nsilico. All Rights Reserved.</p>
        <Link href="/" className="text-green-600 font-semibold hover:underline">Back to Home</Link>
      </footer>
    </main>
  );
}
