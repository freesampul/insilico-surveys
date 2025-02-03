import * as XLSX from "xlsx";

export function exportResponsesToExcel(
  responses: Record<number, Record<string, string>>,
  personas: Record<number, { age: string; gender: string; race: string; income: string }>
) {
  // ✅ Extract all question titles dynamically
  const questions = Object.keys(responses[Object.keys(responses)[0] as unknown as number] || {});

  // ✅ Define the header row
  const headers = ["Age", "Gender", "Race/Ethnicity", "Income Level", ...questions];

  // ✅ Format data for each respondent
  const worksheetData = Object.entries(responses).map(([personaIdString, answers]) => {
    const personaId = Number(personaIdString); // ✅ Ensure personaId is treated as a number
    const persona = personas[personaId] || { age: "Unknown", gender: "Unknown", race: "Unknown", income: "Unknown" };

    return {
      Age: persona.age,
      Gender: persona.gender,
      "Race/Ethnicity": persona.race,
      "Income Level": persona.income,
      ...questions.reduce((acc, question) => {
        acc[question] = answers[question] || "No Response";
        return acc;
      }, {} as Record<string, string>),
    };
  });

  // ✅ Create and export the Excel file
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");

  XLSX.writeFile(workbook, "Survey_Responses.xlsx");
}