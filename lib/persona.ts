export interface Persona {
  age: string;        // e.g. "18-24"
  gender: string;     // e.g. "Male"
  race: string;       // e.g. "White"
  income: string;     // e.g. "$50,000 to $74,999"
  personality: {
    extremeAnswers: Array<{
      questionCode: string;
      questionText: string;
      response: number; // 1 or 5
    }>;
  };
}

// ---------------------------------------------
// 1) Mapping from question code to text
// ---------------------------------------------
const questionTextMap: Record<string, string> = {
  E1: "I am the life of the party.",
  E2: "I don't talk a lot.",
  E3: "I feel comfortable around people.",
  E4: "I keep in the background.",
  E5: "I start conversations.",
  E6: "I have little to say.",
  E7: "I talk to a lot of different people at parties.",
  E8: "I don't like to draw attention to myself.",
  E9: "I don't mind being the center of attention.",
  E10: "I am quiet around strangers.",
  N1: "I get stressed out easily.",
  N2: "I am relaxed most of the time.",
  N3: "I worry about things.",
  N4: "I seldom feel blue.",
  N5: "I am easily disturbed.",
  N6: "I get upset easily.",
  N7: "I change my mood a lot.",
  N8: "I have frequent mood swings.",
  N9: "I get irritated easily.",
  N10: "I often feel blue.",
  A1: "I feel little concern for others.",
  A2: "I am interested in people.",
  A3: "I insult people.",
  A4: "I sympathize with others' feelings.",
  A5: "I am not interested in other people's problems.",
  A6: "I have a soft heart.",
  A7: "I am not really interested in others.",
  A8: "I take time out for others.",
  A9: "I feel others' emotions.",
  A10: "I make people feel at ease.",
  C1: "I am always prepared.",
  C2: "I leave my belongings around.",
  C3: "I pay attention to details.",
  C4: "I make a mess of things.",
  C5: "I get chores done right away.",
  C6: "I often forget to put things back in their proper place.",
  C7: "I like order.",
  C8: "I shirk my duties.",
  C9: "I follow a schedule.",
  C10: "I am exacting in my work.",
  O1: "I have a rich vocabulary.",
  O2: "I have difficulty understanding abstract ideas.",
  O3: "I have a vivid imagination.",
  O4: "I am not interested in abstract ideas.",
  O5: "I have excellent ideas.",
  O6: "I do not have a good imagination.",
  O7: "I am quick to understand things.",
  O8: "I use difficult words.",
  O9: "I spend time reflecting on things.",
  O10: "I am full of ideas.",
};

// ---------------------------------------------
// 2) Existing demographic distributions
// ---------------------------------------------
const ageGroups = [
  { range: "Under 18",   percentage: 22.3 },
  { range: "18-24",      percentage:  9.6 },
  { range: "25-44",      percentage: 26.5 },
  { range: "45-64",      percentage: 25.4 },
  { range: "65 and over",percentage: 16.2 },
];

const genders = [
  { gender: "Female", percentage: 50.8 },
  { gender: "Male",   percentage: 49.2 },
];

const races = [
  { race: "White",                      percentage: 76.3 },
  { race: "Black or African American",  percentage: 13.4 },
  { race: "Asian",                      percentage:  5.9 },
  { race: "Two or more races",          percentage:  2.8 },
  { race: "Other",                      percentage:  1.6 },
];

const incomes = [
  { range: "Less than $25,000",   percentage: 20 },
  { range: "$25,000 to $49,999",  percentage: 24 },
  { range: "$50,000 to $74,999",  percentage: 18 },
  { range: "$75,000 to $99,999",  percentage: 12 },
  { range: "$100,000 to $149,999",percentage: 15 },
  { range: "$150,000 and over",   percentage: 11 },
];

// ---------------------------------------------
// 3) Helper to pick random item by distribution
// ---------------------------------------------
function selectRandomGroup<T extends { percentage: number }>(groups: T[]): T {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const group of groups) {
    sum += group.percentage;
    if (rand <= sum) return group;
  }
  return groups[groups.length - 1];
}

