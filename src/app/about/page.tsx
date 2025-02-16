"use client";

import Link from "next/link";
import drew from "./founder-photos/drew.jpeg";
import sam from "./founder-photos/smam.jpeg";
import Image from "next/image";


export default function AboutPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#f5ebe0] text-gray-900 font-serif items-center">
      {/* Page Header */}
      <section className="relative text-center w-full py-20 px-6">
        <h1 className="text-6xl font-bold text-black drop-shadow-lg">About <span className="text-green-600">Nsilico</span></h1>
        <p className="text-xl text-gray-800 max-w-3xl mx-auto mt-4">
          Revolutionizing surveys with <span className="text-green-600 font-semibold">AI-generated responses.</span> 
          Fast, cost-effective, and scalable insights tailored to your needs.
        </p>
      </section>

      {/* About Section */}
      <section className="relative w-full py-20 flex justify-center">
        <div className="about-box max-w-3xl p-10 relative">
          <h2 className="text-3xl font-bold text-center mb-6">Our <span className="text-green-600">Mission</span></h2>
          <p className="text-lg text-black leading-relaxed text-center">
            At <strong className="text-green-600">Nsilico</strong>, we believe <em>surveys should be smarter.</em>  
            Our AI personas provide <span className="text-green-600 font-semibold">accurate, nuanced responses</span> based on demographic & personality traits,  
            helping researchers, businesses, and educators get <span className="text-green-600">realistic, actionable data.</span>
          </p>
        </div>
      </section>

      {/* Founders Section */}
      <section className="relative w-full py-20 flex flex-col items-center">
        <h2 className="text-4xl font-bold text-center mb-6">Meet the <span className="text-green-600">Founders</span></h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
          {/* Founder 1 */}
          <div className="founder-card">
            <div className="founder-image">
              <Image src={drew} alt="Andrew Wesel" width={120} height={120} className="rounded-full object-cover w-32 h-32 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-black mt-4">Andrew Wesel</h3>
            <p className="text-gray-700 text-center">Studying AI @ Stanford | <span className="text-green-600">AI & Research</span></p>
          </div>

          {/* Founder 2 */}
          <div className="founder-card">
            <div className="founder-image">
              <Image src={sam} alt="Sam Pulaski" width={120} height={120} className="rounded-full object-cover w-32 h-32 mx-auto" />
            </div>
            <h3 className="text-2xl font-semibold text-black mt-4">Sam Pulaski</h3>
            <p className="text-gray-700 text-center">Studying CS and Business @ NYU | <span className="text-green-600">Product & Strategy</span></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5ebe0] w-full text-center py-6 mt-auto text-gray-500">
        <p>© 2025 Nsilico. All Rights Reserved.</p>
        <Link href="/" className="text-green-600 font-semibold hover:underline">Back to Home</Link>
      </footer>
    </main>
  );
}