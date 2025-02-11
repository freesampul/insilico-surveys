"use client";

import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";


export default function CreateSurveyPage() {
  const { user } = useAuth(); // Get logged-in user
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ text: "", type: "short-answer", options: [""] }]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", type: "short-answer", options: [""] }]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  const handleTypeChange = (index: number, type: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = type;
    if (type === "multiple-choice" && !updatedQuestions[index].options) {
      updatedQuestions[index].options = [""];
    }
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options.push("");
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    if (!title || questions.length === 0 || !user) return;
    try {
      await addDoc(collection(db, "surveys"), {
        title,
        questions,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      alert("Survey created!");
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Failed to create survey");
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Create a Survey</h1>

      {/* Survey Title */}
      <input
        className="border p-2 w-full mb-4 text-black"
        placeholder="Survey Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Questions */}
      {questions.map((q, index) => (
        <div key={index} className="mb-4">
          <p className="text-black font-semibold mb-2">Question {index + 1}</p>
          
          {/* Question Input */}
          <input
            className="border p-2 w-full mb-2 text-black"
            placeholder="Enter question"
            value={q.text}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />

          {/* Question Type Selector */}
          <select
            className="border p-2 w-full mb-2 text-black"
            value={q.type}
            onChange={(e) => handleTypeChange(index, e.target.value)}
          >
            <option value="short-answer">Short Answer</option>
            <option value="multiple-choice">Multiple Choice</option>
          </select>

          {/* Multiple Choice Options */}
          {q.type === "multiple-choice" && (
            <div className="ml-4">
              {q.options.map((option, oIndex) => (
                <input
                  key={oIndex}
                  className="border p-2 w-full mb-2 text-black"
                  placeholder={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                />
              ))}
              <button onClick={() => handleAddOption(index)} className="bg-gray-300 px-4 py-2 rounded text-black">
                + Add Option
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add Question & Save Survey */}
      <div className="flex gap-4 mt-6">
  {/* Add Question Button */}
  <button onClick={handleAddQuestion} className="bg-gray-300 px-4 py-2 rounded text-black">
    + Add Question
  </button>

  {/* Save Survey Button */}
  <button onClick={handleSubmit} className="bg-blue-500 text-black px-4 py-2 rounded">
    Save Survey
  </button>

  {/* Back to Surveys Button */}
  <Link href="/surveys">
    <button className="bg-red-500 text-black px-4 py-2 rounded hover:bg-red-600">
      ⬅️ Back to Surveys
    </button>
  </Link>
</div>
    </main>
  );
}