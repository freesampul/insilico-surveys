export interface Persona {
    age: string;
    gender: string;
    race: string;
    income: string;
  }
  
  const ageGroups = [
    { range: "Under 18", percentage: 22.3 },
    { range: "18-24", percentage: 9.6 },
    { range: "25-44", percentage: 26.5 },
    { range: "45-64", percentage: 25.4 },
    { range: "65 and over", percentage: 16.2 },
  ];
  
  const genders = [
    { gender: "Female", percentage: 50.8 },
    { gender: "Male", percentage: 49.2 },
  ];
  
  const races = [
    { race: "White", percentage: 76.3 },
    { race: "Black or African American", percentage: 13.4 },
    { race: "Asian", percentage: 5.9 },
    { race: "Two or more races", percentage: 2.8 },
    { race: "Other", percentage: 1.6 },
  ];
  
  const incomes = [
    { range: "Less than $25,000", percentage: 20 },
    { range: "$25,000 to $49,999", percentage: 24 },
    { range: "$50,000 to $74,999", percentage: 18 },
    { range: "$75,000 to $99,999", percentage: 12 },
    { range: "$100,000 to $149,999", percentage: 15 },
    { range: "$150,000 and over", percentage: 11 },
  ];
  
  function selectRandomGroup<T extends { percentage: number }>(groups: T[]): T {
    const rand = Math.random() * 100;
    let sum = 0;
    for (const group of groups) {
      sum += group.percentage;
      if (rand <= sum) {
        return group;
      }
    }
    return groups[groups.length - 1]; // Default fallback
  }
  
  export function getRandomPersona(): Persona {
    return {
      age: selectRandomGroup(ageGroups).range,
      gender: selectRandomGroup(genders).gender,
      race: selectRandomGroup(races).race,
      income: selectRandomGroup(incomes).range,
    };
  }