// ---------------------------------------------
// 4) Load & parse big5.csv
// ---------------------------------------------
async function fetchBig5Data(): Promise<any[]> {
  try {
    const response = await fetch("/api/persona");
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(data.slice(0, 5)); // Show first 5 rows for debugging
    return data;
  } catch (err) {
    console.error("Error fetching big5.csv from API:", err);
    return [];
  }
}

// Call this function wherever you need the data
let big5Data: any[] = [];
fetchBig5Data().then((data) => (big5Data = data));

// ---------------------------------------------
// 5) Map user-friendly race/gender to dataset codes
// ---------------------------------------------
function mapRaceLabelToCode(raceLabel: string): number[] {
  switch (raceLabel) {
    case "White":
      return [3]; 
    case "Black or African American":
      return [12];
    case "Asian":
      return [9, 11];
    case "Two or more races":
      return [1];
    default:
      return [13];
  }
}

function mapGenderLabelToCode(genderLabel: string): number[] {
  // 1=Male, 2=Female, 3=Other
  return genderLabel === "Male" ? [1] : [2];
}

function getAgeRangeBracket(ageString: string): [number, number] {
  switch (ageString) {
    case "Under 18":  return [13, 17];  // dataset excludes <13
    case "18-24":     return [18, 24];
    case "25-44":     return [25, 44];
    case "45-64":     return [45, 64];
    case "65 and over": return [65, 120];
    default:          return [13, 120];
  }
}

// ---------------------------------------------
// 6) Gather all extreme answers
// ---------------------------------------------
function getAllExtremeAnswers(
  participant: Record<string, string>,
  questionMap: Record<string, string>
): Array<{ questionCode: string; questionText: string; response: number }> {
  return Object.entries(participant)
    .filter(([key]) => /^[ENACO]\d+$/.test(key))
    .map(([questionCode, rawValue]) => {
      const value = parseInt(rawValue, 10);
      return { questionCode, value };
    })
    .filter(({ value }) => value === 1 || value === 5)
    .map(({ questionCode, value }) => ({
      questionCode,
      questionText: questionMap[questionCode] ?? "(Unknown question)",
      response: value,
    }));
}

// ---------------------------------------------
// 7) Main pipeline to get a persona
// ---------------------------------------------
export function getRandomPersonaWithBig5(): Persona {
  // Step 1: pick random demographic
  const ageItem = selectRandomGroup(ageGroups);
  const genderItem = selectRandomGroup(genders);
  const raceItem = selectRandomGroup(races);
  const incomeItem = selectRandomGroup(incomes);

  // Step 2: map demographics to big5 codes
  const raceCodes: number[] = mapRaceLabelToCode(raceItem.race);
  const genderCodes: number[] = mapGenderLabelToCode(genderItem.gender);
  const [minAge, maxAge]: [number, number] = getAgeRangeBracket(ageItem.range);

  // Step 3: filter big5Data
  const filtered = big5Data.filter((row) => {
    const rowRace = parseInt(row.race, 10);
    const rowGender = parseInt(row.gender, 10);
    const rowAge = parseInt(row.age, 10);

    return (
      raceCodes.includes(rowRace) &&
      genderCodes.includes(rowGender) &&
      !isNaN(rowAge) &&
      rowAge >= minAge &&
      rowAge <= maxAge
    );
  });

  // Fallback if no participants match
  const finalPool = filtered.length > 0 ? filtered : big5Data;

  // Step 4: pick random participant
  const randomParticipant = finalPool[Math.floor(Math.random() * finalPool.length)];

  // Step 5: gather all extremes
  const extremeAnswers = getAllExtremeAnswers(randomParticipant, questionTextMap);

  // **Fix:** Ensure the returned object fully conforms to `Persona`
  return {
    age: String(ageItem.range), // Ensuring it's a string
    gender: String(genderItem.gender),
    race: String(raceItem.race),
    income: String(incomeItem.range),
    personality: {
      extremeAnswers: extremeAnswers.map((extreme) => ({
        questionCode: String(extreme.questionCode),
        questionText: String(extreme.questionText),
        response: Number(extreme.response), // Ensuring number type
      })),
    },
  };
}