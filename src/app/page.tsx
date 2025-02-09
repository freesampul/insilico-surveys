"use client";

import SignInButton from "./components/SignInButton";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#fffffc] text-gray-900 font-serif">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
          Revolutionizing Surveys with AI Personas
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mb-8">
          Gain unique and reliable survey results at a fraction of the cost of traditional polling.
        </p>
        <SignInButton />

        {/* Call to Action */}
        <div className="mt-16 max-w-4xl">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            <div className="text-center p-6 rounded-lg border border-gray-300 bg-white shadow-md">
              <h3 className="text-2xl font-semibold text-green-600">AI Personas</h3>
              <p className="text-lg text-gray-700 mt-4">
                Our AI personas simulate real human behavior to answer your survey questions, ensuring diverse and accurate insights.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-300 bg-white shadow-md">
              <h3 className="text-2xl font-semibold text-green-600">Affordable</h3>
              <p className="text-lg text-gray-700 mt-4">
                Skip the high costs of traditional polling. Get accurate responses without breaking your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mt-20 text-center py-12 px-6 w-full bg-white shadow-md">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">What People Are Saying</h2>
        <div className="max-w-screen-md mx-auto">
          <blockquote className="italic text-gray-600 mb-4">
            "This AI-powered survey service helped us gather more insights in less time, and for a fraction of the price!"
          </blockquote>
          <p className="text-gray-500">– Aidan Deshong</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 w-full text-center py-6 mt-auto text-white">
        <p className="text-gray-400">© 2025 Insilico Surveys. All Rights Reserved.</p>
      </footer>
    </main>
  );
}