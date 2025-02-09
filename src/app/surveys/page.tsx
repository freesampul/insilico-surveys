"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

export default function SurveysPage() {
  const { user } = useAuth(); // Get the logged-in user
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSurveys = async () => {
      try {
        const q = query(collection(db, "surveys"), where("createdBy", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedSurveys = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSurveys(fetchedSurveys);
      } catch (error) {
        console.error("Error fetching surveys:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [user]);

  if (!user) {
    return (
      <main className="p-8 text-gray-900 bg-[#f5f5dc] min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4">Surveys</h1>
        <p className="text-gray-700">Please sign in to view your surveys.</p>
      </main>
    );
  }

  return (
    <main className="bg-[#f5f5dc] min-h-screen flex flex-col justify-between">
      {/* Main Content */}
      <div className="p-8 text-gray-900">
        <h1 className="text-3xl font-bold mb-6">Your Surveys</h1>
        
        {/* Create Survey Button */}
        <div className="mb-6 flex justify-end">
          <Link href="/surveys/create">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition">
              ➕ Create New Survey
            </button>
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-700">Loading surveys...</p>
        ) : surveys.length === 0 ? (
          <p className="text-gray-700">You haven’t created any surveys yet.</p>
        ) : (
          <ul className="space-y-4">
            {surveys.map((survey) => (
              <li key={survey.id} className="bg-white border border-gray-300 p-4 rounded-lg shadow-md hover:shadow-lg transition">
                <h2 className="text-lg font-semibold">{survey.title}</h2>
                <p className="text-gray-600">
                  Created on: {new Date(survey.createdAt?.seconds * 1000).toLocaleDateString()}
                </p>
                <Link href={`/surveys/${survey.id}`}>
                  <button className="mt-2 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                    View Survey
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="bg-white text-white text-center py-4 mt-8">
        <p className="text-gray-400">© 2025 Insilico Surveys. All Rights Reserved.</p>
      </footer>
    </main>
  );
}