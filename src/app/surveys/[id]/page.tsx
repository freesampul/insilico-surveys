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
import { FaUser, FaRobot, FaDownload, FaBook, FaArrowLeft } from "react-icons/fa";



export default function SurveyDetailPage() {
  const { user, tokens } = useAuth(); // Get the user and tokens from context

  const { id } = useParams();
  const [tokenCost, setTokenCost] = useState(1);
  const [survey, setSurvey] = useState<any>(null);
  const [numRespondents, setNumRespondents] = useState(100);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [responses, setResponses] = useState<{ [key: number]: { [question: string]: string } }>({});
  const [personas, setPersonas] = useState<{
    [key: string]: {
      age: string;
      gender: string;
      race: string;
      income: string;
      education: string;
      political: string;
      religion: string;
      mood: string;
      personality?: {
        extremeAnswers: Array<{
          questionCode: string;
          questionText: string;
          response: number;
        }>;
      };
    };
  }>({});

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
          const fetchedPersonas: {
            [key: number]: {
              age: string;
              gender: string;
              race: string;
              income: string;
              education: string;
              political: string;
              religion: string;
              mood: string;
              personality?: {
                extremeAnswers: Array<{
                  questionCode: string;
                  questionText: string;
                  response: number;
                }>;
              };
            };
          } = {};
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
      education: data.persona?.education || "Unknown",
      political: data.persona?.political || "Unknown",
      religion: data.persona?.religion || "Unknown",
      mood: data.persona?.mood || "Unknown",
      personality: data.persona?.personality || { extremeAnswers: [] },
    };
  }
  personaIndex++;
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
      age: string;        // e.g. "18-24"
      gender: string;     // e.g. "Male"
      race: string;       // e.g. "White"
      income: string;     // e.g. "$50,000 to $74,999"
      education: string;  // e.g. "High school diploma"
      political: string;  // e.g. "Liberal", "Conservative", "Moderate"
      religion: string;   // e.g. "Christian", "Atheist", "Muslim"
      mood: string;       // e.g. "Happy", "Frustrated", "Indifferent"
      personality: {
        extremeAnswers: Array<{
          questionCode: string;
          questionText: string;
          response: number; // 1 or 5
        }>;
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

      setPersonas((prevPersonas) => ({
        ...prevPersonas,
        [i]: persona, // Update persona for current respondent
      }))
      responseHistory[i] = []; // Initialize history for this persona

  
      const personalityBullets: string =
        persona.personality?.extremeAnswers
          ?.map((extreme) => {
            return `- "${extreme.questionText}"`;
          })
          .join("\n") || "No extreme traits found";
  
          for (const question of survey.questions as SurveyQuestion[]) {
            try {
              const pastResponsesText: string =
  responseHistory[i].length > 0
    ? `Previously, you answered the following questions as this persona:\n${responseHistory[i]
        .map((resp) => {
          // Find the corresponding question in the survey
          const questionObj = survey.questions.find((q: any) => q.text === resp.question);
          
          // Get the answer text by looking up the choice letter in the question options
          const answerText = questionObj 
            ? questionObj.options[resp.answer.charCodeAt(0) - 65] // Convert 'A' -> 0, 'B' -> 1, etc.
            : "Unknown";

          return `- Q: "${resp.question}"\n  A: "${answerText}"`;
        })
        .join("\n")}\n\n`
    : "";
        
              // Convert multiple-choice options to A, B, C format
              let letterOptions = "";
              if (question.type === "multiple choice" && Array.isArray(question.options)) {
                letterOptions = question.options
                  .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
                  .join("\n");
              }
  
              const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  persona,
                  question: question.text,
                  instructions: `You are acting as a survey respondent with the following demographic characteristics:
        - Age: ${persona.age}
        - Gender: ${persona.gender}
        - Race: ${persona.race}
        - Income: ${persona.income}
        - Education: ${persona.education}
        - Politics: ${persona.political}
        - Religion: ${persona.religion}
        - Mood: ${persona.mood}

        Your personality test results indicate that you STRONGLY AGREE with the following statements:
        ${personalityBullets}
        
        Your past responses to questions follow this text. Consider whether your past responses should influence your answer to this question.
        ${pastResponsesText} 

        Survey Response Rules
1. Be realistic and nuanced. People often have inconsistencies in their beliefs and behaviors.
2. Responses should feel natural and balanced, neither overly negative nor overly idealized.
3. If a question involves politics, health, or science, remember that people may have different perspectives, but avoid assuming extreme skepticism.
4. If uncertain, make an informed guess, reflecting what someone in this demographic might reasonably say.

        If the question is multiple choice, please print exactly and only one **capital letter** that corresponds to your chosen option. Do not include any additional text, numbers, or punctuation.
        
        Survey Question: "${question.text}"
        Question Type: ${question.type}
        
        ${
          question.type === "multiple-choice" && Array.isArray(question.options)
            ? `Q: "${question.text}"\nAvailable Options:\n${question.options
                .map((option, idx) => `${String.fromCharCode(65 + idx)}. ${option}`)
                .join("\n")}`
            : ""
        }
        
        `,
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

  
    setGenerating(false);
  };

  if (loading) {
    return <p className="p-8 text-black">Loading survey...</p>;
  }

  if (!survey) {
    return <p className="p-8 text-black">Survey not found.</p>;
  }

  return (
    
    <main className="p-8 bg-[#f5ebe0] min-h-screen flex flex-col items-center">
  {/* Survey Title */}
  <div className="text-center mb-4">
    <h1 className="text-5xl font-bold text-black">{survey.title}</h1>
  </div>

  {/* Buttons */}
  <div className="mt-4 mb-10 flex flex-wrap gap-1">
    {/* Generate AI Responses Button */}
    <button
      onClick={handleGenerateResponses}
      disabled={generating}
      className={`bg-blue-500 text-black flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-blue-600 transition ${
        generating ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <FaRobot /> {generating ? "Generating AI Responses..." : "Generate AI Responses"}
    </button>

    {/* Export Responses to Excel Button */}
    <button
      onClick={() => exportResponsesToExcel(responses, personas)}
      className="bg-green-500 text-white flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-green-600 transition"
    >
      <FaDownload /> Download Excel
    </button>

    {/* Get Codebook Button */}
    <button
      onClick={() => downloadCodebook(survey)}
      className="bg-purple-500 text-white flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-purple-600 transition"
    >
      <FaBook /> Get Codebook
    </button>

    {/* Back to Surveys Button */}
    <Link href="/surveys">
      <button className="bg-red-500 text-white flex items-center gap-2 px-5 py-3 rounded-lg hover:bg-red-600 transition">
        <FaArrowLeft /> Back to Surveys
      </button>
    </Link>
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
          <p className="mt-3 text-lg text-black">
          Total Token Cost: <span className="font-bold">{tokenCost}</span> tokens
        </p>
        <p className="text-sm text-black">
          You currently have <span className="font-bold">{tokens}</span> tokens
        </p>
</label>


{/* Survey Questions */}

<div className="w-full max-w-4xl mt-10">
  <h2 className="text-3xl font-semibold text-black mb-6">Survey Questions</h2>
  <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {survey.questions.map((q, index) => (
      <li key={index} className="bg-white/90 shadow-lg rounded-xl p-6">
        <p className="text-lg font-semibold text-black">Question {index + 1}</p>
        <p className="text-black">{q.text}</p>
        {q.type === "multiple-choice" && Array.isArray(q.options) && (
  <ul className="list-disc ml-5 mt-2">
    {q.options.map((option, idx) => {
      const optionLetter = String.fromCharCode(65 + idx);
      return (
        <li key={idx} className="text-black">
          {optionLetter}. {option}
        </li>
      );
    })}
  </ul>
)}
        {Object.entries(responses).map(([personaId, answers]) => {
          // Lookup the demographic info from the personas state
          const persona = personas[personaId];
          return (
            <div key={personaId} className="mt-3 p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <FaUser className="text-blue-500" />
                <div>
                  <p className="font-semibold text-black">
                    {`Persona ${parseInt(personaId, 10) + 1}`}
                  </p>
                  {persona ? (
                    <p className="text-sm text-gray-600">
                      {persona.age} | {persona.gender} | {persona.race}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">No demographic info available</p>
                  )}
                </div>
              </div>
              <p className="text-green-700 flex items-center gap-2 mt-2">
                <FaRobot /> {answers[q.text] || "Generating..."}
              </p>
            </div>
          );
        })}
      </li>
    ))}
  </ul>
</div>

      </div>

      

    </main>
  );
}