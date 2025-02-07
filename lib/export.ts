import * as XLSX from "xlsx";

export function exportResponsesToExcel(
  responses: Record<number, Record<string, string>>,
  personas: Record<number, {
    age: string;
    gender: string;
    race: string;
    income: string;
    personality?: {
      extremeAnswers: Array<{
        questionCode: string;
        questionText: string;
        response: number;
      }>;
    };
  }>
) {
  // If there's at least one respondent, grab the question titles
  const respondentIds = Object.keys(responses);
  if (respondentIds.length === 0) {
    alert("No responses to export.");
    return;
  }

  // Dynamically gather question titles from the first respondent
  const firstRespondentId = respondentIds[0] as unknown as number;
  const questions = Object.keys(responses[firstRespondentId] || {});

  // 👉 Define the headers (including new "Personality Extremes")
  const headers = [
    "Age",
    "Gender",
    "Race/Ethnicity",
    "Income Level",
    "Personality Extremes", 
    ...questions,
  ];

  // 👉 Build worksheet data
  const worksheetData = respondentIds.map((personaIdString) => {
    const personaId = Number(personaIdString);
    const answers = responses[personaId] || {};
    const persona = personas[personaId] || {
      age: "Unknown",
      gender: "Unknown",
      race: "Unknown",
      income: "Unknown",
      personality: { extremeAnswers: [] },
    };

    // Convert the extremeAnswers array into a single string
    let personalityString = "";
    if (persona.personality?.extremeAnswers?.length) {
      personalityString = persona.personality.extremeAnswers
        .map(
          (extreme) =>
            `${extreme.questionCode}="${extreme.questionText}" (rating=${extreme.response})`
        )
        .join(" | ");
    } else {
      personalityString = "None";
    }

    // Return a row object with the header matching keys
    return {
      Age: persona.age,
      Gender: persona.gender,
      "Race/Ethnicity": persona.race,
      "Income Level": persona.income,
      "Personality Extremes": personalityString,
      // Merge in all question responses
      ...questions.reduce((acc, question) => {
        acc[question] = answers[question] || "No Response";
        return acc;
      }, {} as Record<string, string>),
    };
  });

  // Create a worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: headers });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");

  XLSX.writeFile(workbook, "Survey_Responses.xlsx");
}

export const downloadCodebook = (survey: any) => {
  if (!survey || !survey.questions) {
    alert("Survey data is missing.");
    return;
  }

  let codebookContent = `Survey Codebook: ${survey.title}\n\n`;
  
  survey.questions.forEach((q: any, index: number) => {
    codebookContent += `Question ${index + 1}: ${q.text}\n`;
    
    if (q.type === "multiple-choice" && Array.isArray(q.options)) {
      q.options.forEach((option: string, idx: number) => {
        codebookContent += `  ${idx + 1}. ${option}\n`;
      });
    }
    
    codebookContent += "\n";
  });

  const blob = new Blob([codebookContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${survey.title.replace(/\s+/g, "_")}_codebook.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};