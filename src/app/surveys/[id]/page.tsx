"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../../lib/firebase";
import { getRandomPersonaWithBig5 } from "../../../../lib/persona";
import { exportResponsesToExcel, downloadCodebook } from "../../../../lib/export";
import Link from "next/link";
import { getUserTokens } from "@/utils/firebase.utils"
import { updateDoc } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";



import { doc, getDoc, getDocs, collection, addDoc, writeBatch, setDoc } from "firebase/firestore";
import { useParams } from "next/navigation";


export default function SurveyDetailPage() {
  const { user, tokens, setTokens } = useAuth(); // Get the user and tokens from context

  const { id } = useParams();
  const [tokenCost, setTokenCost] = useState(1);
  const [survey, setSurvey] = useState<any>(null);
  const [numRespondents, setNumRespondents] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [responses, setResponses] = useState<{ [key: number]: { [question: string]: string } }>({});
  const [personas, setPersonas] = useState<{ [key: string]: { age: string; gender: string; race: string; income: string } }>({});
  useEffect(() => {
    setTokenCost(numRespondents * 5);
  }, [numRespondents]);


  useEffect(() => {
    if (!id) return;
  
    const fetchSurvey = async () => {
      try {
        const docRef = doc(db, "surveys", id as string);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setSurvey({ id: docSnap.id, ...docSnap.data() });
  
          // ✅ Fetch AI-generated responses from Firestore
          const responsesCollection = collection(docRef, "responses");
          const responsesSnapshot = await getDocs(responsesCollection);
  
          const fetchedResponses: { [key: number]: { [question: string]: string } } = {};
const fetchedPersonas: { [key: number]: { age: string; gender: string; race: string; income: string } } = {};
let personaIndex = 0;

responsesSnapshot.forEach((responseDoc) => {
  const data = responseDoc.data();
  
  // ✅ Only add responses that actually have AI-generated answers
  if (!data.response) return;

  if (!fetchedResponses[personaIndex]) {
    fetchedResponses[personaIndex] = {};
  }
  fetchedResponses[personaIndex][data.question] = data.response;

  // ✅ Ensure persona is saved correctly
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


  const handleGenerateResponses = async () => {
    if (!survey) return;
    setGenerating(true);

    
  
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to generate AI responses.");
      setGenerating(false);
      return;
    }

    const userTokens = await getUserTokens(user.uid);
    if (userTokens < tokenCost) {
      alert("You don't have enough tokens to generate responses."); // ✅ Show alert if not enough tokens
      setGenerating(false);
      return;
    }
  
    const newTokenCount = userTokens - tokenCost;
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, { tokens: newTokenCount }); 
    
    interface Persona {
      age: string;
      gender: string;
      race: string;
      income: string;
      personality: {
        extremeAnswers: { questionCode: string; questionText: string; response: number }[];
      };
    }
  
    interface SurveyQuestion {
      text: string;
      type: string;
      options?: string[];
    }
  
    interface ResponseHistoryItem {
      question: string;
      answer: string;
    }
  
    type Responses = Record<number, Record<string, string>>;
    type Personas = Record<number, Persona>;
  
    const generatedPersonas: Persona[] = Array.from({ length: numRespondents }, () =>
      getRandomPersonaWithBig5()
    );

    const newResponses: Responses = {};
    const newPersonas: Personas = {};
    const responseHistory: Record<number, ResponseHistoryItem[]> = {}; // Store response history
  
    for (let i = 0; i < numRespondents; i++) {
      const persona = generatedPersonas[i];
      newPersonas[i] = persona;
      responseHistory[i] = []; // Initialize history for this persona
  
      const personalityBullets: string =
        persona.personality?.extremeAnswers
          ?.map((extreme) => {
            const label = extreme.response === 5 ? "AGREE" : "DISAGREE";
            return `- ${extreme.questionCode} ("${extreme.questionText}"): ${label}`;
          })
          .join("\n") || "No extreme traits found";
  
      for (const question of survey.questions as SurveyQuestion[]) {
        try {
          const pastResponsesText: string =
            responseHistory[i].length > 0
              ? `Previously, you answered the following questions as this persona:\n${responseHistory[i]
                  .map((resp) => `- Q: "${resp.question}" A: "${resp.answer}"`)
                  .join("\n")}\n\n`
              : "";
  
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              persona,
              question: question.text,
              instructions: `You are acting as a survey respondent with the following demographic characteristics:
  - Age: ${persona.age}
  - Gender: ${persona.gender}
  - Race/Ethnicity: ${persona.race}
  - Income Level: ${persona.income}
  
  Your personality test results indicate extremes in the following areas:
  ${personalityBullets}
  
  ${pastResponsesText}Answer the following survey question as a person with this demographic and personality profile would. It is March 2025. Provide a natural, realistic, and curt response that reflects this background's typical perspectives, interests, or concerns.
  
  Survey Question: "${question.text}"
  Question Type: ${question.type}
  
  ${
    question.type === "multiple choice" && Array.isArray(question.options)
      ? `Available Options:\n${question.options
          .map((option, index) => `${index + 1}. ${option}`)
          .join("\n")}`
      : ""
  }
  
  If the question is multiple choice, please print exactly and only one number- (1, 2, 3, etc.), that corresponds to the option you choose.`,
            }),
          });
  
          const data = await response.json();
          if (data.answer) {
            if (!newResponses[i]) newResponses[i] = {};
            newResponses[i][question.text] = data.answer;
  
            setResponses((prevResponses) => ({
              ...prevResponses,
              [i]: {
                ...prevResponses[i],
                [question.text]: data.answer,
              },
            }));
  
            // Store response history for context in future responses
            responseHistory[i].push({
              question: question.text,
              answer: data.answer,
            });
  
            // Store responses in Firestore
            const surveyRef = doc(db, "surveys", id as string);
            const responsesCollection = collection(surveyRef, "responses");
            const responseDocRef = doc(responsesCollection);
  
            await setDoc(responseDocRef, {
              question: question.text,
              response: data.answer,
              generatedAt: new Date(),
              persona,
              createdBy: user.uid,
            });
          }
        } catch (error) {
          console.error("🔥 Firestore Write Error:", error);
        }
      }
    }

  
    setResponses(newResponses);
    setPersonas(newPersonas);
    setGenerating(false);
  };
  if (loading) {
    return <p className="p-8 text-black">Loading survey...</p>;
  }

  if (!survey) {
    return <p className="p-8 text-black">Survey not found.</p>;
  }

  return (
    <main className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">{survey.title}</h1>

      {/* Persona Selection Form */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg text-white font-semibold mb-2">Customize AI Respondents:</h2>
        <label className="block text-white mt-2">
  Number of AI Respondents:
  <select
    className="border p-2 w-full mt-1 text-black"
    value={numRespondents}
    onChange={(e) => setNumRespondents(Number(e.target.value))}
  >
    {[1, 5, 10, 20, 50, 100, 200, 300].map((num) => (
      <option key={num} value={num}>
        {num}
      </option>
    ))}

          </select>
          <p className="mt-4 text-lg">Total Token Cost: {tokenCost} tokens</p>
          <p className="text-sm text-gray-400">You currently have {tokens} tokens</p>
</label>




      </div>

      {/* Survey Questions and Responses */}
      <h2 className="text-xl font-semibold mb-2">Questions:</h2>
      <ul className="space-y-4">
        {survey.questions.map((q: any, index: number) => (
          <li key={index} className="border p-4 rounded">
            <p className="text-lg font-semibold">Question {index + 1}</p>
            <p className="text-white-800">{q.text}</p>
            {Object.entries(responses).map(([personaId, answers]) => (
  <div key={personaId} className="mt-2">
    <p className="font-semibold text-white">🧑 Persona {parseInt(personaId) + 1}:</p>
    <p className="text-blue-700">🤖 {answers[q.text] || "Generating..."}</p>
  </div>
))}
          </li>
        ))}
      </ul>

      {/* Generate AI Responses Button */}
      <button
        onClick={handleGenerateResponses}
        className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded ${
          generating ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={generating}
      >
        
        {generating ? "Generating AI Responses..." : "Generate AI Responses"}
      </button>
      {/* Export Responses to Excel Button */}
      <button
  onClick={() => exportResponsesToExcel(responses, personas)}
  className="mt-4 ml-4 bg-green-500 text-white px-4 py-2 rounded"
>
  📥 Download Excel
      </button>
      <Link href="/surveys">
      <button
  onClick={() => downloadCodebook(survey)}
  className="mt-4 ml-4 bg-purple-500 text-white px-4 py-2 rounded"
>
  📖 Get Codebook
</button>
    <button className="mt-4 ml-4  bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
      ⬅️ Back to Surveys
    </button>
  </Link>
    </main>
  );
}