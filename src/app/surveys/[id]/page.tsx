"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../../lib/firebase";
import { getRandomPersonaWithBig5 } from "../../../../lib/persona";
import { exportResponsesToExcel } from "../../../../lib/export";
import Link from "next/link";


import { doc, getDoc, getDocs, collection, addDoc, writeBatch, setDoc } from "firebase/firestore";
import { useParams } from "next/navigation";


export default function SurveyDetailPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [numRespondents, setNumRespondents] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [responses, setResponses] = useState<{ [key: number]: { [question: string]: string } }>({});
  const [personas, setPersonas] = useState<{ [key: string]: { age: string; gender: string; race: string; income: string } }>({});

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
  
    // 1) Generate random personas with Big Five extremes
    const generatedPersonas = Array.from({ length: numRespondents }, () =>
      getRandomPersonaWithBig5()
    );
  
    const newResponses: Record<number, Record<string, string>> = {};
    const newPersonas: { [key: string]: any } = {};
  
    for (let i = 0; i < numRespondents; i++) {
      const persona = generatedPersonas[i];
      // ✅ Store persona info for future use/export
      newPersonas[i] = persona;
  
      // 2) Build a bullet list of personality extremes
      const personalityBullets =
        persona.personality?.extremeAnswers
          ?.map((extreme: any) => {
            // Determine "AGREE" vs. "DISAGREE"
            const label = extreme.response === 5 ? "AGREE" : "DISAGREE";
            return `- ${extreme.questionCode} ("${extreme.questionText}"): ${label}`;
          })
          .join("\n") || "No extreme traits found";
  
      // For each survey question, ask the LLM
      for (const question of survey.questions) {
        try {
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
  
  Answer the following survey question *as a person with this demographic and personality profile would*. Provide a natural, realistic response that reflects this background's typical perspectives, interests, or concerns.
  
  Survey Question: "${question.text}"
  Question Type: ${question.type}
  
  ${
    question.type === "multiple choice"
      ? `Available Options: ${question.options?.join(", ")}`
      : ""
  }
  
  If the question is multiple choice, just provide VERBATIM ONE of the available options that mostly matches your character.`,
            }),
          });
  
          const data = await response.json();
          if (data.answer) {
            // 3) Save the LLM's answer in local state
            if (!newResponses[i]) newResponses[i] = {};
            newResponses[i][question.text] = data.answer;
  
            setResponses((prevResponses) => ({
              ...prevResponses,
              [i]: {
                ...prevResponses[i],
                [question.text]: data.answer,
              },
            }));
  
            // 4) Save the persona used for this response (optional)
            //    Overwrites by question text — if you want per-respondent
            //    you can skip or store differently.
            newPersonas[question.text] = { ...persona };
  
            // 5) Store responses in Firestore
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
  
    // Update state with all responses & personas
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
    {[1, 5, 10, 20, 50, 100].map((num) => (
      <option key={num} value={num}>
        {num}
      </option>
    ))}
          </select>
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
    <button className="mt-4 ml-4  bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
      ⬅️ Back to Surveys
    </button>
  </Link>
    </main>
  );
}