"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../../lib/firebase";
import { exportResponsesToExcel, downloadCodebook } from "../../../../lib/export";
import Link from "next/link";
import { getUserTokens } from "@/utils/firebase.utils";
import { updateDoc } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc, getDocs, collection, setDoc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { FaUser, FaRobot, FaDownload, FaBook, FaArrowLeft } from "react-icons/fa";

export default function SurveyDetailPage() {
  const { user, tokens } = useAuth();
  const { id } = useParams();
  const [tokenCost, setTokenCost] = useState(1);
  const [survey, setSurvey] = useState(null);
  const [numRespondents, setNumRespondents] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [responses, setResponses] = useState({});
  const [personas, setPersonas] = useState({});

  useEffect(() => {
    setTokenCost(numRespondents * 5);
  }, [numRespondents]);

  useEffect(() => {
    if (!id) return;

    const fetchSurvey = async () => {
      try {
        const docRef = doc(db, "surveys", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSurvey({ id: docSnap.id, ...docSnap.data() });

          const responsesCollection = collection(docRef, "responses");
          const responsesSnapshot = await getDocs(responsesCollection);

          const fetchedResponses = {};
          const fetchedPersonas = {};
          let personaIndex = 0;

          responsesSnapshot.forEach((responseDoc) => {
            const data = responseDoc.data();
            if (!data.response) return;

            if (!fetchedResponses[personaIndex]) fetchedResponses[personaIndex] = {};
            fetchedResponses[personaIndex][data.question] = data.response;

            if (!fetchedPersonas[personaIndex]) {
              fetchedPersonas[personaIndex] = {
                age: data.persona?.age || "Unknown",
                gender: data.persona?.gender || "Unknown",
                race: data.persona?.race || "Unknown",
                income: data.persona?.income || "Unknown",
              };
            }
          });

          setResponses(fetchedResponses);
          setPersonas(fetchedPersonas);
        } else {
          console.error("Survey not found.");
        }
      } catch (error) {
        console.error("Error fetching survey:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  if (loading) return <p className="p-8 text-black">Loading survey...</p>;
  if (!survey) return <p className="p-8 text-black">Survey not found.</p>;

  return (
    <main className="p-8 bg-[#f5ebe0] min-h-screen flex flex-col items-center">
      {/* Survey Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-black">{survey.title}</h1>
      </div>

      {/* Persona Selection */}
      <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-black mb-4">Customize AI Respondents</h2>
        <label className="block text-black">
          Number of AI Respondents:
          <select
            className="border p-3 w-full mt-2 rounded-lg text-black"
            value={numRespondents}
            onChange={(e) => setNumRespondents(Number(e.target.value))}
          >
            {[1, 5, 10, 20, 50, 100, 200, 300].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-3 text-lg text-black">
          Total Token Cost: <span className="font-bold">{tokenCost}</span> tokens
        </p>
        <p className="text-sm text-black">
          You currently have <span className="font-bold">{tokens}</span> tokens
        </p>
      </div>

      {/* Survey Questions */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-3xl font-semibold text-black mb-6">Survey Questions</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {survey.questions.map((q, index) => (
            <li key={index} className="bg-white/90 shadow-lg rounded-xl p-6">
              <p className="text-lg font-semibold text-black">Question {index + 1}</p>
              <p className="text-black">{q.text}</p>
              {Object.entries(responses).map(([personaId, answers]) => (
                <div key={personaId} className="mt-3 p-3 bg-gray-100 rounded-lg">
                  <p className="font-semibold text-black flex items-center gap-2">
                    <FaUser className="text-blue-500" /> Persona {parseInt(personaId) + 1}
                  </p>
                  <p className="text-green-700 flex items-center gap-2">
                    <FaRobot /> {answers[q.text] || "Generating..."}
                  </p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>

      {/* Buttons */}
      <div className="mt-10 flex flex-wrap gap-4">
        <button className="bg-blue-500 text-black flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-blue-600 transition">
          <FaRobot /> {generating ? "Generating AI Responses..." : "Generate AI Responses"}
        </button>

        <button className="bg-green-500 text-white flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-green-600 transition">
          <FaDownload /> Download Excel
        </button>

        <button className="bg-purple-500 text-white flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-purple-600 transition">
          <FaBook /> Get Codebook
        </button>

        <Link href="/surveys">
          <button className="bg-red-500 text-white flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-red-600 transition">
            <FaArrowLeft /> Back to Surveys
          </button>
        </Link>
      </div>
    </main>
  );
}