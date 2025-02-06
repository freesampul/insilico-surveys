"use client";

import SignInButton from "./components/SignInButton";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Revolutionizing Surveys with AI Personas 📝📝
        </h1>
        <p className="text-lg mb-8">
          Get unique, yet accurate survey results at a fraction of the cost of traditional polling.
        </p>
        <SignInButton />

        {/* Call to Action */}
        <div className="mt-12">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-screen-lg">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-500">AI Personas</h3>
              <p className="text-lg mt-4">
                Our AI personas simulate real human behavior to answer your survey questions, ensuring you get diverse and accurate insights.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-green-500">Affordable</h3>
              <p className="text-lg mt-4">
                Skip the high costs of traditional polling. Get accurate responses without breaking your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust Section (Optional) */}
      <section className="mt-20 text-center py-12 px-6 w-full">
        <h2 className="text-3xl text-white font-semibold mb-6">What People Are Saying</h2>
        <div className="max-w-screen-md mx-auto">
          <blockquote className="italic text-gray-400 mb-4">
            "This AI-powered survey service helped us gather more insights in less time, and for a fraction of the price!"
          </blockquote>
          <p className="text-gray-500">– Aidan Deshong</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 w-full text-center py-6 mt-auto">
        <p className="text-gray-400">© 2025 Insilico Surveys. All Rights Reserved.</p>
      </footer>
    </main>
  );
}