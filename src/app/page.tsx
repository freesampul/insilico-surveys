"use client";

import SignInButton from "./components/SignInButton";
import { useState, useEffect } from "react";

export default function HomePage() {
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
    <main className="flex flex-col min-h-screen bg-[#f5ebe0] text-gray-900 font-serif">
      {/* Hero Section - Centered */}
      <section className="flex flex-col justify-center items-center text-center px-6 py-24 min-h-[50vh]">
        <h1 className="text-6xl font-medium text-[#1a1a1a] leading-tight mb-6">
          Get survey answers from{" "}
          <span className="text-green-600 text-6xl">{displayedText}</span>
          <span className="text-green-600 text-6xl animate-blink">|</span>
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mb-8">
          Accurate and diverse survey results at a fraction of the cost.
        </p>
        <SignInButton />
      </section>

      {/* How It Works - Unique Section */}
      <section className="relative w-full py-20 flex justify-center">
        <div className="how-it-works-box max-w-3xl p-10 relative">
          <h2 className="text-3xl font-bold text-black text-center mb-6">How It Works</h2>
          <div className="grid grid-cols-1 gap-6 text-left">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="text-xl font-bold text-green-600">AI Personas</h3>
                <p>
                  Simulating real human behavior to provide diverse and reliable survey insights.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">🤑</span>
              <div>
                <h3 className="text-xl font-bold text-green-600">Affordable</h3>
                <p>
                  Get accurate responses without the high costs of traditional polling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#f5ebe0] w-full text-center py-6 mt-auto text-gray-500">
        <p>© 2025 nsilico. All Rights Reserved.</p>
      </footer>
    </main>
  );
}