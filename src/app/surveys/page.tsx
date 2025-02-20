"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { FaPlus, FaEye } from "react-icons/fa"; // Import icons for buttons

export default function SurveysPage() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState<{ id: string; title: string; createdAt?: { seconds: number } }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSurveys = async () => {
      try {
        const q = query(collection(db, "surveys"), where("createdBy", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedSurveys = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
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
      <main className="p-8 bg-[#f5ebe0] min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Surveys</h1>
        <p className="text-gray-700">Please sign in to view your surveys.</p>
      </main>
    );
  }

  return (
    <main className="p-8 bg-[#f5ebe0] min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Your Surveys</h1>
        <Link href="/surveys/create">
          <button className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-full shadow-md hover:bg-green-600 transition">
            <FaPlus /> Create Survey
          </button>
        </Link>
      </div>

      {/* Survey List */}
      {loading ? (
        <p className="text-gray-700">Loading surveys...</p>
      ) : surveys.length === 0 ? (
        <p className="text-gray-700 text-lg text-center">You haven’t created any surveys yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <li key={survey.id} className="bg-[#e4dacd] shadow-md rounded-lg p-6 flex flex-col justify-between border-black-1px">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{survey.title}</h2>
                
              </div>
              <Link href={`/surveys/${survey.id}`}>
                <button className="mt-4 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
                  <FaEye /> View Survey
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}