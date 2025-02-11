"use client";

import SignInButton from "./components/SignInButton";
import { useState, useEffect } from "react";

export default function HomePage() {
  const options = ["students", "elderly", "doctors", "entrepreneurs", "researchers"];
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(true); // true for typing, false for deleting
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let charIndex = 0;
    let typingSpeed = 80;
    let deletingSpeed = 40;
    let pauseBeforeDelete = 1000;
    let pauseBeforeType = 500;

    const typeEffect = () => {
      if (typing) {
        if (charIndex <= options[index].length) {
          setDisplayedText(options[index].substring(0, charIndex));
          charIndex++;
          setTimeout(typeEffect, typingSpeed);
        } else {
          setTimeout(() => setTyping(false), pauseBeforeDelete);
        }
      } else {
        if (charIndex >= 0) {
          setDisplayedText(options[index].substring(0, charIndex));
          charIndex--;
          setTimeout(typeEffect, deletingSpeed);
        } else {
          setTimeout(() => {
            setIndex((prevIndex) => (prevIndex + 1) % options.length);
            setTyping(true);
          }, pauseBeforeType);
        }
      }
    };

    typeEffect();
  }, [index, typing]);

  // Handle fade-in + slide-in animation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("how-it-works");
      if (section) {
        const top = section.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.8) {
          setVisible(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

      {/* Call to Action & How It Works - Moved Down + Animated */}
      <section
        id="how-it-works"
        className={`mt-40 max-w-3xl mx-auto text-center px-6 transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-left">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="text-xl font-medium text-green-600">AI Personas</h3>
              <p className="text-gray-700 mt-2">
                Simulating real human behavior to provide diverse and reliable survey insights.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl">🤑</span>
            <div>
              <h3 className="text-xl font-medium text-green-600">Affordable</h3>
              <p className="text-gray-700 mt-2">
                Get accurate responses without the high costs of traditional polling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#f5ebe0] w-full text-center py-6 mt-auto text-gray-500">
        <p>© 2025 Insilico Surveys. All Rights Reserved.</p>
      </footer>
    </main>
  );
}