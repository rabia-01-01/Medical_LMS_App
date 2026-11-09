/**
 * Official IMAT 350-Question Bank parsed directly from imat_question_bank.md
 * Source: IMAT Syllabus (Ministry of University and Research, Italy)
 * Used by Admin & Faculty AI MCQ Generator for 100% faithful, non-hallucinated quiz creation.
 */

export interface IMATBankQuestion {
  id: number;
  qNum: number;
  subject: string;
  chapter: string;
  topic?: string;
  passage?: string;
  question: string;
  options: { letter: string; text: string }[];
  answerLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
}

export interface GeneratedMCQ {
  id: number;
  question: string;
  passage?: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  negativeMarks: number;
  explanation: string;
}

export const IMAT_QUESTION_BANK: IMATBankQuestion[] = [
  {
    "qNum": 1,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Vaccination trains the immune system to recognize a pathogen without requiring a person to experience the full disease. A vaccine may contain an inactivated pathogen, a harmless component of it, or instructions that enable cells to produce a target antigen. After vaccination, immune cells can form memory responses. Protection is not always immediate, and its strength can vary with the vaccine and the individual.",
    "question": "What is the central idea of the passage?",
    "options": [
      {
        "letter": "A",
        "text": "Vaccines always prevent every infection."
      },
      {
        "letter": "B",
        "text": "Vaccines prepare the immune system to recognize a pathogen."
      },
      {
        "letter": "C",
        "text": "Vaccines work only by containing live pathogens."
      },
      {
        "letter": "D",
        "text": "Vaccines remove all pathogens from the environment."
      }
    ],
    "answerLetter": "B",
    "explanation": "The passage explains how vaccination prepares immune recognition and memory.",
    "id": 1
  },
  {
    "qNum": 2,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Vaccination trains the immune system to recognize a pathogen without requiring a person to experience the full disease. A vaccine may contain an inactivated pathogen, a harmless component of it, or instructions that enable cells to produce a target antigen. After vaccination, immune cells can form memory responses. Protection is not always immediate, and its strength can vary with the vaccine and the individual.",
    "question": "In the passage, “inactivated” most nearly means:",
    "options": [
      {
        "letter": "A",
        "text": "Made unable to cause the usual infection."
      },
      {
        "letter": "B",
        "text": "Made more infectious."
      },
      {
        "letter": "C",
        "text": "Removed from the body."
      },
      {
        "letter": "D",
        "text": "Able to reproduce rapidly."
      }
    ],
    "answerLetter": "A",
    "explanation": "An inactivated pathogen has been rendered unable to cause the usual disease.",
    "id": 2
  },
  {
    "qNum": 3,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Vaccination trains the immune system to recognize a pathogen without requiring a person to experience the full disease. A vaccine may contain an inactivated pathogen, a harmless component of it, or instructions that enable cells to produce a target antigen. After vaccination, immune cells can form memory responses. Protection is not always immediate, and its strength can vary with the vaccine and the individual.",
    "question": "Which statement is supported by the passage?",
    "options": [
      {
        "letter": "A",
        "text": "Every vaccine contains a complete pathogen."
      },
      {
        "letter": "B",
        "text": "Protection begins immediately in all people."
      },
      {
        "letter": "C",
        "text": "Some vaccines provide cells with instructions to make an antigen."
      },
      {
        "letter": "D",
        "text": "Immune memory is unrelated to vaccination."
      }
    ],
    "answerLetter": "C",
    "explanation": "The passage explicitly describes vaccine instructions that lead cells to produce a target antigen.",
    "id": 3
  },
  {
    "qNum": 4,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Vaccination trains the immune system to recognize a pathogen without requiring a person to experience the full disease. A vaccine may contain an inactivated pathogen, a harmless component of it, or instructions that enable cells to produce a target antigen. After vaccination, immune cells can form memory responses. Protection is not always immediate, and its strength can vary with the vaccine and the individual.",
    "question": "The phrase “its strength” refers to the strength of:",
    "options": [
      {
        "letter": "A",
        "text": "The pathogen."
      },
      {
        "letter": "B",
        "text": "The immune response or protection."
      },
      {
        "letter": "C",
        "text": "The vaccine packaging."
      },
      {
        "letter": "D",
        "text": "The infection period."
      }
    ],
    "answerLetter": "B",
    "explanation": "The nearest relevant idea is the protection generated after vaccination.",
    "id": 4
  },
  {
    "qNum": 5,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Vaccination trains the immune system to recognize a pathogen without requiring a person to experience the full disease. A vaccine may contain an inactivated pathogen, a harmless component of it, or instructions that enable cells to produce a target antigen. After vaccination, immune cells can form memory responses. Protection is not always immediate, and its strength can vary with the vaccine and the individual.",
    "question": "Which conclusion is most reasonable?",
    "options": [
      {
        "letter": "A",
        "text": "Vaccination can create immune memory."
      },
      {
        "letter": "B",
        "text": "Vaccination guarantees lifelong immunity in everyone."
      },
      {
        "letter": "C",
        "text": "A vaccine must cause the disease to work."
      },
      {
        "letter": "D",
        "text": "Vaccines act only outside the body."
      }
    ],
    "answerLetter": "A",
    "explanation": "The passage states that immune cells can form memory responses.",
    "id": 5
  },
  {
    "qNum": 6,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Urban trees can reduce heat exposure by shading streets and releasing water vapour through transpiration. Their benefits are not distributed equally: neighbourhoods with fewer trees may experience higher surface temperatures. Planting programmes are most effective when they select suitable species, provide long-term maintenance, and involve residents in decisions.",
    "question": "Which factor is identified as one way trees reduce heat?",
    "options": [
      {
        "letter": "A",
        "text": "Increasing road width."
      },
      {
        "letter": "B",
        "text": "Releasing water vapour through transpiration."
      },
      {
        "letter": "C",
        "text": "Absorbing all incoming sound."
      },
      {
        "letter": "D",
        "text": "Preventing rainfall."
      }
    ],
    "answerLetter": "B",
    "explanation": "Transpiration releases water vapour and contributes to cooling.",
    "id": 6
  },
  {
    "qNum": 7,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Urban trees can reduce heat exposure by shading streets and releasing water vapour through transpiration. Their benefits are not distributed equally: neighbourhoods with fewer trees may experience higher surface temperatures. Planting programmes are most effective when they select suitable species, provide long-term maintenance, and involve residents in decisions.",
    "question": "The passage suggests that tree benefits may be unequal because:",
    "options": [
      {
        "letter": "A",
        "text": "All neighbourhoods have identical tree cover."
      },
      {
        "letter": "B",
        "text": "Some neighbourhoods have fewer trees."
      },
      {
        "letter": "C",
        "text": "Trees grow only in rural areas."
      },
      {
        "letter": "D",
        "text": "Surface temperature cannot be measured."
      }
    ],
    "answerLetter": "B",
    "explanation": "Unequal tree cover can produce unequal exposure to heat.",
    "id": 7
  },
  {
    "qNum": 8,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Urban trees can reduce heat exposure by shading streets and releasing water vapour through transpiration. Their benefits are not distributed equally: neighbourhoods with fewer trees may experience higher surface temperatures. Planting programmes are most effective when they select suitable species, provide long-term maintenance, and involve residents in decisions.",
    "question": "Which programme is most consistent with the passage?",
    "options": [
      {
        "letter": "A",
        "text": "Plant any species and provide no further care."
      },
      {
        "letter": "B",
        "text": "Choose suitable species, maintain them, and consult residents."
      },
      {
        "letter": "C",
        "text": "Remove mature trees before planting new ones."
      },
      {
        "letter": "D",
        "text": "Restrict planting to private gardens."
      }
    ],
    "answerLetter": "B",
    "explanation": "These are the three elements of an effective programme named in the passage.",
    "id": 8
  },
  {
    "qNum": 9,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Urban trees can reduce heat exposure by shading streets and releasing water vapour through transpiration. Their benefits are not distributed equally: neighbourhoods with fewer trees may experience higher surface temperatures. Planting programmes are most effective when they select suitable species, provide long-term maintenance, and involve residents in decisions.",
    "question": "“Transpiration” in this context is most closely related to:",
    "options": [
      {
        "letter": "A",
        "text": "Water loss from plant surfaces."
      },
      {
        "letter": "B",
        "text": "Mineral formation in soil."
      },
      {
        "letter": "C",
        "text": "Seed dispersal by wind."
      },
      {
        "letter": "D",
        "text": "Pollination by insects."
      }
    ],
    "answerLetter": "A",
    "explanation": "Plant transpiration is the loss of water vapour, mainly through leaves.",
    "id": 9
  },
  {
    "qNum": 10,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "Urban trees can reduce heat exposure by shading streets and releasing water vapour through transpiration. Their benefits are not distributed equally: neighbourhoods with fewer trees may experience higher surface temperatures. Planting programmes are most effective when they select suitable species, provide long-term maintenance, and involve residents in decisions.",
    "question": "What is the author’s main purpose?",
    "options": [
      {
        "letter": "A",
        "text": "To describe the cooling benefits of urban trees and conditions for successful planting."
      },
      {
        "letter": "B",
        "text": "To argue that trees should be removed from cities."
      },
      {
        "letter": "C",
        "text": "To compare different building materials."
      },
      {
        "letter": "D",
        "text": "To explain the history of forestry."
      }
    ],
    "answerLetter": "A",
    "explanation": "The passage gives mechanisms, unequal benefits, and planning conditions.",
    "id": 10
  },
  {
    "qNum": 11,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "Choose the sentence with correct subject–verb agreement.",
    "options": [
      {
        "letter": "A",
        "text": "The list of topics are on the desk."
      },
      {
        "letter": "B",
        "text": "The list of topics is on the desk."
      },
      {
        "letter": "C",
        "text": "The list of topics were on the desk."
      },
      {
        "letter": "D",
        "text": "The list of topics have on the desk."
      }
    ],
    "answerLetter": "B",
    "explanation": "The head noun “list” is singular, so “is” is correct.",
    "id": 11
  },
  {
    "qNum": 12,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "Choose the best connector: “The sample was small; ___, the result should be interpreted cautiously.”",
    "options": [
      {
        "letter": "A",
        "text": "therefore"
      },
      {
        "letter": "B",
        "text": "nevertheless"
      },
      {
        "letter": "C",
        "text": "similarly"
      },
      {
        "letter": "D",
        "text": "for example"
      }
    ],
    "answerLetter": "A",
    "explanation": "A small sample is the reason for cautious interpretation.",
    "id": 12
  },
  {
    "qNum": 13,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "Which word is closest in meaning to “infer”?",
    "options": [
      {
        "letter": "A",
        "text": "Conclude from evidence."
      },
      {
        "letter": "B",
        "text": "Copy exactly."
      },
      {
        "letter": "C",
        "text": "Measure physically."
      },
      {
        "letter": "D",
        "text": "Reject automatically."
      }
    ],
    "answerLetter": "A",
    "explanation": "To infer is to reach a conclusion using available evidence.",
    "id": 13
  },
  {
    "qNum": 14,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "Which word is the opposite of “scarce”?",
    "options": [
      {
        "letter": "A",
        "text": "Rare."
      },
      {
        "letter": "B",
        "text": "Limited."
      },
      {
        "letter": "C",
        "text": "Abundant."
      },
      {
        "letter": "D",
        "text": "Insufficient."
      }
    ],
    "answerLetter": "C",
    "explanation": "“Abundant” means plentiful, the opposite of scarce.",
    "id": 14
  },
  {
    "qNum": 15,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "Choose the grammatically correct sentence.",
    "options": [
      {
        "letter": "A",
        "text": "Neither of the answers are correct."
      },
      {
        "letter": "B",
        "text": "Neither of the answers is correct."
      },
      {
        "letter": "C",
        "text": "Neither answers is correct."
      },
      {
        "letter": "D",
        "text": "Neither of answer are correct."
      }
    ],
    "answerLetter": "B",
    "explanation": "“Neither” is treated as singular in standard formal usage.",
    "id": 15
  },
  {
    "qNum": 16,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "In an argument, a “premise” is:",
    "options": [
      {
        "letter": "A",
        "text": "A statement offered as a basis for a conclusion."
      },
      {
        "letter": "B",
        "text": "The conclusion itself in every case."
      },
      {
        "letter": "C",
        "text": "An unrelated example."
      },
      {
        "letter": "D",
        "text": "A numerical answer only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Premises are supporting statements from which an argument draws a conclusion.",
    "id": 16
  },
  {
    "qNum": 17,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "Which sentence is most concise and clear?",
    "options": [
      {
        "letter": "A",
        "text": "Due to the fact that the test was delayed, we waited."
      },
      {
        "letter": "B",
        "text": "Because the test was delayed, we waited."
      },
      {
        "letter": "C",
        "text": "The test being delayed was the reason why we waited because of it."
      },
      {
        "letter": "D",
        "text": "We waited for the reason of the delayed test."
      }
    ],
    "answerLetter": "B",
    "explanation": "It communicates the same relation with fewer unnecessary words.",
    "id": 17
  },
  {
    "qNum": 18,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "Reading comprehension and language skills",
    "topic": "",
    "passage": "",
    "question": "A text’s “coherence” refers mainly to:",
    "options": [
      {
        "letter": "A",
        "text": "Logical connection and overall sense between ideas."
      },
      {
        "letter": "B",
        "text": "The number of words in each sentence."
      },
      {
        "letter": "C",
        "text": "The use of difficult vocabulary only."
      },
      {
        "letter": "D",
        "text": "The font size of the text."
      }
    ],
    "answerLetter": "A",
    "explanation": "Coherence is the logical organisation that makes a text understandable as a whole.",
    "id": 18
  },
  {
    "qNum": 19,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The European Union’s principal executive body, responsible for proposing legislation and monitoring its application, is the:",
    "options": [
      {
        "letter": "A",
        "text": "European Commission."
      },
      {
        "letter": "B",
        "text": "European Court of Auditors."
      },
      {
        "letter": "C",
        "text": "European Central Bank."
      },
      {
        "letter": "D",
        "text": "Council of Europe."
      }
    ],
    "answerLetter": "A",
    "explanation": "The European Commission proposes EU legislation and oversees implementation of EU law.",
    "id": 19
  },
  {
    "qNum": 20,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The European Parliament is directly elected by:",
    "options": [
      {
        "letter": "A",
        "text": "The citizens of EU member states."
      },
      {
        "letter": "B",
        "text": "The United Nations."
      },
      {
        "letter": "C",
        "text": "National supreme courts."
      },
      {
        "letter": "D",
        "text": "The European Central Bank."
      }
    ],
    "answerLetter": "A",
    "explanation": "EU citizens elect members of the European Parliament.",
    "id": 20
  },
  {
    "qNum": 21,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The United Nations was established primarily after:",
    "options": [
      {
        "letter": "A",
        "text": "World War I."
      },
      {
        "letter": "B",
        "text": "World War II."
      },
      {
        "letter": "C",
        "text": "The Cold War ended."
      },
      {
        "letter": "D",
        "text": "The French Revolution."
      }
    ],
    "answerLetter": "B",
    "explanation": "The UN was founded in 1945 after World War II.",
    "id": 21
  },
  {
    "qNum": 22,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Which UN body has primary responsibility for international peace and security?",
    "options": [
      {
        "letter": "A",
        "text": "Security Council."
      },
      {
        "letter": "B",
        "text": "General Assembly Secretariat."
      },
      {
        "letter": "C",
        "text": "International Labour Organization."
      },
      {
        "letter": "D",
        "text": "UNESCO World Heritage Committee."
      }
    ],
    "answerLetter": "A",
    "explanation": "The Security Council has primary responsibility for maintaining international peace and security.",
    "id": 22
  },
  {
    "qNum": 23,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The World Health Organization is a specialised agency of the:",
    "options": [
      {
        "letter": "A",
        "text": "European Union."
      },
      {
        "letter": "B",
        "text": "United Nations."
      },
      {
        "letter": "C",
        "text": "World Trade Organization."
      },
      {
        "letter": "D",
        "text": "International Olympic Committee."
      }
    ],
    "answerLetter": "B",
    "explanation": "WHO is the UN specialised agency for international public health.",
    "id": 23
  },
  {
    "qNum": 24,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The capital city of Italy is:",
    "options": [
      {
        "letter": "A",
        "text": "Milan."
      },
      {
        "letter": "B",
        "text": "Venice."
      },
      {
        "letter": "C",
        "text": "Rome."
      },
      {
        "letter": "D",
        "text": "Florence."
      }
    ],
    "answerLetter": "C",
    "explanation": "Rome is Italy’s capital.",
    "id": 24
  },
  {
    "qNum": 25,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The Apennine Mountains run mainly along the:",
    "options": [
      {
        "letter": "A",
        "text": "Italian peninsula."
      },
      {
        "letter": "B",
        "text": "Iberian peninsula."
      },
      {
        "letter": "C",
        "text": "Scandinavian peninsula."
      },
      {
        "letter": "D",
        "text": "Arabian peninsula."
      }
    ],
    "answerLetter": "A",
    "explanation": "The Apennines form the mountainous backbone of much of Italy.",
    "id": 25
  },
  {
    "qNum": 26,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The river that flows through Rome is the:",
    "options": [
      {
        "letter": "A",
        "text": "Po."
      },
      {
        "letter": "B",
        "text": "Tiber."
      },
      {
        "letter": "C",
        "text": "Arno."
      },
      {
        "letter": "D",
        "text": "Danube."
      }
    ],
    "answerLetter": "B",
    "explanation": "The Tiber (Tevere) flows through Rome.",
    "id": 26
  },
  {
    "qNum": 27,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The Renaissance began as a major cultural movement in:",
    "options": [
      {
        "letter": "A",
        "text": "Italy."
      },
      {
        "letter": "B",
        "text": "Iceland."
      },
      {
        "letter": "C",
        "text": "Canada."
      },
      {
        "letter": "D",
        "text": "Japan."
      }
    ],
    "answerLetter": "A",
    "explanation": "The Renaissance began in Italian city-states before spreading through Europe.",
    "id": 27
  },
  {
    "qNum": 28,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The French Revolution began in:",
    "options": [
      {
        "letter": "A",
        "text": "1492."
      },
      {
        "letter": "B",
        "text": "1648."
      },
      {
        "letter": "C",
        "text": "1789."
      },
      {
        "letter": "D",
        "text": "1914."
      }
    ],
    "answerLetter": "C",
    "explanation": "The French Revolution began in 1789.",
    "id": 28
  },
  {
    "qNum": 29,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The First World War began in:",
    "options": [
      {
        "letter": "A",
        "text": "1815."
      },
      {
        "letter": "B",
        "text": "1914."
      },
      {
        "letter": "C",
        "text": "1939."
      },
      {
        "letter": "D",
        "text": "1945."
      }
    ],
    "answerLetter": "B",
    "explanation": "The war began in 1914.",
    "id": 29
  },
  {
    "qNum": 30,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The Second World War in Europe ended in:",
    "options": [
      {
        "letter": "A",
        "text": "1918."
      },
      {
        "letter": "B",
        "text": "1933."
      },
      {
        "letter": "C",
        "text": "1945."
      },
      {
        "letter": "D",
        "text": "1961."
      }
    ],
    "answerLetter": "C",
    "explanation": "Germany surrendered in May 1945; the war ended later in 1945 globally.",
    "id": 30
  },
  {
    "qNum": 31,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The Equator divides Earth into the:",
    "options": [
      {
        "letter": "A",
        "text": "Eastern and Western Hemispheres."
      },
      {
        "letter": "B",
        "text": "Northern and Southern Hemispheres."
      },
      {
        "letter": "C",
        "text": "Arctic and Antarctic regions."
      },
      {
        "letter": "D",
        "text": "Old and New Worlds."
      }
    ],
    "answerLetter": "B",
    "explanation": "The Equator is at 0° latitude and separates the Northern and Southern Hemispheres.",
    "id": 31
  },
  {
    "qNum": 32,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Lines of longitude are used primarily to measure position:",
    "options": [
      {
        "letter": "A",
        "text": "East or west of the Prime Meridian."
      },
      {
        "letter": "B",
        "text": "North or south of the Equator."
      },
      {
        "letter": "C",
        "text": "Above or below sea level."
      },
      {
        "letter": "D",
        "text": "Near or far from the poles only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Longitude measures angular distance east or west of the Prime Meridian.",
    "id": 32
  },
  {
    "qNum": 33,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Which is the largest ocean on Earth?",
    "options": [
      {
        "letter": "A",
        "text": "Atlantic."
      },
      {
        "letter": "B",
        "text": "Indian."
      },
      {
        "letter": "C",
        "text": "Arctic."
      },
      {
        "letter": "D",
        "text": "Pacific."
      }
    ],
    "answerLetter": "D",
    "explanation": "The Pacific is the largest ocean by area.",
    "id": 33
  },
  {
    "qNum": 34,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "A “constitutional state” is generally one in which:",
    "options": [
      {
        "letter": "A",
        "text": "Public power is limited and organised by a constitution and law."
      },
      {
        "letter": "B",
        "text": "The government is above all laws."
      },
      {
        "letter": "C",
        "text": "Courts have no role."
      },
      {
        "letter": "D",
        "text": "Elections are always prohibited."
      }
    ],
    "answerLetter": "A",
    "explanation": "Constitutional government is constrained by a legal framework.",
    "id": 34
  },
  {
    "qNum": 35,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The principle of separation of powers divides governmental authority among:",
    "options": [
      {
        "letter": "A",
        "text": "Legislative, executive and judicial branches."
      },
      {
        "letter": "B",
        "text": "Schools, hospitals and banks."
      },
      {
        "letter": "C",
        "text": "Provinces, cities and villages only."
      },
      {
        "letter": "D",
        "text": "Public companies and private companies."
      }
    ],
    "answerLetter": "A",
    "explanation": "The classic model separates law-making, law-execution and adjudication.",
    "id": 35
  },
  {
    "qNum": 36,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "In a democracy, the legitimacy of elected representatives is primarily based on:",
    "options": [
      {
        "letter": "A",
        "text": "Inherited status."
      },
      {
        "letter": "B",
        "text": "Public elections."
      },
      {
        "letter": "C",
        "text": "Military rank."
      },
      {
        "letter": "D",
        "text": "Ownership of land."
      }
    ],
    "answerLetter": "B",
    "explanation": "Democratic representatives obtain authority through elections.",
    "id": 36
  },
  {
    "qNum": 37,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Gross Domestic Product (GDP) measures the:",
    "options": [
      {
        "letter": "A",
        "text": "Market value of final goods and services produced within a country in a period."
      },
      {
        "letter": "B",
        "text": "Total wealth held by every citizen abroad."
      },
      {
        "letter": "C",
        "text": "Number of people employed by government."
      },
      {
        "letter": "D",
        "text": "Value of imports alone."
      }
    ],
    "answerLetter": "A",
    "explanation": "GDP measures domestic production of final goods and services over a specified period.",
    "id": 37
  },
  {
    "qNum": 38,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Inflation is a sustained increase in:",
    "options": [
      {
        "letter": "A",
        "text": "The general price level."
      },
      {
        "letter": "B",
        "text": "The physical size of currency notes."
      },
      {
        "letter": "C",
        "text": "The number of firms only."
      },
      {
        "letter": "D",
        "text": "The exchange rate in every case."
      }
    ],
    "answerLetter": "A",
    "explanation": "Inflation is a general, sustained rise in prices.",
    "id": 38
  },
  {
    "qNum": 39,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "A progressive tax system generally means that:",
    "options": [
      {
        "letter": "A",
        "text": "The tax rate rises as taxable income rises."
      },
      {
        "letter": "B",
        "text": "Everyone pays exactly the same amount."
      },
      {
        "letter": "C",
        "text": "Only imported goods are taxed."
      },
      {
        "letter": "D",
        "text": "The tax rate falls as income rises."
      }
    ],
    "answerLetter": "A",
    "explanation": "Progressive taxation applies higher rates to higher income bands.",
    "id": 39
  },
  {
    "qNum": 40,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Which is an example of a fundamental civil right in many constitutional democracies?",
    "options": [
      {
        "letter": "A",
        "text": "Freedom of expression, subject to lawful limits."
      },
      {
        "letter": "B",
        "text": "A right to ignore every law."
      },
      {
        "letter": "C",
        "text": "A guarantee of unlimited income."
      },
      {
        "letter": "D",
        "text": "A right to prevent all criticism."
      }
    ],
    "answerLetter": "A",
    "explanation": "Freedom of expression is a widely recognised civil right, though it may be subject to lawful restrictions.",
    "id": 40
  },
  {
    "qNum": 41,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The term “sustainable development” most closely refers to development that:",
    "options": [
      {
        "letter": "A",
        "text": "Meets present needs without undermining future generations’ ability to meet theirs."
      },
      {
        "letter": "B",
        "text": "Uses all natural resources as quickly as possible."
      },
      {
        "letter": "C",
        "text": "Focuses only on short-term profit."
      },
      {
        "letter": "D",
        "text": "Prevents all technological change."
      }
    ],
    "answerLetter": "A",
    "explanation": "This is the widely used Brundtland definition.",
    "id": 41
  },
  {
    "qNum": 42,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Which gas is the principal contributor to human-caused global warming by total emissions?",
    "options": [
      {
        "letter": "A",
        "text": "Carbon dioxide."
      },
      {
        "letter": "B",
        "text": "Neon."
      },
      {
        "letter": "C",
        "text": "Helium."
      },
      {
        "letter": "D",
        "text": "Argon."
      }
    ],
    "answerLetter": "A",
    "explanation": "Carbon dioxide is the largest contributor among anthropogenic greenhouse-gas emissions by total contribution.",
    "id": 42
  },
  {
    "qNum": 43,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The ozone layer is located mainly in the:",
    "options": [
      {
        "letter": "A",
        "text": "Troposphere."
      },
      {
        "letter": "B",
        "text": "Stratosphere."
      },
      {
        "letter": "C",
        "text": "Mesosphere."
      },
      {
        "letter": "D",
        "text": "Exosphere."
      }
    ],
    "answerLetter": "B",
    "explanation": "Most atmospheric ozone is concentrated in the stratosphere.",
    "id": 43
  },
  {
    "qNum": 44,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Which organisation is primarily associated with international trade rules?",
    "options": [
      {
        "letter": "A",
        "text": "World Trade Organization."
      },
      {
        "letter": "B",
        "text": "World Health Organization."
      },
      {
        "letter": "C",
        "text": "International Red Cross."
      },
      {
        "letter": "D",
        "text": "International Court of Justice."
      }
    ],
    "answerLetter": "A",
    "explanation": "The WTO administers agreements and provides a framework for international trade.",
    "id": 44
  },
  {
    "qNum": 45,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The International Court of Justice is the principal judicial organ of the:",
    "options": [
      {
        "letter": "A",
        "text": "United Nations."
      },
      {
        "letter": "B",
        "text": "European Parliament."
      },
      {
        "letter": "C",
        "text": "World Bank."
      },
      {
        "letter": "D",
        "text": "International Monetary Fund."
      }
    ],
    "answerLetter": "A",
    "explanation": "The ICJ is the UN’s principal judicial organ.",
    "id": 45
  },
  {
    "qNum": 46,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "A census is primarily conducted to:",
    "options": [
      {
        "letter": "A",
        "text": "Count and collect information about a population."
      },
      {
        "letter": "B",
        "text": "Decide the price of every product."
      },
      {
        "letter": "C",
        "text": "Measure only rainfall."
      },
      {
        "letter": "D",
        "text": "Replace all civil courts."
      }
    ],
    "answerLetter": "A",
    "explanation": "A census provides systematic population and household information.",
    "id": 46
  },
  {
    "qNum": 47,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "“Migration” means:",
    "options": [
      {
        "letter": "A",
        "text": "Movement of people from one place to another to live temporarily or permanently."
      },
      {
        "letter": "B",
        "text": "Daily changes in temperature."
      },
      {
        "letter": "C",
        "text": "Growth of a plant toward light."
      },
      {
        "letter": "D",
        "text": "Movement of tectonic plates only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Migration is the movement of people between places.",
    "id": 47
  },
  {
    "qNum": 48,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "Which map scale represents the greatest detail?",
    "options": [
      {
        "letter": "A",
        "text": "1:1,000,000."
      },
      {
        "letter": "B",
        "text": "1:500,000."
      },
      {
        "letter": "C",
        "text": "1:50,000."
      },
      {
        "letter": "D",
        "text": "1:10,000,000."
      }
    ],
    "answerLetter": "C",
    "explanation": "A larger-scale map has a smaller denominator and shows more local detail.",
    "id": 48
  },
  {
    "qNum": 49,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "The term “citizenship” generally describes:",
    "options": [
      {
        "letter": "A",
        "text": "Legal membership of a political community, with associated rights and duties."
      },
      {
        "letter": "B",
        "text": "Membership of a sports club only."
      },
      {
        "letter": "C",
        "text": "A person’s occupation."
      },
      {
        "letter": "D",
        "text": "The language spoken at home."
      }
    ],
    "answerLetter": "A",
    "explanation": "Citizenship is a legal and political status involving rights and responsibilities.",
    "id": 49
  },
  {
    "qNum": 50,
    "subject": "Reading Skills and General Knowledge",
    "chapter": "History, geography, institutions, society and citizenship",
    "topic": "",
    "passage": "",
    "question": "When evaluating a news claim, the strongest first step is to:",
    "options": [
      {
        "letter": "A",
        "text": "Share it immediately."
      },
      {
        "letter": "B",
        "text": "Check the original source, date, evidence and independent corroboration."
      },
      {
        "letter": "C",
        "text": "Trust it because it has many likes."
      },
      {
        "letter": "D",
        "text": "Ignore whether the headline matches the article."
      }
    ],
    "answerLetter": "B",
    "explanation": "Source quality, timing, evidence and corroboration help assess reliability.",
    "id": 50
  },
  {
    "qNum": 1,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "All surgeons are doctors. Some doctors are researchers. Which conclusion must be true?",
    "options": [
      {
        "letter": "A",
        "text": "All surgeons are researchers."
      },
      {
        "letter": "B",
        "text": "Some researchers are surgeons."
      },
      {
        "letter": "C",
        "text": "All surgeons are doctors."
      },
      {
        "letter": "D",
        "text": "No researchers are doctors."
      }
    ],
    "answerLetter": "C",
    "explanation": "This simply restates the universal premise; the other options do not necessarily follow.",
    "id": 51
  },
  {
    "qNum": 2,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "If every A is B and no B is C, which statement must be true?",
    "options": [
      {
        "letter": "A",
        "text": "Some A are C."
      },
      {
        "letter": "B",
        "text": "No A is C."
      },
      {
        "letter": "C",
        "text": "Every C is A."
      },
      {
        "letter": "D",
        "text": "Some B are not A."
      }
    ],
    "answerLetter": "B",
    "explanation": "Since A is wholly inside B and B is disjoint from C, A cannot overlap C.",
    "id": 52
  },
  {
    "qNum": 3,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "“If the alarm rings, the staff evacuate.” The alarm rings. What follows logically?",
    "options": [
      {
        "letter": "A",
        "text": "The staff evacuate."
      },
      {
        "letter": "B",
        "text": "The alarm did not ring."
      },
      {
        "letter": "C",
        "text": "The staff remain inside."
      },
      {
        "letter": "D",
        "text": "No conclusion is possible."
      }
    ],
    "answerLetter": "A",
    "explanation": "This is modus ponens: P implies Q; P is true; therefore Q.",
    "id": 53
  },
  {
    "qNum": 4,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "“If the sample is contaminated, the test is repeated.” The test was not repeated. Assuming the rule is always followed, what follows?",
    "options": [
      {
        "letter": "A",
        "text": "The sample was contaminated."
      },
      {
        "letter": "B",
        "text": "The sample was not contaminated."
      },
      {
        "letter": "C",
        "text": "The sample was diluted."
      },
      {
        "letter": "D",
        "text": "The test was positive."
      }
    ],
    "answerLetter": "B",
    "explanation": "By modus tollens, not Q implies not P.",
    "id": 54
  },
  {
    "qNum": 5,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "Which argument is logically valid?",
    "options": [
      {
        "letter": "A",
        "text": "All mammals breathe; whales are mammals; therefore whales breathe."
      },
      {
        "letter": "B",
        "text": "All birds fly; penguins are birds; therefore penguins fly."
      },
      {
        "letter": "C",
        "text": "Some students study; therefore all students study."
      },
      {
        "letter": "D",
        "text": "If it rains, roads are wet; roads are wet; therefore it rained."
      }
    ],
    "answerLetter": "A",
    "explanation": "The conclusion follows from the two premises. The others contain false premises or affirm the consequent / overgeneralise.",
    "id": 55
  },
  {
    "qNum": 6,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "If P is true and Q is false, what is the truth value of P AND Q?",
    "options": [
      {
        "letter": "A",
        "text": "True."
      },
      {
        "letter": "B",
        "text": "False."
      },
      {
        "letter": "C",
        "text": "Cannot be determined."
      },
      {
        "letter": "D",
        "text": "Both true and false."
      }
    ],
    "answerLetter": "B",
    "explanation": "A conjunction is true only when both components are true.",
    "id": 56
  },
  {
    "qNum": 7,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "If P is false and Q is false, what is the truth value of P OR Q (inclusive OR)?",
    "options": [
      {
        "letter": "A",
        "text": "True."
      },
      {
        "letter": "B",
        "text": "False."
      },
      {
        "letter": "C",
        "text": "Cannot be determined."
      },
      {
        "letter": "D",
        "text": "True only if P is true."
      }
    ],
    "answerLetter": "B",
    "explanation": "Inclusive OR is false only when both statements are false.",
    "id": 57
  },
  {
    "qNum": 8,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "The negation of “All applicants passed” is:",
    "options": [
      {
        "letter": "A",
        "text": "No applicant passed."
      },
      {
        "letter": "B",
        "text": "At least one applicant did not pass."
      },
      {
        "letter": "C",
        "text": "All applicants failed."
      },
      {
        "letter": "D",
        "text": "At least one applicant passed."
      }
    ],
    "answerLetter": "B",
    "explanation": "Negating “all” gives “at least one does not”.",
    "id": 58
  },
  {
    "qNum": 9,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "“A student can enter the laboratory only if wearing a coat.” Which condition is necessary for entry?",
    "options": [
      {
        "letter": "A",
        "text": "Wearing a coat."
      },
      {
        "letter": "B",
        "text": "Carrying a calculator."
      },
      {
        "letter": "C",
        "text": "Being a researcher."
      },
      {
        "letter": "D",
        "text": "Wearing gloves only."
      }
    ],
    "answerLetter": "A",
    "explanation": "“Only if” identifies a necessary condition.",
    "id": 59
  },
  {
    "qNum": 10,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Deduction, arguments and conditions",
    "topic": "",
    "passage": "",
    "question": "If the statement “Some A are B” is true, which statement must also be true?",
    "options": [
      {
        "letter": "A",
        "text": "Some B are A."
      },
      {
        "letter": "B",
        "text": "All A are B."
      },
      {
        "letter": "C",
        "text": "No A are B."
      },
      {
        "letter": "D",
        "text": "All B are A."
      }
    ],
    "answerLetter": "A",
    "explanation": "The overlap relation is symmetric.",
    "id": 60
  },
  {
    "qNum": 11,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Find the next number: 2, 6, 12, 20, 30, __.",
    "options": [
      {
        "letter": "A",
        "text": "36."
      },
      {
        "letter": "B",
        "text": "40."
      },
      {
        "letter": "C",
        "text": "42."
      },
      {
        "letter": "D",
        "text": "44."
      }
    ],
    "answerLetter": "C",
    "explanation": "The differences are 4, 6, 8, 10; the next difference is 12, giving 42.",
    "id": 61
  },
  {
    "qNum": 12,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Find the next number: 3, 9, 27, 81, __.",
    "options": [
      {
        "letter": "A",
        "text": "162."
      },
      {
        "letter": "B",
        "text": "189."
      },
      {
        "letter": "C",
        "text": "243."
      },
      {
        "letter": "D",
        "text": "324."
      }
    ],
    "answerLetter": "C",
    "explanation": "Each term is multiplied by 3.",
    "id": 62
  },
  {
    "qNum": 13,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Find the missing number: 1, 4, 9, 16, __, 36.",
    "options": [
      {
        "letter": "A",
        "text": "20."
      },
      {
        "letter": "B",
        "text": "24."
      },
      {
        "letter": "C",
        "text": "25."
      },
      {
        "letter": "D",
        "text": "30."
      }
    ],
    "answerLetter": "C",
    "explanation": "These are squares: 1², 2², 3², 4², 5², 6².",
    "id": 63
  },
  {
    "qNum": 14,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Find the next letter: A, C, F, J, O, __.",
    "options": [
      {
        "letter": "A",
        "text": "S."
      },
      {
        "letter": "B",
        "text": "T."
      },
      {
        "letter": "C",
        "text": "U."
      },
      {
        "letter": "D",
        "text": "V."
      }
    ],
    "answerLetter": "C",
    "explanation": "Alphabetical jumps are +2, +3, +4, +5, then +6: O to U.",
    "id": 64
  },
  {
    "qNum": 15,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Which item does not belong?",
    "options": [
      {
        "letter": "A",
        "text": "Triangle."
      },
      {
        "letter": "B",
        "text": "Square."
      },
      {
        "letter": "C",
        "text": "Pentagon."
      },
      {
        "letter": "D",
        "text": "Sphere."
      }
    ],
    "answerLetter": "D",
    "explanation": "A sphere is three-dimensional; the others are two-dimensional polygons.",
    "id": 65
  },
  {
    "qNum": 16,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Which number does not fit the group 4, 9, 16, 25, 30, 36?",
    "options": [
      {
        "letter": "A",
        "text": "9."
      },
      {
        "letter": "B",
        "text": "16."
      },
      {
        "letter": "C",
        "text": "30."
      },
      {
        "letter": "D",
        "text": "36."
      }
    ],
    "answerLetter": "C",
    "explanation": "All others are perfect squares; 30 is not.",
    "id": 66
  },
  {
    "qNum": 17,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Complete the analogy: Cell is to tissue as brick is to:",
    "options": [
      {
        "letter": "A",
        "text": "Wall."
      },
      {
        "letter": "B",
        "text": "Cement."
      },
      {
        "letter": "C",
        "text": "Sand."
      },
      {
        "letter": "D",
        "text": "Roof tile."
      }
    ],
    "answerLetter": "A",
    "explanation": "Cells build tissues; bricks can build a wall.",
    "id": 67
  },
  {
    "qNum": 18,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "Complete the analogy: Thermometer is to temperature as barometer is to:",
    "options": [
      {
        "letter": "A",
        "text": "Speed."
      },
      {
        "letter": "B",
        "text": "Pressure."
      },
      {
        "letter": "C",
        "text": "Humidity."
      },
      {
        "letter": "D",
        "text": "Mass."
      }
    ],
    "answerLetter": "B",
    "explanation": "A barometer measures atmospheric pressure.",
    "id": 68
  },
  {
    "qNum": 19,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "If CAT is coded as DBU (each letter moves one place forward), DOG is coded as:",
    "options": [
      {
        "letter": "A",
        "text": "EPH."
      },
      {
        "letter": "B",
        "text": "CNG."
      },
      {
        "letter": "C",
        "text": "FQI."
      },
      {
        "letter": "D",
        "text": "EOG."
      }
    ],
    "answerLetter": "A",
    "explanation": "D→E, O→P and G→H.",
    "id": 69
  },
  {
    "qNum": 20,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Sequences, patterns and classification",
    "topic": "",
    "passage": "",
    "question": "In a code, MED is written as NFE. Using the same rule, BIO is:",
    "options": [
      {
        "letter": "A",
        "text": "CJP."
      },
      {
        "letter": "B",
        "text": "AHN."
      },
      {
        "letter": "C",
        "text": "DKR."
      },
      {
        "letter": "D",
        "text": "BIP."
      }
    ],
    "answerLetter": "A",
    "explanation": "Each letter advances by one position: B→C, I→J, O→P.",
    "id": 70
  },
  {
    "qNum": 21,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A clinic sees 24 patients in 3 hours at a constant rate. How many patients does it see in 5 hours?",
    "options": [
      {
        "letter": "A",
        "text": "30."
      },
      {
        "letter": "B",
        "text": "36."
      },
      {
        "letter": "C",
        "text": "40."
      },
      {
        "letter": "D",
        "text": "45."
      }
    ],
    "answerLetter": "C",
    "explanation": "Rate = 24/3 = 8 patients per hour; 8×5 = 40.",
    "id": 71
  },
  {
    "qNum": 22,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A solution contains 2 parts solute and 8 parts solvent. What fraction of the total mixture is solute?",
    "options": [
      {
        "letter": "A",
        "text": "1/5."
      },
      {
        "letter": "B",
        "text": "1/4."
      },
      {
        "letter": "C",
        "text": "1/2."
      },
      {
        "letter": "D",
        "text": "4/5."
      }
    ],
    "answerLetter": "A",
    "explanation": "Total parts = 10; solute fraction = 2/10 = 1/5.",
    "id": 72
  },
  {
    "qNum": 23,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A test has 40 questions. A candidate answers 32 correctly. What percentage is correct?",
    "options": [
      {
        "letter": "A",
        "text": "70%."
      },
      {
        "letter": "B",
        "text": "75%."
      },
      {
        "letter": "C",
        "text": "80%."
      },
      {
        "letter": "D",
        "text": "85%."
      }
    ],
    "answerLetter": "C",
    "explanation": "(32/40)×100 = 80%.",
    "id": 73
  },
  {
    "qNum": 24,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "The average of 4, 8, 10 and x is 9. Find x.",
    "options": [
      {
        "letter": "A",
        "text": "12."
      },
      {
        "letter": "B",
        "text": "13."
      },
      {
        "letter": "C",
        "text": "14."
      },
      {
        "letter": "D",
        "text": "16."
      }
    ],
    "answerLetter": "C",
    "explanation": "Total must be 4×9 = 36; x = 36−22 = 14.",
    "id": 74
  },
  {
    "qNum": 25,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A value rises from 80 to 100. What is the percentage increase?",
    "options": [
      {
        "letter": "A",
        "text": "20%."
      },
      {
        "letter": "B",
        "text": "25%."
      },
      {
        "letter": "C",
        "text": "30%."
      },
      {
        "letter": "D",
        "text": "40%."
      }
    ],
    "answerLetter": "B",
    "explanation": "Increase = 20; percentage increase = 20/80×100 = 25%.",
    "id": 75
  },
  {
    "qNum": 26,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "Five machines make 100 items in 4 hours. At the same rate, how many items do 10 machines make in 4 hours?",
    "options": [
      {
        "letter": "A",
        "text": "100."
      },
      {
        "letter": "B",
        "text": "150."
      },
      {
        "letter": "C",
        "text": "200."
      },
      {
        "letter": "D",
        "text": "400."
      }
    ],
    "answerLetter": "C",
    "explanation": "Doubling the machines doubles output for the same time.",
    "id": 76
  },
  {
    "qNum": 27,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A train travels 150 km in 2.5 hours. Its average speed is:",
    "options": [
      {
        "letter": "A",
        "text": "50 km/h."
      },
      {
        "letter": "B",
        "text": "55 km/h."
      },
      {
        "letter": "C",
        "text": "60 km/h."
      },
      {
        "letter": "D",
        "text": "75 km/h."
      }
    ],
    "answerLetter": "C",
    "explanation": "Speed = distance/time = 150/2.5 = 60 km/h.",
    "id": 77
  },
  {
    "qNum": 28,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "If 3x − 5 = 16, x equals:",
    "options": [
      {
        "letter": "A",
        "text": "5."
      },
      {
        "letter": "B",
        "text": "6."
      },
      {
        "letter": "C",
        "text": "7."
      },
      {
        "letter": "D",
        "text": "8."
      }
    ],
    "answerLetter": "C",
    "explanation": "3x = 21, so x = 7.",
    "id": 78
  },
  {
    "qNum": 29,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A bag contains 3 red and 2 blue balls. The probability of drawing a blue ball at random is:",
    "options": [
      {
        "letter": "A",
        "text": "1/5."
      },
      {
        "letter": "B",
        "text": "2/5."
      },
      {
        "letter": "C",
        "text": "3/5."
      },
      {
        "letter": "D",
        "text": "1/2."
      }
    ],
    "answerLetter": "B",
    "explanation": "Two of the five equally likely balls are blue.",
    "id": 79
  },
  {
    "qNum": 30,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "Two fair coins are tossed. What is the probability of obtaining exactly one head?",
    "options": [
      {
        "letter": "A",
        "text": "1/4."
      },
      {
        "letter": "B",
        "text": "1/2."
      },
      {
        "letter": "C",
        "text": "3/4."
      },
      {
        "letter": "D",
        "text": "1."
      }
    ],
    "answerLetter": "B",
    "explanation": "Outcomes are HH, HT, TH, TT; two of four have exactly one head.",
    "id": 80
  },
  {
    "qNum": 31,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "If A is taller than B and B is taller than C, who is shortest?",
    "options": [
      {
        "letter": "A",
        "text": "A."
      },
      {
        "letter": "B",
        "text": "B."
      },
      {
        "letter": "C",
        "text": "C."
      },
      {
        "letter": "D",
        "text": "Cannot be determined."
      }
    ],
    "answerLetter": "C",
    "explanation": "The ordering is A > B > C.",
    "id": 81
  },
  {
    "qNum": 32,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "Ana is older than Bo. Bo is older than Chi. Dan is younger than Chi. Who is oldest?",
    "options": [
      {
        "letter": "A",
        "text": "Ana."
      },
      {
        "letter": "B",
        "text": "Bo."
      },
      {
        "letter": "C",
        "text": "Chi."
      },
      {
        "letter": "D",
        "text": "Dan."
      }
    ],
    "answerLetter": "A",
    "explanation": "Ana > Bo > Chi > Dan.",
    "id": 82
  },
  {
    "qNum": 33,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "A is immediately to the left of B. C is immediately to the right of B. Which order is correct?",
    "options": [
      {
        "letter": "A",
        "text": "B-A-C."
      },
      {
        "letter": "B",
        "text": "A-B-C."
      },
      {
        "letter": "C",
        "text": "C-B-A."
      },
      {
        "letter": "D",
        "text": "A-C-B."
      }
    ],
    "answerLetter": "B",
    "explanation": "The stated immediate relationships give A-B-C.",
    "id": 83
  },
  {
    "qNum": 34,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "In a queue, Mira is 7th from the front and 9th from the back. How many people are in the queue?",
    "options": [
      {
        "letter": "A",
        "text": "14."
      },
      {
        "letter": "B",
        "text": "15."
      },
      {
        "letter": "C",
        "text": "16."
      },
      {
        "letter": "D",
        "text": "17."
      }
    ],
    "answerLetter": "B",
    "explanation": "Total = 7 + 9 − 1 = 15; Mira is counted twice otherwise.",
    "id": 84
  },
  {
    "qNum": 35,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Quantitative and relational reasoning",
    "topic": "",
    "passage": "",
    "question": "If today is Wednesday, what day will it be 17 days later?",
    "options": [
      {
        "letter": "A",
        "text": "Friday."
      },
      {
        "letter": "B",
        "text": "Saturday."
      },
      {
        "letter": "C",
        "text": "Sunday."
      },
      {
        "letter": "D",
        "text": "Monday."
      }
    ],
    "answerLetter": "B",
    "explanation": "17 mod 7 = 3; three days after Wednesday is Saturday.",
    "id": 85
  },
  {
    "qNum": 36,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A study reports that 60 of 100 participants improved. What is the observed improvement proportion?",
    "options": [
      {
        "letter": "A",
        "text": "0.06."
      },
      {
        "letter": "B",
        "text": "0.4."
      },
      {
        "letter": "C",
        "text": "0.6."
      },
      {
        "letter": "D",
        "text": "6."
      }
    ],
    "answerLetter": "C",
    "explanation": "60/100 = 0.6.",
    "id": 86
  },
  {
    "qNum": 37,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A graph shows values 10, 12, 12, 16 and 20. What is the median?",
    "options": [
      {
        "letter": "A",
        "text": "12."
      },
      {
        "letter": "B",
        "text": "14."
      },
      {
        "letter": "C",
        "text": "16."
      },
      {
        "letter": "D",
        "text": "20."
      }
    ],
    "answerLetter": "A",
    "explanation": "The middle value in the ordered five observations is 12.",
    "id": 87
  },
  {
    "qNum": 38,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "The mean of 2, 3, 5 and 10 is:",
    "options": [
      {
        "letter": "A",
        "text": "4."
      },
      {
        "letter": "B",
        "text": "5."
      },
      {
        "letter": "C",
        "text": "6."
      },
      {
        "letter": "D",
        "text": "7."
      }
    ],
    "answerLetter": "B",
    "explanation": "Sum = 20; mean = 20/4 = 5.",
    "id": 88
  },
  {
    "qNum": 39,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A medicine dose is 5 mg per kg. What dose is required for a 60 kg patient under this stated rule?",
    "options": [
      {
        "letter": "A",
        "text": "12 mg."
      },
      {
        "letter": "B",
        "text": "60 mg."
      },
      {
        "letter": "C",
        "text": "300 mg."
      },
      {
        "letter": "D",
        "text": "600 mg."
      }
    ],
    "answerLetter": "C",
    "explanation": "5×60 = 300 mg. This is an arithmetic exercise, not clinical dosing advice.",
    "id": 89
  },
  {
    "qNum": 40,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A map uses a scale of 1 cm : 5 km. A road measures 7 cm on the map. Its represented length is:",
    "options": [
      {
        "letter": "A",
        "text": "12 km."
      },
      {
        "letter": "B",
        "text": "25 km."
      },
      {
        "letter": "C",
        "text": "35 km."
      },
      {
        "letter": "D",
        "text": "70 km."
      }
    ],
    "answerLetter": "C",
    "explanation": "7×5 = 35 km.",
    "id": 90
  },
  {
    "qNum": 41,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A box has 4 white, 3 black and 3 green counters. What is the probability of not choosing black?",
    "options": [
      {
        "letter": "A",
        "text": "3/10."
      },
      {
        "letter": "B",
        "text": "4/10."
      },
      {
        "letter": "C",
        "text": "7/10."
      },
      {
        "letter": "D",
        "text": "9/10."
      }
    ],
    "answerLetter": "C",
    "explanation": "Seven of the ten counters are not black.",
    "id": 91
  },
  {
    "qNum": 42,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "If a number is divisible by both 2 and 3, it must be divisible by:",
    "options": [
      {
        "letter": "A",
        "text": "5."
      },
      {
        "letter": "B",
        "text": "6."
      },
      {
        "letter": "C",
        "text": "8."
      },
      {
        "letter": "D",
        "text": "9."
      }
    ],
    "answerLetter": "B",
    "explanation": "A number divisible by 2 and 3 is divisible by their least common multiple, 6.",
    "id": 92
  },
  {
    "qNum": 43,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "Which is the best evidence that a new teaching method caused improved scores?",
    "options": [
      {
        "letter": "A",
        "text": "One student says it helped."
      },
      {
        "letter": "B",
        "text": "Scores rose after the method was introduced, with no comparison group."
      },
      {
        "letter": "C",
        "text": "A well-designed controlled study finds higher scores in the intervention group."
      },
      {
        "letter": "D",
        "text": "The method is popular online."
      }
    ],
    "answerLetter": "C",
    "explanation": "A controlled design helps separate the method’s effect from other explanations.",
    "id": 93
  },
  {
    "qNum": 44,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A conclusion is “strongly supported” when:",
    "options": [
      {
        "letter": "A",
        "text": "It is consistent with the available reliable evidence."
      },
      {
        "letter": "B",
        "text": "It is stated confidently."
      },
      {
        "letter": "C",
        "text": "It is repeated frequently."
      },
      {
        "letter": "D",
        "text": "It agrees with personal preference."
      }
    ],
    "answerLetter": "A",
    "explanation": "Evidential support, not confidence or popularity, determines strength.",
    "id": 94
  },
  {
    "qNum": 45,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "Which statement is an opinion rather than a directly verifiable fact?",
    "options": [
      {
        "letter": "A",
        "text": "Water freezes at approximately 0°C at standard pressure."
      },
      {
        "letter": "B",
        "text": "Rome is the capital of Italy."
      },
      {
        "letter": "C",
        "text": "Biology is the most interesting subject."
      },
      {
        "letter": "D",
        "text": "A triangle has three sides."
      }
    ],
    "answerLetter": "C",
    "explanation": "“Most interesting” expresses a subjective judgement.",
    "id": 95
  },
  {
    "qNum": 46,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A report gives a correlation between screen time and sleep duration. What can be concluded from correlation alone?",
    "options": [
      {
        "letter": "A",
        "text": "Screen time definitely causes shorter sleep."
      },
      {
        "letter": "B",
        "text": "Shorter sleep definitely causes more screen time."
      },
      {
        "letter": "C",
        "text": "The variables are associated, but causation is not established."
      },
      {
        "letter": "D",
        "text": "The two variables cannot be related."
      }
    ],
    "answerLetter": "C",
    "explanation": "Correlation alone does not determine causal direction or rule out confounders.",
    "id": 96
  },
  {
    "qNum": 47,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "A survey includes only volunteers from a fitness club. The main concern is:",
    "options": [
      {
        "letter": "A",
        "text": "Selection bias."
      },
      {
        "letter": "B",
        "text": "Random assignment."
      },
      {
        "letter": "C",
        "text": "Perfect representativeness."
      },
      {
        "letter": "D",
        "text": "Measurement in SI units."
      }
    ],
    "answerLetter": "A",
    "explanation": "Fitness-club volunteers may differ systematically from the population of interest.",
    "id": 97
  },
  {
    "qNum": 48,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "If an argument attacks the speaker instead of addressing the evidence, it commits:",
    "options": [
      {
        "letter": "A",
        "text": "Ad hominem."
      },
      {
        "letter": "B",
        "text": "Modus ponens."
      },
      {
        "letter": "C",
        "text": "Valid deduction."
      },
      {
        "letter": "D",
        "text": "Statistical sampling."
      }
    ],
    "answerLetter": "A",
    "explanation": "An ad hominem argument targets the person rather than the claim.",
    "id": 98
  },
  {
    "qNum": 49,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "“This treatment worked for one person, so it works for everyone” is an example of:",
    "options": [
      {
        "letter": "A",
        "text": "Hasty generalisation."
      },
      {
        "letter": "B",
        "text": "A mathematical proof."
      },
      {
        "letter": "C",
        "text": "A valid universal law."
      },
      {
        "letter": "D",
        "text": "A controlled experiment."
      }
    ],
    "answerLetter": "A",
    "explanation": "The conclusion is too broad for the limited evidence.",
    "id": 99
  },
  {
    "qNum": 50,
    "subject": "Logical Reasoning and Problems",
    "chapter": "Problem solving and data interpretation",
    "topic": "",
    "passage": "",
    "question": "Four tasks must be completed: sterilise equipment before using it; prepare samples before analysis; analyse samples before reporting. Which sequence respects all dependencies?",
    "options": [
      {
        "letter": "A",
        "text": "Report, analyse, prepare, sterilise."
      },
      {
        "letter": "B",
        "text": "Sterilise, prepare, analyse, report."
      },
      {
        "letter": "C",
        "text": "Prepare, report, sterilise, analyse."
      },
      {
        "letter": "D",
        "text": "Analyse, sterilise, report, prepare."
      }
    ],
    "answerLetter": "B",
    "explanation": "Each prerequisite is completed before the dependent task.",
    "id": 100
  },
  {
    "qNum": 1,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "Which element forms the backbone of most biological organic molecules?",
    "options": [
      {
        "letter": "A",
        "text": "Carbon."
      },
      {
        "letter": "B",
        "text": "Sodium."
      },
      {
        "letter": "C",
        "text": "Calcium."
      },
      {
        "letter": "D",
        "text": "Iron."
      }
    ],
    "answerLetter": "A",
    "explanation": "Carbon forms stable covalent bonds and chains, making it central to organic molecules.",
    "id": 101
  },
  {
    "qNum": 2,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "A peptide bond links:",
    "options": [
      {
        "letter": "A",
        "text": "Two monosaccharides."
      },
      {
        "letter": "B",
        "text": "Two amino acids."
      },
      {
        "letter": "C",
        "text": "Two fatty acids."
      },
      {
        "letter": "D",
        "text": "Two nucleotides."
      }
    ],
    "answerLetter": "B",
    "explanation": "Peptide bonds join amino acids in polypeptides.",
    "id": 102
  },
  {
    "qNum": 3,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "The main storage polysaccharide in animals is:",
    "options": [
      {
        "letter": "A",
        "text": "Cellulose."
      },
      {
        "letter": "B",
        "text": "Starch."
      },
      {
        "letter": "C",
        "text": "Glycogen."
      },
      {
        "letter": "D",
        "text": "Chitin."
      }
    ],
    "answerLetter": "C",
    "explanation": "Animals store glucose mainly as glycogen, especially in liver and muscle.",
    "id": 103
  },
  {
    "qNum": 4,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "Cellulose is composed of repeating units of:",
    "options": [
      {
        "letter": "A",
        "text": "β-glucose."
      },
      {
        "letter": "B",
        "text": "Amino acids."
      },
      {
        "letter": "C",
        "text": "Nucleotides."
      },
      {
        "letter": "D",
        "text": "Glycerol."
      }
    ],
    "answerLetter": "A",
    "explanation": "Cellulose is a structural polysaccharide of β-glucose units.",
    "id": 104
  },
  {
    "qNum": 5,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "Which type of lipid is a major component of cell membranes?",
    "options": [
      {
        "letter": "A",
        "text": "Triglyceride."
      },
      {
        "letter": "B",
        "text": "Phospholipid."
      },
      {
        "letter": "C",
        "text": "Wax only."
      },
      {
        "letter": "D",
        "text": "Steroid hormone only."
      }
    ],
    "answerLetter": "B",
    "explanation": "Phospholipids form bilayers with hydrophilic heads and hydrophobic tails.",
    "id": 105
  },
  {
    "qNum": 6,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "Enzymes increase reaction rates primarily by:",
    "options": [
      {
        "letter": "A",
        "text": "Raising the activation energy."
      },
      {
        "letter": "B",
        "text": "Lowering the activation energy."
      },
      {
        "letter": "C",
        "text": "Changing the reaction’s equilibrium constant."
      },
      {
        "letter": "D",
        "text": "Being consumed as reactants."
      }
    ],
    "answerLetter": "B",
    "explanation": "Enzymes stabilise the transition state and lower activation energy.",
    "id": 106
  },
  {
    "qNum": 7,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "A competitive inhibitor usually acts by:",
    "options": [
      {
        "letter": "A",
        "text": "Binding at the active site and competing with substrate."
      },
      {
        "letter": "B",
        "text": "Destroying all enzyme molecules."
      },
      {
        "letter": "C",
        "text": "Increasing substrate concentration permanently."
      },
      {
        "letter": "D",
        "text": "Turning product back into enzyme."
      }
    ],
    "answerLetter": "A",
    "explanation": "Competitive inhibitors compete with substrate for the enzyme’s active site.",
    "id": 107
  },
  {
    "qNum": 8,
    "subject": "Biology",
    "chapter": "Chemistry of life, biomolecules and enzymes",
    "topic": "",
    "passage": "",
    "question": "Which interaction is individually weak but important in stabilising DNA and protein structure?",
    "options": [
      {
        "letter": "A",
        "text": "Hydrogen bonding."
      },
      {
        "letter": "B",
        "text": "Nuclear fission."
      },
      {
        "letter": "C",
        "text": "Metallic bonding."
      },
      {
        "letter": "D",
        "text": "Ionic crystal formation only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Hydrogen bonds contribute to base pairing and protein structure, among other weak interactions.",
    "id": 108
  },
  {
    "qNum": 9,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "Which structure is present in prokaryotic cells but absent as a membrane-bound organelle?",
    "options": [
      {
        "letter": "A",
        "text": "Ribosome."
      },
      {
        "letter": "B",
        "text": "Nucleoid region."
      },
      {
        "letter": "C",
        "text": "Plasma membrane."
      },
      {
        "letter": "D",
        "text": "Cytoplasm."
      }
    ],
    "answerLetter": "B",
    "explanation": "Prokaryotes have DNA concentrated in a nucleoid, not in a membrane-bound nucleus.",
    "id": 109
  },
  {
    "qNum": 10,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "Which organelle is the main site of aerobic ATP production in eukaryotic cells?",
    "options": [
      {
        "letter": "A",
        "text": "Golgi apparatus."
      },
      {
        "letter": "B",
        "text": "Mitochondrion."
      },
      {
        "letter": "C",
        "text": "Lysosome."
      },
      {
        "letter": "D",
        "text": "Nucleolus."
      }
    ],
    "answerLetter": "B",
    "explanation": "Mitochondria host the citric acid cycle and oxidative phosphorylation.",
    "id": 110
  },
  {
    "qNum": 11,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "Ribosomes are responsible for:",
    "options": [
      {
        "letter": "A",
        "text": "Protein synthesis."
      },
      {
        "letter": "B",
        "text": "Lipid storage."
      },
      {
        "letter": "C",
        "text": "DNA packaging only."
      },
      {
        "letter": "D",
        "text": "Photosynthesis."
      }
    ],
    "answerLetter": "A",
    "explanation": "Ribosomes translate messenger RNA into polypeptides.",
    "id": 111
  },
  {
    "qNum": 12,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "The Golgi apparatus mainly:",
    "options": [
      {
        "letter": "A",
        "text": "Modifies, sorts and packages proteins and lipids."
      },
      {
        "letter": "B",
        "text": "Replicates chromosomal DNA."
      },
      {
        "letter": "C",
        "text": "Produces ATP by glycolysis."
      },
      {
        "letter": "D",
        "text": "Stores hereditary information in genes."
      }
    ],
    "answerLetter": "A",
    "explanation": "The Golgi processes and sorts products for delivery.",
    "id": 112
  },
  {
    "qNum": 13,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "The fluid mosaic model describes the plasma membrane as:",
    "options": [
      {
        "letter": "A",
        "text": "A rigid cellulose sheet."
      },
      {
        "letter": "B",
        "text": "A phospholipid bilayer with embedded/mobile proteins."
      },
      {
        "letter": "C",
        "text": "A layer made entirely of proteins."
      },
      {
        "letter": "D",
        "text": "A double layer of DNA."
      }
    ],
    "answerLetter": "B",
    "explanation": "Membrane lipids and many proteins can move laterally within the bilayer.",
    "id": 113
  },
  {
    "qNum": 14,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "Osmosis is the net movement of:",
    "options": [
      {
        "letter": "A",
        "text": "Solute from high to low concentration through any barrier."
      },
      {
        "letter": "B",
        "text": "Water across a selectively permeable membrane toward higher effective solute concentration."
      },
      {
        "letter": "C",
        "text": "Proteins through a membrane using ATP."
      },
      {
        "letter": "D",
        "text": "Ions against their electrochemical gradients."
      }
    ],
    "answerLetter": "B",
    "explanation": "Osmosis is water movement across a selectively permeable membrane.",
    "id": 114
  },
  {
    "qNum": 15,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "Which process requires cellular energy to move a substance against its gradient?",
    "options": [
      {
        "letter": "A",
        "text": "Simple diffusion."
      },
      {
        "letter": "B",
        "text": "Osmosis."
      },
      {
        "letter": "C",
        "text": "Active transport."
      },
      {
        "letter": "D",
        "text": "Passive filtration."
      }
    ],
    "answerLetter": "C",
    "explanation": "Active transport uses energy, directly or indirectly, to move substances against gradients.",
    "id": 115
  },
  {
    "qNum": 16,
    "subject": "Biology",
    "chapter": "Cells, membranes, organelles and viruses",
    "topic": "",
    "passage": "",
    "question": "A virus is best described as:",
    "options": [
      {
        "letter": "A",
        "text": "A complete prokaryotic cell."
      },
      {
        "letter": "B",
        "text": "An acellular infectious agent that replicates using host-cell machinery."
      },
      {
        "letter": "C",
        "text": "A eukaryotic cell without a nucleus."
      },
      {
        "letter": "D",
        "text": "A free-living organism with its own ribosomes."
      }
    ],
    "answerLetter": "B",
    "explanation": "Viruses lack cellular structure and depend on host cells for replication.",
    "id": 116
  },
  {
    "qNum": 17,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "DNA replication occurs during which stage of the cell cycle?",
    "options": [
      {
        "letter": "A",
        "text": "G1 phase."
      },
      {
        "letter": "B",
        "text": "S phase."
      },
      {
        "letter": "C",
        "text": "G2 phase."
      },
      {
        "letter": "D",
        "text": "M phase only."
      }
    ],
    "answerLetter": "B",
    "explanation": "DNA is synthesised during the S (synthesis) phase of interphase.",
    "id": 117
  },
  {
    "qNum": 18,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "Mitosis normally produces:",
    "options": [
      {
        "letter": "A",
        "text": "Four genetically different haploid cells."
      },
      {
        "letter": "B",
        "text": "Two genetically similar daughter cells with the same chromosome number as the parent."
      },
      {
        "letter": "C",
        "text": "Two haploid gametes."
      },
      {
        "letter": "D",
        "text": "One cell with twice the chromosome number."
      }
    ],
    "answerLetter": "B",
    "explanation": "Mitosis preserves chromosome number and usually produces two similar daughter cells.",
    "id": 118
  },
  {
    "qNum": 19,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "Crossing over normally occurs during:",
    "options": [
      {
        "letter": "A",
        "text": "Prophase I of meiosis."
      },
      {
        "letter": "B",
        "text": "Metaphase of mitosis."
      },
      {
        "letter": "C",
        "text": "Telophase II."
      },
      {
        "letter": "D",
        "text": "Cytokinesis only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Homologous chromosomes pair and exchange segments during prophase I.",
    "id": 119
  },
  {
    "qNum": 20,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "Meiosis reduces the chromosome number because:",
    "options": [
      {
        "letter": "A",
        "text": "DNA is never replicated."
      },
      {
        "letter": "B",
        "text": "Two divisions follow one round of DNA replication."
      },
      {
        "letter": "C",
        "text": "Chromosomes are destroyed."
      },
      {
        "letter": "D",
        "text": "Each daughter cell receives all homologues."
      }
    ],
    "answerLetter": "B",
    "explanation": "Meiosis I separates homologous chromosomes and meiosis II separates sister chromatids.",
    "id": 120
  },
  {
    "qNum": 21,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "In humans, a typical somatic cell contains:",
    "options": [
      {
        "letter": "A",
        "text": "23 chromosomes."
      },
      {
        "letter": "B",
        "text": "44 chromosomes."
      },
      {
        "letter": "C",
        "text": "46 chromosomes."
      },
      {
        "letter": "D",
        "text": "92 chromosomes."
      }
    ],
    "answerLetter": "C",
    "explanation": "Human somatic cells are diploid with 46 chromosomes (23 pairs).",
    "id": 121
  },
  {
    "qNum": 22,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "A human gamete normally contains:",
    "options": [
      {
        "letter": "A",
        "text": "46 chromosomes."
      },
      {
        "letter": "B",
        "text": "23 chromosomes."
      },
      {
        "letter": "C",
        "text": "92 chromosomes."
      },
      {
        "letter": "D",
        "text": "1 chromosome."
      }
    ],
    "answerLetter": "B",
    "explanation": "Gametes are haploid and contain 23 chromosomes.",
    "id": 122
  },
  {
    "qNum": 23,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "If an individual with genotype Aa forms gametes, the expected gamete types are:",
    "options": [
      {
        "letter": "A",
        "text": "AA only."
      },
      {
        "letter": "B",
        "text": "Aa only."
      },
      {
        "letter": "C",
        "text": "A and a in equal proportions, assuming normal segregation."
      },
      {
        "letter": "D",
        "text": "A, a and aa."
      }
    ],
    "answerLetter": "C",
    "explanation": "The two alleles segregate during meiosis.",
    "id": 123
  },
  {
    "qNum": 24,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "In a cross Aa × Aa with complete dominance, the expected phenotypic ratio is:",
    "options": [
      {
        "letter": "A",
        "text": "1:1."
      },
      {
        "letter": "B",
        "text": "3:1."
      },
      {
        "letter": "C",
        "text": "1:2:1."
      },
      {
        "letter": "D",
        "text": "9:3:3:1."
      }
    ],
    "answerLetter": "B",
    "explanation": "Genotypes are 1 AA : 2 Aa : 1 aa, giving 3 dominant : 1 recessive phenotype.",
    "id": 124
  },
  {
    "qNum": 25,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "A recessive allele is expressed in a simple complete-dominance model when the genotype is:",
    "options": [
      {
        "letter": "A",
        "text": "Homozygous recessive."
      },
      {
        "letter": "B",
        "text": "Heterozygous only."
      },
      {
        "letter": "C",
        "text": "Homozygous dominant only."
      },
      {
        "letter": "D",
        "text": "Any genotype containing a dominant allele."
      }
    ],
    "answerLetter": "A",
    "explanation": "A recessive phenotype appears when both alleles are recessive.",
    "id": 125
  },
  {
    "qNum": 26,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "A person with blood group AB has which ABO antigen pattern on red blood cells?",
    "options": [
      {
        "letter": "A",
        "text": "A antigen only."
      },
      {
        "letter": "B",
        "text": "B antigen only."
      },
      {
        "letter": "C",
        "text": "Both A and B antigens."
      },
      {
        "letter": "D",
        "text": "Neither A nor B antigen."
      }
    ],
    "answerLetter": "C",
    "explanation": "AB red cells display both A and B antigens.",
    "id": 126
  },
  {
    "qNum": 27,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "An X-linked recessive condition is more commonly expressed in XY individuals because they:",
    "options": [
      {
        "letter": "A",
        "text": "Have two X chromosomes."
      },
      {
        "letter": "B",
        "text": "Have only one X chromosome."
      },
      {
        "letter": "C",
        "text": "Lack all sex chromosomes."
      },
      {
        "letter": "D",
        "text": "Cannot inherit X-linked alleles."
      }
    ],
    "answerLetter": "B",
    "explanation": "A single recessive allele on the only X chromosome can be expressed in an XY individual.",
    "id": 127
  },
  {
    "qNum": 28,
    "subject": "Biology",
    "chapter": "Cell cycle, mitosis, meiosis and inheritance",
    "topic": "",
    "passage": "",
    "question": "A karyotype is used primarily to examine:",
    "options": [
      {
        "letter": "A",
        "text": "Protein sequence."
      },
      {
        "letter": "B",
        "text": "Chromosome number and large-scale chromosome structure."
      },
      {
        "letter": "C",
        "text": "Enzyme activity."
      },
      {
        "letter": "D",
        "text": "Cell membrane fluidity."
      }
    ],
    "answerLetter": "B",
    "explanation": "A karyotype displays chromosomes arranged by size and shape.",
    "id": 128
  },
  {
    "qNum": 29,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "DNA nucleotides contain which sugar?",
    "options": [
      {
        "letter": "A",
        "text": "Ribose."
      },
      {
        "letter": "B",
        "text": "Deoxyribose."
      },
      {
        "letter": "C",
        "text": "Glucose."
      },
      {
        "letter": "D",
        "text": "Fructose."
      }
    ],
    "answerLetter": "B",
    "explanation": "DNA contains deoxyribose; RNA contains ribose.",
    "id": 129
  },
  {
    "qNum": 30,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "In DNA, adenine pairs with:",
    "options": [
      {
        "letter": "A",
        "text": "Cytosine."
      },
      {
        "letter": "B",
        "text": "Guanine."
      },
      {
        "letter": "C",
        "text": "Thymine."
      },
      {
        "letter": "D",
        "text": "Uracil."
      }
    ],
    "answerLetter": "C",
    "explanation": "A pairs with T through two hydrogen bonds.",
    "id": 130
  },
  {
    "qNum": 31,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "The enzyme that synthesises a new DNA strand during replication is:",
    "options": [
      {
        "letter": "A",
        "text": "DNA polymerase."
      },
      {
        "letter": "B",
        "text": "RNA polymerase."
      },
      {
        "letter": "C",
        "text": "Lipase."
      },
      {
        "letter": "D",
        "text": "Amylase."
      }
    ],
    "answerLetter": "A",
    "explanation": "DNA polymerase adds complementary DNA nucleotides to a growing strand.",
    "id": 131
  },
  {
    "qNum": 32,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "Transcription is the process of:",
    "options": [
      {
        "letter": "A",
        "text": "Making RNA from a DNA template."
      },
      {
        "letter": "B",
        "text": "Making DNA from protein."
      },
      {
        "letter": "C",
        "text": "Making a lipid from glucose."
      },
      {
        "letter": "D",
        "text": "Splitting a chromosome into gametes."
      }
    ],
    "answerLetter": "A",
    "explanation": "RNA polymerase transcribes DNA information into RNA.",
    "id": 132
  },
  {
    "qNum": 33,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "Translation occurs at:",
    "options": [
      {
        "letter": "A",
        "text": "Ribosomes."
      },
      {
        "letter": "B",
        "text": "Lysosomes."
      },
      {
        "letter": "C",
        "text": "Centrioles."
      },
      {
        "letter": "D",
        "text": "The cell wall."
      }
    ],
    "answerLetter": "A",
    "explanation": "Ribosomes read mRNA codons and assemble amino acids into a polypeptide.",
    "id": 133
  },
  {
    "qNum": 34,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "A codon consists of:",
    "options": [
      {
        "letter": "A",
        "text": "One nucleotide."
      },
      {
        "letter": "B",
        "text": "Two nucleotides."
      },
      {
        "letter": "C",
        "text": "Three nucleotides."
      },
      {
        "letter": "D",
        "text": "Four amino acids."
      }
    ],
    "answerLetter": "C",
    "explanation": "Each codon is a sequence of three RNA nucleotides.",
    "id": 134
  },
  {
    "qNum": 35,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "A mutation is:",
    "options": [
      {
        "letter": "A",
        "text": "A heritable change in genetic material."
      },
      {
        "letter": "B",
        "text": "Any temporary change in behaviour."
      },
      {
        "letter": "C",
        "text": "The normal pairing of bases."
      },
      {
        "letter": "D",
        "text": "Protein folding only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Mutations are changes in DNA sequence or genetic material that may be inherited if present in germ cells.",
    "id": 135
  },
  {
    "qNum": 36,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "Natural selection acts directly on differences in:",
    "options": [
      {
        "letter": "A",
        "text": "Reproductive success associated with heritable traits."
      },
      {
        "letter": "B",
        "text": "Traits that are never inherited."
      },
      {
        "letter": "C",
        "text": "Individual organisms’ wishes."
      },
      {
        "letter": "D",
        "text": "Randomly assigned labels."
      }
    ],
    "answerLetter": "A",
    "explanation": "Heritable variants that affect reproductive success can change in frequency across generations.",
    "id": 136
  },
  {
    "qNum": 37,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "The modern synthesis of evolution combines natural selection with:",
    "options": [
      {
        "letter": "A",
        "text": "Mendelian genetics and population genetics."
      },
      {
        "letter": "B",
        "text": "Spontaneous generation."
      },
      {
        "letter": "C",
        "text": "The idea that acquired traits are always inherited."
      },
      {
        "letter": "D",
        "text": "The denial of mutation."
      }
    ],
    "answerLetter": "A",
    "explanation": "The modern synthesis integrates Darwinian selection with genetic mechanisms.",
    "id": 137
  },
  {
    "qNum": 38,
    "subject": "Biology",
    "chapter": "Molecular genetics, mutation, evolution and biotechnology",
    "topic": "",
    "passage": "",
    "question": "Recombinant DNA technology involves:",
    "options": [
      {
        "letter": "A",
        "text": "Joining DNA sequences from different sources."
      },
      {
        "letter": "B",
        "text": "Converting all DNA into protein."
      },
      {
        "letter": "C",
        "text": "Removing all genes from a cell."
      },
      {
        "letter": "D",
        "text": "Replacing meiosis with mitosis."
      }
    ],
    "answerLetter": "A",
    "explanation": "Recombinant DNA combines DNA segments to create a new construct.",
    "id": 138
  },
  {
    "qNum": 39,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "Which tissue covers body surfaces and lines internal cavities?",
    "options": [
      {
        "letter": "A",
        "text": "Epithelial tissue."
      },
      {
        "letter": "B",
        "text": "Nervous tissue."
      },
      {
        "letter": "C",
        "text": "Muscle tissue."
      },
      {
        "letter": "D",
        "text": "Cartilage only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Epithelia form coverings and linings and also contribute to glands.",
    "id": 139
  },
  {
    "qNum": 40,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "Which tissue is specialised for transmitting electrical signals?",
    "options": [
      {
        "letter": "A",
        "text": "Connective tissue."
      },
      {
        "letter": "B",
        "text": "Nervous tissue."
      },
      {
        "letter": "C",
        "text": "Adipose tissue."
      },
      {
        "letter": "D",
        "text": "Epithelial tissue."
      }
    ],
    "answerLetter": "B",
    "explanation": "Neurons and supporting glial cells make up nervous tissue.",
    "id": 140
  },
  {
    "qNum": 41,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "The primary function of red blood cells is to:",
    "options": [
      {
        "letter": "A",
        "text": "Transport oxygen using haemoglobin."
      },
      {
        "letter": "B",
        "text": "Produce antibodies."
      },
      {
        "letter": "C",
        "text": "Digest pathogens."
      },
      {
        "letter": "D",
        "text": "Form bone matrix."
      }
    ],
    "answerLetter": "A",
    "explanation": "Haemoglobin binds and transports oxygen.",
    "id": 141
  },
  {
    "qNum": 42,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "Gas exchange between air and blood occurs mainly in the:",
    "options": [
      {
        "letter": "A",
        "text": "Bronchi."
      },
      {
        "letter": "B",
        "text": "Alveoli."
      },
      {
        "letter": "C",
        "text": "Trachea."
      },
      {
        "letter": "D",
        "text": "Larynx."
      }
    ],
    "answerLetter": "B",
    "explanation": "Thin-walled alveoli provide a large surface for diffusion of gases.",
    "id": 142
  },
  {
    "qNum": 43,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "The functional unit of the kidney is the:",
    "options": [
      {
        "letter": "A",
        "text": "Neuron."
      },
      {
        "letter": "B",
        "text": "Nephron."
      },
      {
        "letter": "C",
        "text": "Alveolus."
      },
      {
        "letter": "D",
        "text": "Villus."
      }
    ],
    "answerLetter": "B",
    "explanation": "Nephrons filter blood and modify filtrate to form urine.",
    "id": 143
  },
  {
    "qNum": 44,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "Insulin generally lowers blood glucose by:",
    "options": [
      {
        "letter": "A",
        "text": "Promoting glucose uptake and storage."
      },
      {
        "letter": "B",
        "text": "Stimulating glycogen breakdown in all tissues."
      },
      {
        "letter": "C",
        "text": "Preventing cells from taking up glucose."
      },
      {
        "letter": "D",
        "text": "Converting glucose into oxygen."
      }
    ],
    "answerLetter": "A",
    "explanation": "Insulin promotes glucose uptake in responsive tissues and storage as glycogen and fat.",
    "id": 144
  },
  {
    "qNum": 45,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "Homeostasis is the maintenance of:",
    "options": [
      {
        "letter": "A",
        "text": "Relatively stable internal conditions."
      },
      {
        "letter": "B",
        "text": "A constant external temperature everywhere."
      },
      {
        "letter": "C",
        "text": "Identical cell sizes."
      },
      {
        "letter": "D",
        "text": "A fixed body mass throughout life."
      }
    ],
    "answerLetter": "A",
    "explanation": "Homeostatic systems regulate variables such as temperature, pH and glucose.",
    "id": 145
  },
  {
    "qNum": 46,
    "subject": "Biology",
    "chapter": "Human and animal anatomy, physiology, tissues and homeostasis",
    "topic": "",
    "passage": "",
    "question": "Negative feedback generally:",
    "options": [
      {
        "letter": "A",
        "text": "Amplifies the initial change."
      },
      {
        "letter": "B",
        "text": "Opposes a deviation from a set range."
      },
      {
        "letter": "C",
        "text": "Prevents all regulation."
      },
      {
        "letter": "D",
        "text": "Stops all enzyme reactions."
      }
    ],
    "answerLetter": "B",
    "explanation": "Negative feedback reduces the original deviation and stabilises the system.",
    "id": 146
  },
  {
    "qNum": 47,
    "subject": "Biology",
    "chapter": "Bioenergetics and cellular respiration",
    "topic": "",
    "passage": "",
    "question": "ATP is described as the cell’s energy currency because:",
    "options": [
      {
        "letter": "A",
        "text": "Its hydrolysis can be coupled to energy-requiring processes."
      },
      {
        "letter": "B",
        "text": "It stores genetic information."
      },
      {
        "letter": "C",
        "text": "It forms the cell wall."
      },
      {
        "letter": "D",
        "text": "It is the only molecule in cells."
      }
    ],
    "answerLetter": "A",
    "explanation": "ATP hydrolysis releases usable free energy for cellular work.",
    "id": 147
  },
  {
    "qNum": 48,
    "subject": "Biology",
    "chapter": "Bioenergetics and cellular respiration",
    "topic": "",
    "passage": "",
    "question": "Glycolysis takes place in the:",
    "options": [
      {
        "letter": "A",
        "text": "Cytosol."
      },
      {
        "letter": "B",
        "text": "Mitochondrial matrix only."
      },
      {
        "letter": "C",
        "text": "Nucleus."
      },
      {
        "letter": "D",
        "text": "Chloroplast thylakoid."
      }
    ],
    "answerLetter": "A",
    "explanation": "Glycolysis occurs in the cytosol and does not directly require oxygen.",
    "id": 148
  },
  {
    "qNum": 49,
    "subject": "Biology",
    "chapter": "Bioenergetics and cellular respiration",
    "topic": "",
    "passage": "",
    "question": "In aerobic respiration, the final electron acceptor in the electron transport chain is:",
    "options": [
      {
        "letter": "A",
        "text": "Carbon dioxide."
      },
      {
        "letter": "B",
        "text": "Oxygen."
      },
      {
        "letter": "C",
        "text": "Glucose."
      },
      {
        "letter": "D",
        "text": "ATP."
      }
    ],
    "answerLetter": "B",
    "explanation": "Oxygen accepts electrons and protons to form water.",
    "id": 149
  },
  {
    "qNum": 50,
    "subject": "Biology",
    "chapter": "Bioenergetics and cellular respiration",
    "topic": "",
    "passage": "",
    "question": "In photosynthesis, oxygen released by plants originates primarily from:",
    "options": [
      {
        "letter": "A",
        "text": "Carbon dioxide."
      },
      {
        "letter": "B",
        "text": "Glucose."
      },
      {
        "letter": "C",
        "text": "Water."
      },
      {
        "letter": "D",
        "text": "Chlorophyll."
      }
    ],
    "answerLetter": "C",
    "explanation": "Water is split during the light reactions, releasing oxygen.",
    "id": 150
  },
  {
    "qNum": 1,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Which is a homogeneous mixture?",
    "options": [
      {
        "letter": "A",
        "text": "Salt dissolved completely in water."
      },
      {
        "letter": "B",
        "text": "Sand in water."
      },
      {
        "letter": "C",
        "text": "Oil and water."
      },
      {
        "letter": "D",
        "text": "Granite."
      }
    ],
    "answerLetter": "A",
    "explanation": "A homogeneous solution has uniform composition throughout.",
    "id": 151
  },
  {
    "qNum": 2,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Which change is physical rather than chemical?",
    "options": [
      {
        "letter": "A",
        "text": "Iron rusting."
      },
      {
        "letter": "B",
        "text": "Wood burning."
      },
      {
        "letter": "C",
        "text": "Ice melting."
      },
      {
        "letter": "D",
        "text": "Hydrogen reacting with oxygen."
      }
    ],
    "answerLetter": "C",
    "explanation": "Melting changes physical state without changing chemical identity.",
    "id": 152
  },
  {
    "qNum": 3,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "The ideal gas equation is:",
    "options": [
      {
        "letter": "A",
        "text": "PV = nRT."
      },
      {
        "letter": "B",
        "text": "P = mv."
      },
      {
        "letter": "C",
        "text": "E = mc."
      },
      {
        "letter": "D",
        "text": "V = IR."
      }
    ],
    "answerLetter": "A",
    "explanation": "The ideal gas law relates pressure, volume, amount and absolute temperature.",
    "id": 153
  },
  {
    "qNum": 4,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "At constant temperature and amount of gas, pressure is inversely proportional to volume. This is:",
    "options": [
      {
        "letter": "A",
        "text": "Charles’s law."
      },
      {
        "letter": "B",
        "text": "Boyle’s law."
      },
      {
        "letter": "C",
        "text": "Avogadro’s law."
      },
      {
        "letter": "D",
        "text": "Faraday’s law."
      }
    ],
    "answerLetter": "B",
    "explanation": "Boyle’s law states P₁V₁ = P₂V₂ for a fixed amount of gas at constant temperature.",
    "id": 154
  },
  {
    "qNum": 5,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "The atomic number of an element equals the number of:",
    "options": [
      {
        "letter": "A",
        "text": "Neutrons."
      },
      {
        "letter": "B",
        "text": "Protons."
      },
      {
        "letter": "C",
        "text": "Protons plus neutrons."
      },
      {
        "letter": "D",
        "text": "Electron shells."
      }
    ],
    "answerLetter": "B",
    "explanation": "Atomic number is defined by proton number.",
    "id": 155
  },
  {
    "qNum": 6,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Isotopes of an element have the same number of:",
    "options": [
      {
        "letter": "A",
        "text": "Neutrons but different protons."
      },
      {
        "letter": "B",
        "text": "Protons but different neutrons."
      },
      {
        "letter": "C",
        "text": "Protons and neutrons."
      },
      {
        "letter": "D",
        "text": "Electrons and neutrons in every ion."
      }
    ],
    "answerLetter": "B",
    "explanation": "Isotopes share atomic number but differ in mass number due to neutron number.",
    "id": 156
  },
  {
    "qNum": 7,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "The mass number of an atom is the total number of:",
    "options": [
      {
        "letter": "A",
        "text": "Protons and neutrons."
      },
      {
        "letter": "B",
        "text": "Protons and electrons."
      },
      {
        "letter": "C",
        "text": "Neutrons and electrons."
      },
      {
        "letter": "D",
        "text": "Orbitals."
      }
    ],
    "answerLetter": "A",
    "explanation": "Mass number counts nucleons: protons plus neutrons.",
    "id": 157
  },
  {
    "qNum": 8,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Which subatomic particle has a negative charge?",
    "options": [
      {
        "letter": "A",
        "text": "Proton."
      },
      {
        "letter": "B",
        "text": "Neutron."
      },
      {
        "letter": "C",
        "text": "Electron."
      },
      {
        "letter": "D",
        "text": "Alpha particle."
      }
    ],
    "answerLetter": "C",
    "explanation": "Electrons carry a negative elementary charge.",
    "id": 158
  },
  {
    "qNum": 9,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Across a period from left to right, atomic radius generally:",
    "options": [
      {
        "letter": "A",
        "text": "Increases."
      },
      {
        "letter": "B",
        "text": "Decreases."
      },
      {
        "letter": "C",
        "text": "Remains exactly constant."
      },
      {
        "letter": "D",
        "text": "Becomes infinite."
      }
    ],
    "answerLetter": "B",
    "explanation": "Effective nuclear charge generally increases, pulling electrons closer.",
    "id": 159
  },
  {
    "qNum": 10,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Down a group, atomic radius generally:",
    "options": [
      {
        "letter": "A",
        "text": "Decreases."
      },
      {
        "letter": "B",
        "text": "Increases."
      },
      {
        "letter": "C",
        "text": "Is always zero."
      },
      {
        "letter": "D",
        "text": "Does not change for any element."
      }
    ],
    "answerLetter": "B",
    "explanation": "Additional occupied electron shells increase atomic size.",
    "id": 160
  },
  {
    "qNum": 11,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Elements in the same group of the main-group periodic table often have similar chemical properties because they have similar:",
    "options": [
      {
        "letter": "A",
        "text": "Numbers of valence electrons."
      },
      {
        "letter": "B",
        "text": "Atomic masses."
      },
      {
        "letter": "C",
        "text": "Numbers of neutrons."
      },
      {
        "letter": "D",
        "text": "Nuclear sizes."
      }
    ],
    "answerLetter": "A",
    "explanation": "Similar valence-shell configurations lead to similar chemical behaviour.",
    "id": 161
  },
  {
    "qNum": 12,
    "subject": "Chemistry",
    "chapter": "Matter, gases, atoms and periodic properties",
    "topic": "",
    "passage": "",
    "question": "Which element is a noble gas?",
    "options": [
      {
        "letter": "A",
        "text": "Sodium."
      },
      {
        "letter": "B",
        "text": "Chlorine."
      },
      {
        "letter": "C",
        "text": "Neon."
      },
      {
        "letter": "D",
        "text": "Magnesium."
      }
    ],
    "answerLetter": "C",
    "explanation": "Neon is in Group 18 and has a filled valence shell.",
    "id": 162
  },
  {
    "qNum": 13,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "An ionic bond is formed mainly by:",
    "options": [
      {
        "letter": "A",
        "text": "Sharing electron pairs equally."
      },
      {
        "letter": "B",
        "text": "Electrostatic attraction between oppositely charged ions."
      },
      {
        "letter": "C",
        "text": "Attraction between two neutrons."
      },
      {
        "letter": "D",
        "text": "Delocalisation of protons."
      }
    ],
    "answerLetter": "B",
    "explanation": "Ionic bonding follows electron transfer and attraction between cations and anions.",
    "id": 163
  },
  {
    "qNum": 14,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "A covalent bond involves:",
    "options": [
      {
        "letter": "A",
        "text": "Sharing electron pairs between atoms."
      },
      {
        "letter": "B",
        "text": "Transfer of neutrons."
      },
      {
        "letter": "C",
        "text": "Attraction between ions only."
      },
      {
        "letter": "D",
        "text": "Loss of all valence electrons."
      }
    ],
    "answerLetter": "A",
    "explanation": "Covalent bonds form when atoms share electron pairs.",
    "id": 164
  },
  {
    "qNum": 15,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "Metallic bonding is commonly described as:",
    "options": [
      {
        "letter": "A",
        "text": "Positive metal ions in a sea of delocalised electrons."
      },
      {
        "letter": "B",
        "text": "Alternating neutral molecules held by hydrogen bonds."
      },
      {
        "letter": "C",
        "text": "A network of isolated noble-gas atoms."
      },
      {
        "letter": "D",
        "text": "Shared electron pairs between only two atoms."
      }
    ],
    "answerLetter": "A",
    "explanation": "Delocalised electrons account for conductivity and malleability in metals.",
    "id": 165
  },
  {
    "qNum": 16,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "Which molecule is polar?",
    "options": [
      {
        "letter": "A",
        "text": "CO₂."
      },
      {
        "letter": "B",
        "text": "CH₄."
      },
      {
        "letter": "C",
        "text": "H₂O."
      },
      {
        "letter": "D",
        "text": "CCl₄."
      }
    ],
    "answerLetter": "C",
    "explanation": "Water has polar O–H bonds and a bent geometry, giving a net dipole.",
    "id": 166
  },
  {
    "qNum": 17,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "The strongest intermolecular attraction among the following for pure substances is generally present in:",
    "options": [
      {
        "letter": "A",
        "text": "CH₄."
      },
      {
        "letter": "B",
        "text": "H₂O."
      },
      {
        "letter": "C",
        "text": "CO₂."
      },
      {
        "letter": "D",
        "text": "He."
      }
    ],
    "answerLetter": "B",
    "explanation": "Water forms hydrogen bonds, stronger than ordinary dispersion forces in the other choices.",
    "id": 167
  },
  {
    "qNum": 18,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "Which oxide is generally basic?",
    "options": [
      {
        "letter": "A",
        "text": "Na₂O."
      },
      {
        "letter": "B",
        "text": "SO₃."
      },
      {
        "letter": "C",
        "text": "CO₂."
      },
      {
        "letter": "D",
        "text": "P₄O₁₀."
      }
    ],
    "answerLetter": "A",
    "explanation": "Sodium oxide is a metal oxide and reacts with water to form a base.",
    "id": 168
  },
  {
    "qNum": 19,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "Which compound is a hydroxide?",
    "options": [
      {
        "letter": "A",
        "text": "HCl."
      },
      {
        "letter": "B",
        "text": "NaOH."
      },
      {
        "letter": "C",
        "text": "CO₂."
      },
      {
        "letter": "D",
        "text": "NaCl."
      }
    ],
    "answerLetter": "B",
    "explanation": "Sodium hydroxide contains the hydroxide ion, OH⁻.",
    "id": 169
  },
  {
    "qNum": 20,
    "subject": "Chemistry",
    "chapter": "Chemical bonding and inorganic compounds",
    "topic": "",
    "passage": "",
    "question": "The formula of calcium chloride is:",
    "options": [
      {
        "letter": "A",
        "text": "CaCl."
      },
      {
        "letter": "B",
        "text": "CaCl₂."
      },
      {
        "letter": "C",
        "text": "Ca₂Cl."
      },
      {
        "letter": "D",
        "text": "Ca₂Cl₂."
      }
    ],
    "answerLetter": "B",
    "explanation": "Ca²⁺ requires two Cl⁻ ions to balance charge.",
    "id": 170
  },
  {
    "qNum": 21,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "One mole contains approximately:",
    "options": [
      {
        "letter": "A",
        "text": "6.022 × 10²³ entities."
      },
      {
        "letter": "B",
        "text": "3.00 × 10⁸ entities."
      },
      {
        "letter": "C",
        "text": "9.81 entities."
      },
      {
        "letter": "D",
        "text": "1.00 × 10³ entities."
      }
    ],
    "answerLetter": "A",
    "explanation": "This is Avogadro’s constant.",
    "id": 171
  },
  {
    "qNum": 22,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "The molar mass of water (H₂O) is approximately:",
    "options": [
      {
        "letter": "A",
        "text": "10 g mol⁻¹."
      },
      {
        "letter": "B",
        "text": "16 g mol⁻¹."
      },
      {
        "letter": "C",
        "text": "18 g mol⁻¹."
      },
      {
        "letter": "D",
        "text": "20 g mol⁻¹."
      }
    ],
    "answerLetter": "C",
    "explanation": "2(1) + 16 = 18 g mol⁻¹.",
    "id": 172
  },
  {
    "qNum": 23,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "How many moles are present in 36 g of water? (Molar mass = 18 g mol⁻¹.)",
    "options": [
      {
        "letter": "A",
        "text": "0.5 mol."
      },
      {
        "letter": "B",
        "text": "1 mol."
      },
      {
        "letter": "C",
        "text": "2 mol."
      },
      {
        "letter": "D",
        "text": "18 mol."
      }
    ],
    "answerLetter": "C",
    "explanation": "n = mass/molar mass = 36/18 = 2 mol.",
    "id": 173
  },
  {
    "qNum": 24,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "Which equation is balanced?",
    "options": [
      {
        "letter": "A",
        "text": "H₂ + O₂ → H₂O."
      },
      {
        "letter": "B",
        "text": "2H₂ + O₂ → 2H₂O."
      },
      {
        "letter": "C",
        "text": "H₂ + 2O₂ → H₂O."
      },
      {
        "letter": "D",
        "text": "2H₂ + 2O₂ → H₂O."
      }
    ],
    "answerLetter": "B",
    "explanation": "Both sides contain four hydrogen atoms and two oxygen atoms.",
    "id": 174
  },
  {
    "qNum": 25,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "In the reaction 2Mg + O₂ → 2MgO, oxygen is:",
    "options": [
      {
        "letter": "A",
        "text": "Oxidised."
      },
      {
        "letter": "B",
        "text": "Reduced."
      },
      {
        "letter": "C",
        "text": "Neither oxidised nor reduced."
      },
      {
        "letter": "D",
        "text": "A catalyst."
      }
    ],
    "answerLetter": "B",
    "explanation": "Oxygen changes from oxidation state 0 in O₂ to −2 in MgO.",
    "id": 175
  },
  {
    "qNum": 26,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "A reaction in which two or more reactants form one product is commonly called:",
    "options": [
      {
        "letter": "A",
        "text": "Decomposition."
      },
      {
        "letter": "B",
        "text": "Synthesis/combination."
      },
      {
        "letter": "C",
        "text": "Displacement."
      },
      {
        "letter": "D",
        "text": "Combustion only."
      }
    ],
    "answerLetter": "B",
    "explanation": "A combination reaction forms a product from simpler reactants.",
    "id": 176
  },
  {
    "qNum": 27,
    "subject": "Chemistry",
    "chapter": "Mole concept, stoichiometry and reaction types",
    "topic": "",
    "passage": "",
    "question": "The limiting reactant is the reactant that:",
    "options": [
      {
        "letter": "A",
        "text": "Is left over in the greatest amount."
      },
      {
        "letter": "B",
        "text": "Is consumed first and limits product formation."
      },
      {
        "letter": "C",
        "text": "Always has the largest molar mass."
      },
      {
        "letter": "D",
        "text": "Acts as the solvent."
      }
    ],
    "answerLetter": "B",
    "explanation": "The limiting reactant determines the maximum theoretical product.",
    "id": 177
  },
  {
    "qNum": 28,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "Molarity is defined as:",
    "options": [
      {
        "letter": "A",
        "text": "Moles of solute per litre of solution."
      },
      {
        "letter": "B",
        "text": "Grams of solvent per litre."
      },
      {
        "letter": "C",
        "text": "Moles of solvent per kilogram of solute."
      },
      {
        "letter": "D",
        "text": "Mass percent of solvent only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Molarity (mol L⁻¹) is amount of solute divided by solution volume in litres.",
    "id": 178
  },
  {
    "qNum": 29,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "A solution with pH 3 is:",
    "options": [
      {
        "letter": "A",
        "text": "Acidic."
      },
      {
        "letter": "B",
        "text": "Neutral."
      },
      {
        "letter": "C",
        "text": "Basic."
      },
      {
        "letter": "D",
        "text": "Always a buffer."
      }
    ],
    "answerLetter": "A",
    "explanation": "At 25°C, pH below 7 indicates an acidic solution.",
    "id": 179
  },
  {
    "qNum": 30,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "At 25°C, a neutral aqueous solution has pH approximately:",
    "options": [
      {
        "letter": "A",
        "text": "0."
      },
      {
        "letter": "B",
        "text": "5."
      },
      {
        "letter": "C",
        "text": "7."
      },
      {
        "letter": "D",
        "text": "14."
      }
    ],
    "answerLetter": "C",
    "explanation": "Neutral water has [H⁺] = [OH⁻] = 10⁻⁷ mol L⁻¹ at 25°C.",
    "id": 180
  },
  {
    "qNum": 31,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "A Brønsted–Lowry acid is a:",
    "options": [
      {
        "letter": "A",
        "text": "Proton donor."
      },
      {
        "letter": "B",
        "text": "Proton acceptor."
      },
      {
        "letter": "C",
        "text": "Electron-pair donor only."
      },
      {
        "letter": "D",
        "text": "Neutron donor."
      }
    ],
    "answerLetter": "A",
    "explanation": "Brønsted–Lowry acids donate H⁺.",
    "id": 181
  },
  {
    "qNum": 32,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "A buffer solution resists changes in:",
    "options": [
      {
        "letter": "A",
        "text": "Temperature only."
      },
      {
        "letter": "B",
        "text": "pH when small amounts of acid or base are added."
      },
      {
        "letter": "C",
        "text": "Volume when stirred."
      },
      {
        "letter": "D",
        "text": "Mass during evaporation."
      }
    ],
    "answerLetter": "B",
    "explanation": "Buffers contain a weak acid/base pair that moderates pH changes.",
    "id": 182
  },
  {
    "qNum": 33,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "A catalyst increases reaction rate by:",
    "options": [
      {
        "letter": "A",
        "text": "Providing an alternative pathway with lower activation energy."
      },
      {
        "letter": "B",
        "text": "Increasing the enthalpy change."
      },
      {
        "letter": "C",
        "text": "Shifting equilibrium permanently toward products."
      },
      {
        "letter": "D",
        "text": "Being consumed completely."
      }
    ],
    "answerLetter": "A",
    "explanation": "A catalyst changes the pathway and speeds both forward and reverse reactions.",
    "id": 183
  },
  {
    "qNum": 34,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "Increasing temperature usually increases reaction rate because:",
    "options": [
      {
        "letter": "A",
        "text": "Fewer particles have sufficient energy."
      },
      {
        "letter": "B",
        "text": "A greater fraction of collisions exceed activation energy."
      },
      {
        "letter": "C",
        "text": "All collisions stop."
      },
      {
        "letter": "D",
        "text": "The activation energy always becomes zero."
      }
    ],
    "answerLetter": "B",
    "explanation": "Higher temperature increases molecular kinetic energy and successful collision frequency.",
    "id": 184
  },
  {
    "qNum": 35,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "At dynamic chemical equilibrium:",
    "options": [
      {
        "letter": "A",
        "text": "The forward reaction stops."
      },
      {
        "letter": "B",
        "text": "The reverse reaction stops."
      },
      {
        "letter": "C",
        "text": "Forward and reverse reaction rates are equal."
      },
      {
        "letter": "D",
        "text": "Reactant and product concentrations must be equal."
      }
    ],
    "answerLetter": "C",
    "explanation": "Equilibrium is dynamic; both reactions continue at equal rates.",
    "id": 185
  },
  {
    "qNum": 36,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "Oxidation is defined in terms of electrons as:",
    "options": [
      {
        "letter": "A",
        "text": "Gain of electrons."
      },
      {
        "letter": "B",
        "text": "Loss of electrons."
      },
      {
        "letter": "C",
        "text": "Gain of neutrons."
      },
      {
        "letter": "D",
        "text": "Loss of protons only."
      }
    ],
    "answerLetter": "B",
    "explanation": "Oxidation is electron loss; reduction is electron gain.",
    "id": 186
  },
  {
    "qNum": 37,
    "subject": "Chemistry",
    "chapter": "Solutions, equilibrium, kinetics, acids and bases, redox",
    "topic": "",
    "passage": "",
    "question": "In the reaction Zn + Cu²⁺ → Zn²⁺ + Cu, the reducing agent is:",
    "options": [
      {
        "letter": "A",
        "text": "Zn."
      },
      {
        "letter": "B",
        "text": "Cu²⁺."
      },
      {
        "letter": "C",
        "text": "Zn²⁺."
      },
      {
        "letter": "D",
        "text": "Cu."
      }
    ],
    "answerLetter": "A",
    "explanation": "Zinc loses electrons and reduces Cu²⁺ to copper.",
    "id": 187
  },
  {
    "qNum": 38,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "The ability of carbon to form four covalent bonds is called:",
    "options": [
      {
        "letter": "A",
        "text": "Tetravalency."
      },
      {
        "letter": "B",
        "text": "Ionisation."
      },
      {
        "letter": "C",
        "text": "Sublimation."
      },
      {
        "letter": "D",
        "text": "Neutralisation."
      }
    ],
    "answerLetter": "A",
    "explanation": "Carbon is tetravalent and can form four covalent bonds.",
    "id": 188
  },
  {
    "qNum": 39,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Compounds with the same molecular formula but different structures are:",
    "options": [
      {
        "letter": "A",
        "text": "Isotopes."
      },
      {
        "letter": "B",
        "text": "Isomers."
      },
      {
        "letter": "C",
        "text": "Ions."
      },
      {
        "letter": "D",
        "text": "Allotropes in every case."
      }
    ],
    "answerLetter": "B",
    "explanation": "Isomers share a molecular formula but differ in atom connectivity or spatial arrangement.",
    "id": 189
  },
  {
    "qNum": 40,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "The general formula of an open-chain saturated alkane is:",
    "options": [
      {
        "letter": "A",
        "text": "CₙH₂ₙ₊₂."
      },
      {
        "letter": "B",
        "text": "CₙH₂ₙ."
      },
      {
        "letter": "C",
        "text": "CₙH₂ₙ₋₂."
      },
      {
        "letter": "D",
        "text": "CₙHₙ."
      }
    ],
    "answerLetter": "A",
    "explanation": "Acyclic alkanes have the formula CₙH₂ₙ₊₂.",
    "id": 190
  },
  {
    "qNum": 41,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Which functional group defines an alcohol?",
    "options": [
      {
        "letter": "A",
        "text": "–OH."
      },
      {
        "letter": "B",
        "text": "–COOH."
      },
      {
        "letter": "C",
        "text": "–CHO."
      },
      {
        "letter": "D",
        "text": "–COO–."
      }
    ],
    "answerLetter": "A",
    "explanation": "Alcohols contain a hydroxyl group attached to a saturated carbon.",
    "id": 191
  },
  {
    "qNum": 42,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Which functional group is present in carboxylic acids?",
    "options": [
      {
        "letter": "A",
        "text": "–NH₂."
      },
      {
        "letter": "B",
        "text": "–COOH."
      },
      {
        "letter": "C",
        "text": "–O–."
      },
      {
        "letter": "D",
        "text": "–CHO only."
      }
    ],
    "answerLetter": "B",
    "explanation": "The carboxyl group combines carbonyl and hydroxyl groups.",
    "id": 192
  },
  {
    "qNum": 43,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Aldehydes contain which characteristic group?",
    "options": [
      {
        "letter": "A",
        "text": "–CHO."
      },
      {
        "letter": "B",
        "text": "–COOH."
      },
      {
        "letter": "C",
        "text": "–NH₂."
      },
      {
        "letter": "D",
        "text": "–O–."
      }
    ],
    "answerLetter": "A",
    "explanation": "An aldehyde has a terminal carbonyl group bonded to hydrogen.",
    "id": 193
  },
  {
    "qNum": 44,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Ketones contain a carbonyl group:",
    "options": [
      {
        "letter": "A",
        "text": "At the end of a carbon chain bonded to H."
      },
      {
        "letter": "B",
        "text": "Between two carbon groups."
      },
      {
        "letter": "C",
        "text": "Only in an aromatic ring."
      },
      {
        "letter": "D",
        "text": "In a phosphate group."
      }
    ],
    "answerLetter": "B",
    "explanation": "A ketone carbonyl carbon is bonded to two carbon-containing groups.",
    "id": 194
  },
  {
    "qNum": 45,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Ethers have the general linkage:",
    "options": [
      {
        "letter": "A",
        "text": "R–O–R′."
      },
      {
        "letter": "B",
        "text": "R–COOH."
      },
      {
        "letter": "C",
        "text": "R–NH₂."
      },
      {
        "letter": "D",
        "text": "R–CHO."
      }
    ],
    "answerLetter": "A",
    "explanation": "An ether contains an oxygen atom between two carbon groups.",
    "id": 195
  },
  {
    "qNum": 46,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Amines are organic derivatives of:",
    "options": [
      {
        "letter": "A",
        "text": "Ammonia."
      },
      {
        "letter": "B",
        "text": "Water."
      },
      {
        "letter": "C",
        "text": "Carbon dioxide."
      },
      {
        "letter": "D",
        "text": "Hydrogen peroxide."
      }
    ],
    "answerLetter": "A",
    "explanation": "Amines contain nitrogen bonded to carbon and/or hydrogen.",
    "id": 196
  },
  {
    "qNum": 47,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Esters commonly contain which linkage?",
    "options": [
      {
        "letter": "A",
        "text": "–COO–."
      },
      {
        "letter": "B",
        "text": "–NH–NH–."
      },
      {
        "letter": "C",
        "text": "–O–O–."
      },
      {
        "letter": "D",
        "text": "–C≡C–."
      }
    ],
    "answerLetter": "A",
    "explanation": "Esters contain a carbonyl adjacent to an oxygen bonded to another carbon group.",
    "id": 197
  },
  {
    "qNum": 48,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "An amide contains:",
    "options": [
      {
        "letter": "A",
        "text": "A carbonyl group bonded to nitrogen."
      },
      {
        "letter": "B",
        "text": "Only a carbon–carbon double bond."
      },
      {
        "letter": "C",
        "text": "A hydroxyl group only."
      },
      {
        "letter": "D",
        "text": "An ether oxygen only."
      }
    ],
    "answerLetter": "A",
    "explanation": "The amide functional group has a carbonyl carbon attached to nitrogen.",
    "id": 198
  },
  {
    "qNum": 49,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Benzene is classified as:",
    "options": [
      {
        "letter": "A",
        "text": "An aromatic hydrocarbon."
      },
      {
        "letter": "B",
        "text": "An alkane."
      },
      {
        "letter": "C",
        "text": "An alcohol."
      },
      {
        "letter": "D",
        "text": "A carboxylic acid."
      }
    ],
    "answerLetter": "A",
    "explanation": "Benzene is a six-carbon aromatic ring.",
    "id": 199
  },
  {
    "qNum": 50,
    "subject": "Chemistry",
    "chapter": "Organic chemistry and functional groups",
    "topic": "",
    "passage": "",
    "question": "Which pair are functional-group isomers?",
    "options": [
      {
        "letter": "A",
        "text": "Ethanol and dimethyl ether (both C₂H₆O)."
      },
      {
        "letter": "B",
        "text": "Methane and ethane."
      },
      {
        "letter": "C",
        "text": "Ethene and ethyne."
      },
      {
        "letter": "D",
        "text": "Sodium chloride and potassium chloride."
      }
    ],
    "answerLetter": "A",
    "explanation": "They have the same molecular formula but different functional groups: alcohol and ether.",
    "id": 200
  },
  {
    "qNum": 1,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Which number is irrational?",
    "options": [
      {
        "letter": "A",
        "text": "0.25."
      },
      {
        "letter": "B",
        "text": "3/7."
      },
      {
        "letter": "C",
        "text": "√2."
      },
      {
        "letter": "D",
        "text": "−4."
      }
    ],
    "answerLetter": "C",
    "explanation": "√2 cannot be expressed as a ratio of two integers.",
    "id": 201
  },
  {
    "qNum": 2,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Express 0.00056 in scientific notation.",
    "options": [
      {
        "letter": "A",
        "text": "5.6 × 10⁻⁴."
      },
      {
        "letter": "B",
        "text": "5.6 × 10⁻³."
      },
      {
        "letter": "C",
        "text": "56 × 10⁻⁴."
      },
      {
        "letter": "D",
        "text": "0.56 × 10⁻⁵."
      }
    ],
    "answerLetter": "A",
    "explanation": "Moving the decimal four places to the right gives 5.6 × 10⁻⁴.",
    "id": 202
  },
  {
    "qNum": 3,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "What is 15% of 240?",
    "options": [
      {
        "letter": "A",
        "text": "24."
      },
      {
        "letter": "B",
        "text": "30."
      },
      {
        "letter": "C",
        "text": "36."
      },
      {
        "letter": "D",
        "text": "42."
      }
    ],
    "answerLetter": "C",
    "explanation": "0.15 × 240 = 36.",
    "id": 203
  },
  {
    "qNum": 4,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Simplify 2³ × 2⁴.",
    "options": [
      {
        "letter": "A",
        "text": "2⁷."
      },
      {
        "letter": "B",
        "text": "2¹²."
      },
      {
        "letter": "C",
        "text": "2¹."
      },
      {
        "letter": "D",
        "text": "4⁷."
      }
    ],
    "answerLetter": "A",
    "explanation": "When multiplying powers with the same base, add exponents: 3 + 4 = 7.",
    "id": 204
  },
  {
    "qNum": 5,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Simplify √50.",
    "options": [
      {
        "letter": "A",
        "text": "5√2."
      },
      {
        "letter": "B",
        "text": "2√5."
      },
      {
        "letter": "C",
        "text": "10√5."
      },
      {
        "letter": "D",
        "text": "25√2."
      }
    ],
    "answerLetter": "A",
    "explanation": "√50 = √(25×2) = 5√2.",
    "id": 205
  },
  {
    "qNum": 6,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Evaluate log₁₀(1000).",
    "options": [
      {
        "letter": "A",
        "text": "1."
      },
      {
        "letter": "B",
        "text": "2."
      },
      {
        "letter": "C",
        "text": "3."
      },
      {
        "letter": "D",
        "text": "10."
      }
    ],
    "answerLetter": "C",
    "explanation": "10³ = 1000, so the logarithm is 3.",
    "id": 206
  },
  {
    "qNum": 7,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "If log₁₀ x = 2, x equals:",
    "options": [
      {
        "letter": "A",
        "text": "10."
      },
      {
        "letter": "B",
        "text": "20."
      },
      {
        "letter": "C",
        "text": "100."
      },
      {
        "letter": "D",
        "text": "1000."
      }
    ],
    "answerLetter": "C",
    "explanation": "x = 10² = 100.",
    "id": 207
  },
  {
    "qNum": 8,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Expand (x + 3)(x − 3).",
    "options": [
      {
        "letter": "A",
        "text": "x² + 9."
      },
      {
        "letter": "B",
        "text": "x² − 9."
      },
      {
        "letter": "C",
        "text": "x² + 6x + 9."
      },
      {
        "letter": "D",
        "text": "x² − 6x + 9."
      }
    ],
    "answerLetter": "B",
    "explanation": "This is the difference of two squares.",
    "id": 208
  },
  {
    "qNum": 9,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Factorise x² − 5x + 6.",
    "options": [
      {
        "letter": "A",
        "text": "(x − 2)(x − 3)."
      },
      {
        "letter": "B",
        "text": "(x + 2)(x + 3)."
      },
      {
        "letter": "C",
        "text": "(x − 1)(x − 6)."
      },
      {
        "letter": "D",
        "text": "(x + 1)(x − 6)."
      }
    ],
    "answerLetter": "A",
    "explanation": "The numbers −2 and −3 multiply to 6 and add to −5.",
    "id": 209
  },
  {
    "qNum": 10,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Solve 4x + 7 = 23.",
    "options": [
      {
        "letter": "A",
        "text": "2."
      },
      {
        "letter": "B",
        "text": "3."
      },
      {
        "letter": "C",
        "text": "4."
      },
      {
        "letter": "D",
        "text": "5."
      }
    ],
    "answerLetter": "C",
    "explanation": "4x = 16, so x = 4.",
    "id": 210
  },
  {
    "qNum": 11,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Solve x² − 9 = 0.",
    "options": [
      {
        "letter": "A",
        "text": "x = 3 only."
      },
      {
        "letter": "B",
        "text": "x = −3 only."
      },
      {
        "letter": "C",
        "text": "x = ±3."
      },
      {
        "letter": "D",
        "text": "x = 9."
      }
    ],
    "answerLetter": "C",
    "explanation": "x² = 9 gives both roots ±3.",
    "id": 211
  },
  {
    "qNum": 12,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "The solutions of x² − 4x + 4 = 0 are:",
    "options": [
      {
        "letter": "A",
        "text": "2 and 2."
      },
      {
        "letter": "B",
        "text": "−2 and −2."
      },
      {
        "letter": "C",
        "text": "1 and 4."
      },
      {
        "letter": "D",
        "text": "−1 and −4."
      }
    ],
    "answerLetter": "A",
    "explanation": "The equation is (x−2)² = 0, a repeated root at 2.",
    "id": 212
  },
  {
    "qNum": 13,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Solve the inequality 2x − 1 > 5.",
    "options": [
      {
        "letter": "A",
        "text": "x > 2."
      },
      {
        "letter": "B",
        "text": "x > 3."
      },
      {
        "letter": "C",
        "text": "x < 3."
      },
      {
        "letter": "D",
        "text": "x < 2."
      }
    ],
    "answerLetter": "B",
    "explanation": "2x > 6, so x > 3.",
    "id": 213
  },
  {
    "qNum": 14,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Solve the system x + y = 7 and x − y = 1.",
    "options": [
      {
        "letter": "A",
        "text": "x=3, y=4."
      },
      {
        "letter": "B",
        "text": "x=4, y=3."
      },
      {
        "letter": "C",
        "text": "x=5, y=2."
      },
      {
        "letter": "D",
        "text": "x=6, y=1."
      }
    ],
    "answerLetter": "B",
    "explanation": "Adding equations gives 2x=8, x=4 and y=3.",
    "id": 214
  },
  {
    "qNum": 15,
    "subject": "Mathematics",
    "chapter": "Number sets, arithmetic, powers, logarithms and algebra",
    "topic": "",
    "passage": "",
    "question": "Simplify (x² − 1)/(x − 1), for x ≠ 1.",
    "options": [
      {
        "letter": "A",
        "text": "x − 1."
      },
      {
        "letter": "B",
        "text": "x + 1."
      },
      {
        "letter": "C",
        "text": "x² + 1."
      },
      {
        "letter": "D",
        "text": "1 − x."
      }
    ],
    "answerLetter": "B",
    "explanation": "Factor x²−1=(x−1)(x+1), then cancel x−1.",
    "id": 215
  },
  {
    "qNum": 16,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "The domain of f(x)=1/(x−2) is:",
    "options": [
      {
        "letter": "A",
        "text": "All real numbers."
      },
      {
        "letter": "B",
        "text": "All real numbers except 2."
      },
      {
        "letter": "C",
        "text": "x > 2 only."
      },
      {
        "letter": "D",
        "text": "x < 2 only."
      }
    ],
    "answerLetter": "B",
    "explanation": "The denominator cannot equal zero.",
    "id": 216
  },
  {
    "qNum": 17,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "If f(x)=2x+1, then f(3) is:",
    "options": [
      {
        "letter": "A",
        "text": "5."
      },
      {
        "letter": "B",
        "text": "6."
      },
      {
        "letter": "C",
        "text": "7."
      },
      {
        "letter": "D",
        "text": "8."
      }
    ],
    "answerLetter": "C",
    "explanation": "f(3)=2(3)+1=7.",
    "id": 217
  },
  {
    "qNum": 18,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "The graph of y=x² is:",
    "options": [
      {
        "letter": "A",
        "text": "A straight line."
      },
      {
        "letter": "B",
        "text": "A parabola opening upward."
      },
      {
        "letter": "C",
        "text": "A circle."
      },
      {
        "letter": "D",
        "text": "A hyperbola."
      }
    ],
    "answerLetter": "B",
    "explanation": "The quadratic function with positive leading coefficient opens upward.",
    "id": 218
  },
  {
    "qNum": 19,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "The function f(x)=−3x+2 is:",
    "options": [
      {
        "letter": "A",
        "text": "Increasing for all real x."
      },
      {
        "letter": "B",
        "text": "Decreasing for all real x."
      },
      {
        "letter": "C",
        "text": "Constant."
      },
      {
        "letter": "D",
        "text": "Undefined for negative x."
      }
    ],
    "answerLetter": "B",
    "explanation": "Its slope is −3, which is negative.",
    "id": 219
  },
  {
    "qNum": 20,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "The inverse of f(x)=x+5 is:",
    "options": [
      {
        "letter": "A",
        "text": "f⁻¹(x)=x−5."
      },
      {
        "letter": "B",
        "text": "f⁻¹(x)=x+5."
      },
      {
        "letter": "C",
        "text": "f⁻¹(x)=5x."
      },
      {
        "letter": "D",
        "text": "f⁻¹(x)=1/(x+5)."
      }
    ],
    "answerLetter": "A",
    "explanation": "Interchange x and y and solve y=x+5 to obtain x−5.",
    "id": 220
  },
  {
    "qNum": 21,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "sin 30° equals:",
    "options": [
      {
        "letter": "A",
        "text": "0."
      },
      {
        "letter": "B",
        "text": "1/2."
      },
      {
        "letter": "C",
        "text": "√2/2."
      },
      {
        "letter": "D",
        "text": "1."
      }
    ],
    "answerLetter": "B",
    "explanation": "The standard sine value at 30° is 1/2.",
    "id": 221
  },
  {
    "qNum": 22,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "cos 60° equals:",
    "options": [
      {
        "letter": "A",
        "text": "0."
      },
      {
        "letter": "B",
        "text": "1/2."
      },
      {
        "letter": "C",
        "text": "√3/2."
      },
      {
        "letter": "D",
        "text": "1."
      }
    ],
    "answerLetter": "B",
    "explanation": "The standard cosine value at 60° is 1/2.",
    "id": 222
  },
  {
    "qNum": 23,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "tan 45° equals:",
    "options": [
      {
        "letter": "A",
        "text": "0."
      },
      {
        "letter": "B",
        "text": "1/2."
      },
      {
        "letter": "C",
        "text": "1."
      },
      {
        "letter": "D",
        "text": "√3."
      }
    ],
    "answerLetter": "C",
    "explanation": "tan 45° = sin45°/cos45° = 1.",
    "id": 223
  },
  {
    "qNum": 24,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "Convert 180° to radians.",
    "options": [
      {
        "letter": "A",
        "text": "π/2."
      },
      {
        "letter": "B",
        "text": "π."
      },
      {
        "letter": "C",
        "text": "2π."
      },
      {
        "letter": "D",
        "text": "3π/2."
      }
    ],
    "answerLetter": "B",
    "explanation": "180° corresponds to π radians.",
    "id": 224
  },
  {
    "qNum": 25,
    "subject": "Mathematics",
    "chapter": "Functions, graphs and trigonometry",
    "topic": "",
    "passage": "",
    "question": "Which identity is correct?",
    "options": [
      {
        "letter": "A",
        "text": "sin²x + cos²x = 1."
      },
      {
        "letter": "B",
        "text": "sin x + cos x = 1 for every x."
      },
      {
        "letter": "C",
        "text": "tan x = sin x × cos x."
      },
      {
        "letter": "D",
        "text": "cos²x − sin²x = 1 for every x."
      }
    ],
    "answerLetter": "A",
    "explanation": "This is the fundamental Pythagorean trigonometric identity.",
    "id": 225
  },
  {
    "qNum": 26,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The sum of the interior angles of a triangle is:",
    "options": [
      {
        "letter": "A",
        "text": "90°."
      },
      {
        "letter": "B",
        "text": "180°."
      },
      {
        "letter": "C",
        "text": "270°."
      },
      {
        "letter": "D",
        "text": "360°."
      }
    ],
    "answerLetter": "B",
    "explanation": "The interior angles of a Euclidean triangle sum to 180°.",
    "id": 226
  },
  {
    "qNum": 27,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The area of a triangle with base 10 cm and height 6 cm is:",
    "options": [
      {
        "letter": "A",
        "text": "16 cm²."
      },
      {
        "letter": "B",
        "text": "30 cm²."
      },
      {
        "letter": "C",
        "text": "60 cm²."
      },
      {
        "letter": "D",
        "text": "120 cm²."
      }
    ],
    "answerLetter": "B",
    "explanation": "Area = ½ × base × height = ½×10×6 = 30 cm².",
    "id": 227
  },
  {
    "qNum": 28,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The circumference of a circle of radius r is:",
    "options": [
      {
        "letter": "A",
        "text": "πr²."
      },
      {
        "letter": "B",
        "text": "2πr."
      },
      {
        "letter": "C",
        "text": "4πr²."
      },
      {
        "letter": "D",
        "text": "πr."
      }
    ],
    "answerLetter": "B",
    "explanation": "Circumference is 2πr.",
    "id": 228
  },
  {
    "qNum": 29,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The area of a circle of radius 3 is:",
    "options": [
      {
        "letter": "A",
        "text": "6π."
      },
      {
        "letter": "B",
        "text": "9π."
      },
      {
        "letter": "C",
        "text": "12π."
      },
      {
        "letter": "D",
        "text": "18π."
      }
    ],
    "answerLetter": "B",
    "explanation": "Area = πr² = 9π.",
    "id": 229
  },
  {
    "qNum": 30,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "A right triangle has legs 6 and 8. Its hypotenuse is:",
    "options": [
      {
        "letter": "A",
        "text": "9."
      },
      {
        "letter": "B",
        "text": "10."
      },
      {
        "letter": "C",
        "text": "12."
      },
      {
        "letter": "D",
        "text": "14."
      }
    ],
    "answerLetter": "B",
    "explanation": "By Pythagoras, c=√(36+64)=10.",
    "id": 230
  },
  {
    "qNum": 31,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The distance between points (0,0) and (3,4) is:",
    "options": [
      {
        "letter": "A",
        "text": "3."
      },
      {
        "letter": "B",
        "text": "4."
      },
      {
        "letter": "C",
        "text": "5."
      },
      {
        "letter": "D",
        "text": "7."
      }
    ],
    "answerLetter": "C",
    "explanation": "Distance = √(3²+4²)=5.",
    "id": 231
  },
  {
    "qNum": 32,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The midpoint of (2,4) and (6,8) is:",
    "options": [
      {
        "letter": "A",
        "text": "(3,5)."
      },
      {
        "letter": "B",
        "text": "(4,6)."
      },
      {
        "letter": "C",
        "text": "(8,12)."
      },
      {
        "letter": "D",
        "text": "(2,2)."
      }
    ],
    "answerLetter": "B",
    "explanation": "Average the x-coordinates and y-coordinates.",
    "id": 232
  },
  {
    "qNum": 33,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The slope of the line through (1,2) and (3,6) is:",
    "options": [
      {
        "letter": "A",
        "text": "1."
      },
      {
        "letter": "B",
        "text": "2."
      },
      {
        "letter": "C",
        "text": "3."
      },
      {
        "letter": "D",
        "text": "4."
      }
    ],
    "answerLetter": "B",
    "explanation": "Slope = (6−2)/(3−1)=2.",
    "id": 233
  },
  {
    "qNum": 34,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "Two non-vertical parallel lines have:",
    "options": [
      {
        "letter": "A",
        "text": "Equal slopes."
      },
      {
        "letter": "B",
        "text": "Slopes whose product is −1."
      },
      {
        "letter": "C",
        "text": "One slope equal to zero always."
      },
      {
        "letter": "D",
        "text": "Perpendicular direction vectors."
      }
    ],
    "answerLetter": "A",
    "explanation": "Parallel non-vertical lines have the same gradient.",
    "id": 234
  },
  {
    "qNum": 35,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "Two non-vertical perpendicular lines have slopes m₁ and m₂ satisfying:",
    "options": [
      {
        "letter": "A",
        "text": "m₁=m₂."
      },
      {
        "letter": "B",
        "text": "m₁m₂=−1."
      },
      {
        "letter": "C",
        "text": "m₁+m₂=0 in every case."
      },
      {
        "letter": "D",
        "text": "m₁m₂=1."
      }
    ],
    "answerLetter": "B",
    "explanation": "Their slopes are negative reciprocals, when both are defined.",
    "id": 235
  },
  {
    "qNum": 36,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "The equation x² + y² = 25 represents a circle centred at:",
    "options": [
      {
        "letter": "A",
        "text": "(5,0)."
      },
      {
        "letter": "B",
        "text": "(0,5)."
      },
      {
        "letter": "C",
        "text": "(0,0), radius 5."
      },
      {
        "letter": "D",
        "text": "(5,5), radius 25."
      }
    ],
    "answerLetter": "C",
    "explanation": "Standard circle form is (x−h)²+(y−k)²=r².",
    "id": 236
  },
  {
    "qNum": 37,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "A translation is an example of:",
    "options": [
      {
        "letter": "A",
        "text": "An isometry that preserves distances."
      },
      {
        "letter": "B",
        "text": "A transformation that changes every length."
      },
      {
        "letter": "C",
        "text": "A non-linear measurement unit."
      },
      {
        "letter": "D",
        "text": "A probability distribution."
      }
    ],
    "answerLetter": "A",
    "explanation": "A translation moves every point by the same vector and preserves lengths and angles.",
    "id": 237
  },
  {
    "qNum": 38,
    "subject": "Mathematics",
    "chapter": "Geometry and coordinate geometry",
    "topic": "",
    "passage": "",
    "question": "Similar triangles have:",
    "options": [
      {
        "letter": "A",
        "text": "Equal corresponding angles and proportional corresponding sides."
      },
      {
        "letter": "B",
        "text": "Equal areas in every case."
      },
      {
        "letter": "C",
        "text": "Equal perimeters in every case."
      },
      {
        "letter": "D",
        "text": "No relation between corresponding angles."
      }
    ],
    "answerLetter": "A",
    "explanation": "Similarity preserves shape while allowing scale to change.",
    "id": 238
  },
  {
    "qNum": 39,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "The mean of 2, 4, 6 and 8 is:",
    "options": [
      {
        "letter": "A",
        "text": "4."
      },
      {
        "letter": "B",
        "text": "5."
      },
      {
        "letter": "C",
        "text": "6."
      },
      {
        "letter": "D",
        "text": "8."
      }
    ],
    "answerLetter": "B",
    "explanation": "(2+4+6+8)/4 = 5.",
    "id": 239
  },
  {
    "qNum": 40,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "The median of 1, 3, 7, 9, 12 is:",
    "options": [
      {
        "letter": "A",
        "text": "3."
      },
      {
        "letter": "B",
        "text": "7."
      },
      {
        "letter": "C",
        "text": "8."
      },
      {
        "letter": "D",
        "text": "9."
      }
    ],
    "answerLetter": "B",
    "explanation": "The middle value of the ordered list is 7.",
    "id": 240
  },
  {
    "qNum": 41,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "The mode of 2, 3, 3, 4, 5 is:",
    "options": [
      {
        "letter": "A",
        "text": "2."
      },
      {
        "letter": "B",
        "text": "3."
      },
      {
        "letter": "C",
        "text": "4."
      },
      {
        "letter": "D",
        "text": "5."
      }
    ],
    "answerLetter": "B",
    "explanation": "Three appears more often than any other value.",
    "id": 241
  },
  {
    "qNum": 42,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "A fair six-sided die is rolled. The probability of an even result is:",
    "options": [
      {
        "letter": "A",
        "text": "1/6."
      },
      {
        "letter": "B",
        "text": "1/3."
      },
      {
        "letter": "C",
        "text": "1/2."
      },
      {
        "letter": "D",
        "text": "2/3."
      }
    ],
    "answerLetter": "C",
    "explanation": "Three of six outcomes (2, 4, 6) are even.",
    "id": 242
  },
  {
    "qNum": 43,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "If two events A and B are independent, then:",
    "options": [
      {
        "letter": "A",
        "text": "P(A∩B)=P(A)P(B)."
      },
      {
        "letter": "B",
        "text": "P(A∩B)=P(A)+P(B)."
      },
      {
        "letter": "C",
        "text": "P(A)=P(B) always."
      },
      {
        "letter": "D",
        "text": "They cannot occur together."
      }
    ],
    "answerLetter": "A",
    "explanation": "Independence means the probability of both equals the product of their probabilities.",
    "id": 243
  },
  {
    "qNum": 44,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "The probability of an impossible event is:",
    "options": [
      {
        "letter": "A",
        "text": "0."
      },
      {
        "letter": "B",
        "text": "1/2."
      },
      {
        "letter": "C",
        "text": "1."
      },
      {
        "letter": "D",
        "text": "−1."
      }
    ],
    "answerLetter": "A",
    "explanation": "An impossible event has probability zero.",
    "id": 244
  },
  {
    "qNum": 45,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "How many ways can 3 distinct books be arranged on a shelf?",
    "options": [
      {
        "letter": "A",
        "text": "3."
      },
      {
        "letter": "B",
        "text": "6."
      },
      {
        "letter": "C",
        "text": "9."
      },
      {
        "letter": "D",
        "text": "12."
      }
    ],
    "answerLetter": "B",
    "explanation": "The number of arrangements is 3! = 6.",
    "id": 245
  },
  {
    "qNum": 46,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "How many ways can 2 students be selected from 5 students, ignoring order?",
    "options": [
      {
        "letter": "A",
        "text": "5."
      },
      {
        "letter": "B",
        "text": "10."
      },
      {
        "letter": "C",
        "text": "20."
      },
      {
        "letter": "D",
        "text": "25."
      }
    ],
    "answerLetter": "B",
    "explanation": "The number is C(5,2)=5×4/2=10.",
    "id": 246
  },
  {
    "qNum": 47,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "In a frequency distribution, the relative frequency is:",
    "options": [
      {
        "letter": "A",
        "text": "Frequency divided by total observations."
      },
      {
        "letter": "B",
        "text": "Total observations divided by frequency."
      },
      {
        "letter": "C",
        "text": "The largest observed value."
      },
      {
        "letter": "D",
        "text": "The difference between maximum and minimum."
      }
    ],
    "answerLetter": "A",
    "explanation": "Relative frequency is the proportion of observations in a class.",
    "id": 247
  },
  {
    "qNum": 48,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "Which graphical display is commonly suitable for comparing frequencies across categories?",
    "options": [
      {
        "letter": "A",
        "text": "Bar chart."
      },
      {
        "letter": "B",
        "text": "Scatterplot only."
      },
      {
        "letter": "C",
        "text": "Equation of a circle."
      },
      {
        "letter": "D",
        "text": "Number line only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Bar charts compare counts or proportions across discrete categories.",
    "id": 248
  },
  {
    "qNum": 49,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "The range of the data 4, 7, 9, 15 is:",
    "options": [
      {
        "letter": "A",
        "text": "7."
      },
      {
        "letter": "B",
        "text": "9."
      },
      {
        "letter": "C",
        "text": "11."
      },
      {
        "letter": "D",
        "text": "15."
      }
    ],
    "answerLetter": "C",
    "explanation": "Range = maximum − minimum = 15 − 4 = 11.",
    "id": 249
  },
  {
    "qNum": 50,
    "subject": "Mathematics",
    "chapter": "Probability, statistics and combinatorics",
    "topic": "",
    "passage": "",
    "question": "A random experiment is one in which:",
    "options": [
      {
        "letter": "A",
        "text": "The outcome is known with certainty before it occurs."
      },
      {
        "letter": "B",
        "text": "The exact outcome is uncertain, but possible outcomes can be described."
      },
      {
        "letter": "C",
        "text": "No outcome is possible."
      },
      {
        "letter": "D",
        "text": "Results cannot be recorded."
      }
    ],
    "answerLetter": "B",
    "explanation": "A random experiment has a defined set of possible outcomes but an uncertain individual result.",
    "id": 250
  },
  {
    "qNum": 1,
    "subject": "Physics",
    "chapter": "Physical quantities, units and vectors",
    "topic": "",
    "passage": "",
    "question": "The SI unit of force is:",
    "options": [
      {
        "letter": "A",
        "text": "Joule."
      },
      {
        "letter": "B",
        "text": "Newton."
      },
      {
        "letter": "C",
        "text": "Watt."
      },
      {
        "letter": "D",
        "text": "Pascal."
      }
    ],
    "answerLetter": "B",
    "explanation": "Force is measured in newtons (N).",
    "id": 251
  },
  {
    "qNum": 2,
    "subject": "Physics",
    "chapter": "Physical quantities, units and vectors",
    "topic": "",
    "passage": "",
    "question": "Which is a derived SI unit?",
    "options": [
      {
        "letter": "A",
        "text": "Metre."
      },
      {
        "letter": "B",
        "text": "Kilogram."
      },
      {
        "letter": "C",
        "text": "Second."
      },
      {
        "letter": "D",
        "text": "Newton."
      }
    ],
    "answerLetter": "D",
    "explanation": "A newton is derived from kg·m·s⁻².",
    "id": 252
  },
  {
    "qNum": 3,
    "subject": "Physics",
    "chapter": "Physical quantities, units and vectors",
    "topic": "",
    "passage": "",
    "question": "Which quantity is a scalar?",
    "options": [
      {
        "letter": "A",
        "text": "Displacement."
      },
      {
        "letter": "B",
        "text": "Velocity."
      },
      {
        "letter": "C",
        "text": "Speed."
      },
      {
        "letter": "D",
        "text": "Acceleration."
      }
    ],
    "answerLetter": "C",
    "explanation": "Speed has magnitude only; the other listed quantities are vectors.",
    "id": 253
  },
  {
    "qNum": 4,
    "subject": "Physics",
    "chapter": "Physical quantities, units and vectors",
    "topic": "",
    "passage": "",
    "question": "Two perpendicular vectors have magnitudes 3 and 4. The magnitude of their resultant is:",
    "options": [
      {
        "letter": "A",
        "text": "1."
      },
      {
        "letter": "B",
        "text": "5."
      },
      {
        "letter": "C",
        "text": "7."
      },
      {
        "letter": "D",
        "text": "12."
      }
    ],
    "answerLetter": "B",
    "explanation": "By Pythagoras, resultant = √(3²+4²)=5.",
    "id": 254
  },
  {
    "qNum": 5,
    "subject": "Physics",
    "chapter": "Physical quantities, units and vectors",
    "topic": "",
    "passage": "",
    "question": "The prefix “micro” represents:",
    "options": [
      {
        "letter": "A",
        "text": "10⁻³."
      },
      {
        "letter": "B",
        "text": "10⁻⁶."
      },
      {
        "letter": "C",
        "text": "10³."
      },
      {
        "letter": "D",
        "text": "10⁶."
      }
    ],
    "answerLetter": "B",
    "explanation": "Micro (μ) means one millionth.",
    "id": 255
  },
  {
    "qNum": 6,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "Average speed is calculated as:",
    "options": [
      {
        "letter": "A",
        "text": "Displacement divided by time."
      },
      {
        "letter": "B",
        "text": "Total distance divided by total time."
      },
      {
        "letter": "C",
        "text": "Acceleration multiplied by time."
      },
      {
        "letter": "D",
        "text": "Force divided by mass."
      }
    ],
    "answerLetter": "B",
    "explanation": "Average speed uses total path length over elapsed time.",
    "id": 256
  },
  {
    "qNum": 7,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "A car travels 120 m in 6 s at constant speed. Its speed is:",
    "options": [
      {
        "letter": "A",
        "text": "10 m/s."
      },
      {
        "letter": "B",
        "text": "15 m/s."
      },
      {
        "letter": "C",
        "text": "20 m/s."
      },
      {
        "letter": "D",
        "text": "30 m/s."
      }
    ],
    "answerLetter": "C",
    "explanation": "v = 120/6 = 20 m/s.",
    "id": 257
  },
  {
    "qNum": 8,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "An object starts from rest and accelerates at 2 m/s² for 5 s. Its final speed is:",
    "options": [
      {
        "letter": "A",
        "text": "2 m/s."
      },
      {
        "letter": "B",
        "text": "5 m/s."
      },
      {
        "letter": "C",
        "text": "10 m/s."
      },
      {
        "letter": "D",
        "text": "20 m/s."
      }
    ],
    "answerLetter": "C",
    "explanation": "v = u + at = 0 + 2×5 = 10 m/s.",
    "id": 258
  },
  {
    "qNum": 9,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "In uniform circular motion, the speed may be constant while velocity changes because:",
    "options": [
      {
        "letter": "A",
        "text": "The direction of motion changes continuously."
      },
      {
        "letter": "B",
        "text": "The mass changes continuously."
      },
      {
        "letter": "C",
        "text": "The radius must increase."
      },
      {
        "letter": "D",
        "text": "Acceleration is always zero."
      }
    ],
    "answerLetter": "A",
    "explanation": "Velocity is a vector, so a change in direction is a change in velocity.",
    "id": 259
  },
  {
    "qNum": 10,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "Centripetal acceleration is directed:",
    "options": [
      {
        "letter": "A",
        "text": "Tangentially to the circle."
      },
      {
        "letter": "B",
        "text": "Away from the centre."
      },
      {
        "letter": "C",
        "text": "Toward the centre."
      },
      {
        "letter": "D",
        "text": "Vertically upward in all cases."
      }
    ],
    "answerLetter": "C",
    "explanation": "Centripetal acceleration points radially inward.",
    "id": 260
  },
  {
    "qNum": 11,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "The period of a body moving uniformly in a circle is:",
    "options": [
      {
        "letter": "A",
        "text": "Time for one complete revolution."
      },
      {
        "letter": "B",
        "text": "Number of revolutions per second."
      },
      {
        "letter": "C",
        "text": "Distance travelled in one second."
      },
      {
        "letter": "D",
        "text": "Radius divided by mass."
      }
    ],
    "answerLetter": "A",
    "explanation": "Period T is the time required for one full cycle.",
    "id": 261
  },
  {
    "qNum": 12,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "Frequency and period are related by:",
    "options": [
      {
        "letter": "A",
        "text": "f=T."
      },
      {
        "letter": "B",
        "text": "f=1/T."
      },
      {
        "letter": "C",
        "text": "f=T²."
      },
      {
        "letter": "D",
        "text": "f=2T."
      }
    ],
    "answerLetter": "B",
    "explanation": "Frequency is the number of cycles per second, the reciprocal of period.",
    "id": 262
  },
  {
    "qNum": 13,
    "subject": "Physics",
    "chapter": "Kinematics",
    "topic": "",
    "passage": "",
    "question": "In simple harmonic motion, acceleration is:",
    "options": [
      {
        "letter": "A",
        "text": "Proportional to displacement and directed toward equilibrium."
      },
      {
        "letter": "B",
        "text": "Constant and directed away from equilibrium."
      },
      {
        "letter": "C",
        "text": "Always zero."
      },
      {
        "letter": "D",
        "text": "Independent of displacement."
      }
    ],
    "answerLetter": "A",
    "explanation": "SHM obeys a = −ω²x.",
    "id": 263
  },
  {
    "qNum": 14,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Newton’s first law is also called the law of:",
    "options": [
      {
        "letter": "A",
        "text": "Gravitation."
      },
      {
        "letter": "B",
        "text": "Inertia."
      },
      {
        "letter": "C",
        "text": "Action and reaction."
      },
      {
        "letter": "D",
        "text": "Conservation of charge."
      }
    ],
    "answerLetter": "B",
    "explanation": "It describes the tendency of an object to maintain its state of motion unless acted on by a net force.",
    "id": 264
  },
  {
    "qNum": 15,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "A net force of 12 N acts on a 3 kg object. Its acceleration is:",
    "options": [
      {
        "letter": "A",
        "text": "2 m/s²."
      },
      {
        "letter": "B",
        "text": "3 m/s²."
      },
      {
        "letter": "C",
        "text": "4 m/s²."
      },
      {
        "letter": "D",
        "text": "36 m/s²."
      }
    ],
    "answerLetter": "C",
    "explanation": "From F=ma, a=12/3=4 m/s².",
    "id": 265
  },
  {
    "qNum": 16,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "The weight of an object of mass m near Earth is approximately:",
    "options": [
      {
        "letter": "A",
        "text": "m/g."
      },
      {
        "letter": "B",
        "text": "mg."
      },
      {
        "letter": "C",
        "text": "g/m."
      },
      {
        "letter": "D",
        "text": "m+g."
      }
    ],
    "answerLetter": "B",
    "explanation": "Weight is the gravitational force mg.",
    "id": 266
  },
  {
    "qNum": 17,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Newton’s third law states that forces between interacting bodies are:",
    "options": [
      {
        "letter": "A",
        "text": "Equal in magnitude and opposite in direction, acting on different bodies."
      },
      {
        "letter": "B",
        "text": "Equal and in the same direction on one body."
      },
      {
        "letter": "C",
        "text": "Present only when bodies are moving."
      },
      {
        "letter": "D",
        "text": "Always unequal."
      }
    ],
    "answerLetter": "A",
    "explanation": "Action and reaction form an equal-and-opposite pair on different objects.",
    "id": 267
  },
  {
    "qNum": 18,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Momentum is defined as:",
    "options": [
      {
        "letter": "A",
        "text": "Mass × velocity."
      },
      {
        "letter": "B",
        "text": "Mass × acceleration."
      },
      {
        "letter": "C",
        "text": "Force × distance."
      },
      {
        "letter": "D",
        "text": "Power × time."
      }
    ],
    "answerLetter": "A",
    "explanation": "Linear momentum p = mv.",
    "id": 268
  },
  {
    "qNum": 19,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Impulse equals the change in:",
    "options": [
      {
        "letter": "A",
        "text": "Kinetic energy."
      },
      {
        "letter": "B",
        "text": "Momentum."
      },
      {
        "letter": "C",
        "text": "Mass."
      },
      {
        "letter": "D",
        "text": "Temperature."
      }
    ],
    "answerLetter": "B",
    "explanation": "Impulse is the integral of force over time and equals Δp.",
    "id": 269
  },
  {
    "qNum": 20,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "In an isolated system with no net external force, total momentum is:",
    "options": [
      {
        "letter": "A",
        "text": "Conserved."
      },
      {
        "letter": "B",
        "text": "Always zero."
      },
      {
        "letter": "C",
        "text": "Doubled each second."
      },
      {
        "letter": "D",
        "text": "Equal to kinetic energy."
      }
    ],
    "answerLetter": "A",
    "explanation": "The total momentum of an isolated system remains constant.",
    "id": 270
  },
  {
    "qNum": 21,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Work done by a constant force parallel to displacement is:",
    "options": [
      {
        "letter": "A",
        "text": "W=Fd."
      },
      {
        "letter": "B",
        "text": "W=F/d."
      },
      {
        "letter": "C",
        "text": "W=md."
      },
      {
        "letter": "D",
        "text": "W=F+t."
      }
    ],
    "answerLetter": "A",
    "explanation": "Work is force multiplied by displacement in the force direction.",
    "id": 271
  },
  {
    "qNum": 22,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "The kinetic energy of a body of mass m and speed v is:",
    "options": [
      {
        "letter": "A",
        "text": "mv."
      },
      {
        "letter": "B",
        "text": "½mv²."
      },
      {
        "letter": "C",
        "text": "mgh."
      },
      {
        "letter": "D",
        "text": "Fv."
      }
    ],
    "answerLetter": "B",
    "explanation": "Translational kinetic energy is one-half mass times speed squared.",
    "id": 272
  },
  {
    "qNum": 23,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Near Earth’s surface, gravitational potential energy relative to a chosen zero level is:",
    "options": [
      {
        "letter": "A",
        "text": "mgh."
      },
      {
        "letter": "B",
        "text": "½mv²."
      },
      {
        "letter": "C",
        "text": "ma."
      },
      {
        "letter": "D",
        "text": "F/t."
      }
    ],
    "answerLetter": "A",
    "explanation": "The change in gravitational potential energy near Earth is mg times height change.",
    "id": 273
  },
  {
    "qNum": 24,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "If only conservative forces act on a system, its total mechanical energy is:",
    "options": [
      {
        "letter": "A",
        "text": "Conserved."
      },
      {
        "letter": "B",
        "text": "Always converted entirely to heat."
      },
      {
        "letter": "C",
        "text": "Always increasing."
      },
      {
        "letter": "D",
        "text": "Always zero."
      }
    ],
    "answerLetter": "A",
    "explanation": "Kinetic plus potential energy remains constant in the absence of non-conservative work.",
    "id": 274
  },
  {
    "qNum": 25,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "Power is the rate of doing:",
    "options": [
      {
        "letter": "A",
        "text": "Work."
      },
      {
        "letter": "B",
        "text": "Momentum."
      },
      {
        "letter": "C",
        "text": "Mass."
      },
      {
        "letter": "D",
        "text": "Displacement only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Power is work done per unit time.",
    "id": 275
  },
  {
    "qNum": 26,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "The SI unit of power is:",
    "options": [
      {
        "letter": "A",
        "text": "Joule."
      },
      {
        "letter": "B",
        "text": "Newton."
      },
      {
        "letter": "C",
        "text": "Watt."
      },
      {
        "letter": "D",
        "text": "Coulomb."
      }
    ],
    "answerLetter": "C",
    "explanation": "One watt equals one joule per second.",
    "id": 276
  },
  {
    "qNum": 27,
    "subject": "Physics",
    "chapter": "Dynamics, momentum, work, energy and power",
    "topic": "",
    "passage": "",
    "question": "The frictional force on a sliding object generally acts:",
    "options": [
      {
        "letter": "A",
        "text": "In the direction of relative sliding."
      },
      {
        "letter": "B",
        "text": "Opposite the relative sliding direction."
      },
      {
        "letter": "C",
        "text": "Perpendicular to the contact surface only."
      },
      {
        "letter": "D",
        "text": "Toward the centre of Earth in every situation."
      }
    ],
    "answerLetter": "B",
    "explanation": "Kinetic friction opposes relative motion between surfaces.",
    "id": 277
  },
  {
    "qNum": 28,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "Density is defined as:",
    "options": [
      {
        "letter": "A",
        "text": "Mass divided by volume."
      },
      {
        "letter": "B",
        "text": "Volume divided by mass."
      },
      {
        "letter": "C",
        "text": "Force divided by area."
      },
      {
        "letter": "D",
        "text": "Mass multiplied by acceleration."
      }
    ],
    "answerLetter": "A",
    "explanation": "Density ρ = m/V.",
    "id": 278
  },
  {
    "qNum": 29,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "Pressure is:",
    "options": [
      {
        "letter": "A",
        "text": "Force per unit area."
      },
      {
        "letter": "B",
        "text": "Area per unit force."
      },
      {
        "letter": "C",
        "text": "Mass per unit volume."
      },
      {
        "letter": "D",
        "text": "Work per unit time."
      }
    ],
    "answerLetter": "A",
    "explanation": "Pressure p = F/A for a force normal to a surface.",
    "id": 279
  },
  {
    "qNum": 30,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "In a static fluid, pressure generally increases with:",
    "options": [
      {
        "letter": "A",
        "text": "Height above the surface."
      },
      {
        "letter": "B",
        "text": "Depth below the surface."
      },
      {
        "letter": "C",
        "text": "Decreasing density only."
      },
      {
        "letter": "D",
        "text": "Decreasing gravitational acceleration only."
      }
    ],
    "answerLetter": "B",
    "explanation": "Hydrostatic pressure increases with depth: p = p₀ + ρgh.",
    "id": 280
  },
  {
    "qNum": 31,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "Pascal’s principle states that a pressure change applied to an enclosed fluid is:",
    "options": [
      {
        "letter": "A",
        "text": "Transmitted undiminished throughout the fluid."
      },
      {
        "letter": "B",
        "text": "Lost immediately."
      },
      {
        "letter": "C",
        "text": "Transmitted only upward."
      },
      {
        "letter": "D",
        "text": "Converted entirely into heat."
      }
    ],
    "answerLetter": "A",
    "explanation": "An externally applied pressure change is transmitted throughout an enclosed fluid.",
    "id": 281
  },
  {
    "qNum": 32,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "The buoyant force on an immersed body equals the weight of:",
    "options": [
      {
        "letter": "A",
        "text": "The body’s material."
      },
      {
        "letter": "B",
        "text": "The displaced fluid."
      },
      {
        "letter": "C",
        "text": "The container."
      },
      {
        "letter": "D",
        "text": "The air above the fluid only."
      }
    ],
    "answerLetter": "B",
    "explanation": "This is Archimedes’ principle.",
    "id": 282
  },
  {
    "qNum": 33,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "For steady incompressible flow in a pipe, the continuity relation is:",
    "options": [
      {
        "letter": "A",
        "text": "A₁v₁=A₂v₂."
      },
      {
        "letter": "B",
        "text": "A₁/v₁=A₂/v₂."
      },
      {
        "letter": "C",
        "text": "A₁+A₂=0."
      },
      {
        "letter": "D",
        "text": "v₁=v₂ in every pipe."
      }
    ],
    "answerLetter": "A",
    "explanation": "Volume flow rate is constant for incompressible steady flow.",
    "id": 283
  },
  {
    "qNum": 34,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "The Bernoulli equation for ideal steady flow expresses conservation of:",
    "options": [
      {
        "letter": "A",
        "text": "Mechanical energy per unit volume along a streamline."
      },
      {
        "letter": "B",
        "text": "Electric charge only."
      },
      {
        "letter": "C",
        "text": "Mass of each molecule."
      },
      {
        "letter": "D",
        "text": "Temperature only."
      }
    ],
    "answerLetter": "A",
    "explanation": "It relates pressure, kinetic and gravitational potential energy terms.",
    "id": 284
  },
  {
    "qNum": 35,
    "subject": "Physics",
    "chapter": "Fluid mechanics",
    "topic": "",
    "passage": "",
    "question": "Viscosity is a measure of a fluid’s resistance to:",
    "options": [
      {
        "letter": "A",
        "text": "Flow or deformation."
      },
      {
        "letter": "B",
        "text": "Electrical charge."
      },
      {
        "letter": "C",
        "text": "Heating only."
      },
      {
        "letter": "D",
        "text": "Gravitational attraction."
      }
    ],
    "answerLetter": "A",
    "explanation": "Viscosity describes internal resistance to fluid motion.",
    "id": 285
  },
  {
    "qNum": 36,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "Temperature is related to the average:",
    "options": [
      {
        "letter": "A",
        "text": "Random kinetic energy of microscopic particles."
      },
      {
        "letter": "B",
        "text": "Gravitational potential energy of the whole object only."
      },
      {
        "letter": "C",
        "text": "Number of atoms only."
      },
      {
        "letter": "D",
        "text": "Total mass."
      }
    ],
    "answerLetter": "A",
    "explanation": "Temperature is associated with average microscopic thermal motion.",
    "id": 286
  },
  {
    "qNum": 37,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "Heat is energy transferred because of a difference in:",
    "options": [
      {
        "letter": "A",
        "text": "Temperature."
      },
      {
        "letter": "B",
        "text": "Mass."
      },
      {
        "letter": "C",
        "text": "Volume only."
      },
      {
        "letter": "D",
        "text": "Electric charge only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Heat flows spontaneously from higher to lower temperature.",
    "id": 287
  },
  {
    "qNum": 38,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "The amount of heat required to raise a mass m by temperature change ΔT is:",
    "options": [
      {
        "letter": "A",
        "text": "Q=mcΔT."
      },
      {
        "letter": "B",
        "text": "Q=m/ cΔT."
      },
      {
        "letter": "C",
        "text": "Q=c/(mΔT)."
      },
      {
        "letter": "D",
        "text": "Q=mv."
      }
    ],
    "answerLetter": "A",
    "explanation": "This is the calorimetry equation using specific heat capacity c.",
    "id": 288
  },
  {
    "qNum": 39,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "During melting of a pure substance at constant pressure, its temperature generally:",
    "options": [
      {
        "letter": "A",
        "text": "Remains constant while latent heat is absorbed."
      },
      {
        "letter": "B",
        "text": "Increases continuously throughout melting."
      },
      {
        "letter": "C",
        "text": "Falls to absolute zero."
      },
      {
        "letter": "D",
        "text": "Becomes infinite."
      }
    ],
    "answerLetter": "A",
    "explanation": "Energy changes the phase rather than raising temperature during the transition.",
    "id": 289
  },
  {
    "qNum": 40,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "The first law of thermodynamics expresses conservation of:",
    "options": [
      {
        "letter": "A",
        "text": "Energy."
      },
      {
        "letter": "B",
        "text": "Electric field."
      },
      {
        "letter": "C",
        "text": "Mass number."
      },
      {
        "letter": "D",
        "text": "Momentum in every open system."
      }
    ],
    "answerLetter": "A",
    "explanation": "It relates internal-energy change to heat transfer and work.",
    "id": 290
  },
  {
    "qNum": 41,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "The second law of thermodynamics implies that for an isolated system, total entropy:",
    "options": [
      {
        "letter": "A",
        "text": "Never decreases."
      },
      {
        "letter": "B",
        "text": "Always decreases."
      },
      {
        "letter": "C",
        "text": "Is always zero."
      },
      {
        "letter": "D",
        "text": "Is unrelated to spontaneous processes."
      }
    ],
    "answerLetter": "A",
    "explanation": "Entropy of an isolated system remains constant in an ideal reversible process and increases in an irreversible one.",
    "id": 291
  },
  {
    "qNum": 42,
    "subject": "Physics",
    "chapter": "Thermodynamics",
    "topic": "",
    "passage": "",
    "question": "At constant pressure, the volume of a fixed amount of ideal gas is proportional to absolute temperature. This is:",
    "options": [
      {
        "letter": "A",
        "text": "Boyle’s law."
      },
      {
        "letter": "B",
        "text": "Charles’s law."
      },
      {
        "letter": "C",
        "text": "Coulomb’s law."
      },
      {
        "letter": "D",
        "text": "Ohm’s law."
      }
    ],
    "answerLetter": "B",
    "explanation": "Charles’s law gives V/T = constant at fixed pressure and amount.",
    "id": 292
  },
  {
    "qNum": 43,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Like electric charges:",
    "options": [
      {
        "letter": "A",
        "text": "Attract."
      },
      {
        "letter": "B",
        "text": "Repel."
      },
      {
        "letter": "C",
        "text": "Have no interaction."
      },
      {
        "letter": "D",
        "text": "Become neutral automatically."
      }
    ],
    "answerLetter": "B",
    "explanation": "Like charges repel, while unlike charges attract.",
    "id": 293
  },
  {
    "qNum": 44,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Coulomb’s law gives the magnitude of the electrostatic force between point charges as proportional to:",
    "options": [
      {
        "letter": "A",
        "text": "q₁q₂/r²."
      },
      {
        "letter": "B",
        "text": "q₁q₂r²."
      },
      {
        "letter": "C",
        "text": "r/(q₁q₂)."
      },
      {
        "letter": "D",
        "text": "q₁+q₂ only."
      }
    ],
    "answerLetter": "A",
    "explanation": "Force is proportional to the product of charge magnitudes and inversely proportional to separation squared.",
    "id": 294
  },
  {
    "qNum": 45,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Electric field is defined as:",
    "options": [
      {
        "letter": "A",
        "text": "Force per unit positive test charge."
      },
      {
        "letter": "B",
        "text": "Charge per unit mass."
      },
      {
        "letter": "C",
        "text": "Energy per unit time."
      },
      {
        "letter": "D",
        "text": "Current per unit resistance."
      }
    ],
    "answerLetter": "A",
    "explanation": "E = F/q for a small positive test charge.",
    "id": 295
  },
  {
    "qNum": 46,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "The SI unit of electric charge is:",
    "options": [
      {
        "letter": "A",
        "text": "Ampere."
      },
      {
        "letter": "B",
        "text": "Volt."
      },
      {
        "letter": "C",
        "text": "Coulomb."
      },
      {
        "letter": "D",
        "text": "Ohm."
      }
    ],
    "answerLetter": "C",
    "explanation": "Electric charge is measured in coulombs.",
    "id": 296
  },
  {
    "qNum": 47,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Ohm’s law for an ohmic conductor at constant physical conditions is:",
    "options": [
      {
        "letter": "A",
        "text": "V=IR."
      },
      {
        "letter": "B",
        "text": "P=IV²."
      },
      {
        "letter": "C",
        "text": "Q=mcΔT."
      },
      {
        "letter": "D",
        "text": "F=ma."
      }
    ],
    "answerLetter": "A",
    "explanation": "Potential difference equals current multiplied by resistance.",
    "id": 297
  },
  {
    "qNum": 48,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Two resistors of 2 Ω and 3 Ω connected in series have equivalent resistance:",
    "options": [
      {
        "letter": "A",
        "text": "1.2 Ω."
      },
      {
        "letter": "B",
        "text": "2.5 Ω."
      },
      {
        "letter": "C",
        "text": "5 Ω."
      },
      {
        "letter": "D",
        "text": "6 Ω."
      }
    ],
    "answerLetter": "C",
    "explanation": "Series resistances add: 2 + 3 = 5 Ω.",
    "id": 298
  },
  {
    "qNum": 49,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Two resistors of 6 Ω each connected in parallel have equivalent resistance:",
    "options": [
      {
        "letter": "A",
        "text": "3 Ω."
      },
      {
        "letter": "B",
        "text": "6 Ω."
      },
      {
        "letter": "C",
        "text": "12 Ω."
      },
      {
        "letter": "D",
        "text": "36 Ω."
      }
    ],
    "answerLetter": "A",
    "explanation": "For two equal resistors in parallel, equivalent resistance is half of either: 3 Ω.",
    "id": 299
  },
  {
    "qNum": 50,
    "subject": "Physics",
    "chapter": "Electricity and electromagnetism",
    "topic": "",
    "passage": "",
    "question": "Electromagnetic induction occurs when:",
    "options": [
      {
        "letter": "A",
        "text": "Magnetic flux through a circuit changes."
      },
      {
        "letter": "B",
        "text": "A resistor is painted."
      },
      {
        "letter": "C",
        "text": "A stationary charge is placed in a uniform field."
      },
      {
        "letter": "D",
        "text": "A wire is cooled without a magnetic field."
      }
    ],
    "answerLetter": "A",
    "explanation": "A changing magnetic flux induces an electromotive force, according to Faraday’s law.",
    "id": 300
  },
  {
    "qNum": 1,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Researchers studying sleep and memory asked two groups of students to learn the same list of words. One group slept for eight hours, while the other remained awake for most of the night. The next morning, the first group remembered more words on average. The researchers concluded that adequate sleep may support memory consolidation. They cautioned, however, that the study did not establish whether sleep alone explains differences in academic performance.",
    "question": "What is the central claim of the passage?",
    "options": [
      {
        "letter": "A",
        "text": "Academic performance depends only on sleep."
      },
      {
        "letter": "B",
        "text": "Adequate sleep may help consolidate memories."
      },
      {
        "letter": "C",
        "text": "Students who remain awake learn more words."
      },
      {
        "letter": "D",
        "text": "Memory cannot be measured experimentally."
      }
    ],
    "answerLetter": "B",
    "explanation": "The main finding is that the students who slept remembered more words, supporting a possible role for sleep in memory consolidation.",
    "id": 301
  },
  {
    "qNum": 2,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Researchers studying sleep and memory asked two groups of students to learn the same list of words. One group slept for eight hours, while the other remained awake for most of the night. The next morning, the first group remembered more words on average. The researchers concluded that adequate sleep may support memory consolidation. They cautioned, however, that the study did not establish whether sleep alone explains differences in academic performance.",
    "question": "Which statement is directly supported by the passage?",
    "options": [
      {
        "letter": "A",
        "text": "Both groups studied different word lists."
      },
      {
        "letter": "B",
        "text": "The students who slept remembered more words on average."
      },
      {
        "letter": "C",
        "text": "The researchers measured every student's grades."
      },
      {
        "letter": "D",
        "text": "Sleep guarantees high academic achievement."
      }
    ],
    "answerLetter": "B",
    "explanation": "This is explicitly reported in the passage. The other statements contradict or go beyond the evidence.",
    "id": 302
  },
  {
    "qNum": 3,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Researchers studying sleep and memory asked two groups of students to learn the same list of words. One group slept for eight hours, while the other remained awake for most of the night. The next morning, the first group remembered more words on average. The researchers concluded that adequate sleep may support memory consolidation. They cautioned, however, that the study did not establish whether sleep alone explains differences in academic performance.",
    "question": "Why did the researchers include a caution about academic performance?",
    "options": [
      {
        "letter": "A",
        "text": "To claim that sleep has no effect on memory."
      },
      {
        "letter": "B",
        "text": "To distinguish the measured result from a broader conclusion not tested."
      },
      {
        "letter": "C",
        "text": "To show that the students did not follow instructions."
      },
      {
        "letter": "D",
        "text": "To prove that grades are unrelated to learning."
      }
    ],
    "answerLetter": "B",
    "explanation": "The experiment examined word recall, not the many factors that influence academic performance.",
    "id": 303
  },
  {
    "qNum": 4,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Researchers studying sleep and memory asked two groups of students to learn the same list of words. One group slept for eight hours, while the other remained awake for most of the night. The next morning, the first group remembered more words on average. The researchers concluded that adequate sleep may support memory consolidation. They cautioned, however, that the study did not establish whether sleep alone explains differences in academic performance.",
    "question": "In the passage, “memory consolidation” most nearly refers to:",
    "options": [
      {
        "letter": "A",
        "text": "The process of stabilising newly formed memories."
      },
      {
        "letter": "B",
        "text": "The removal of all old memories."
      },
      {
        "letter": "C",
        "text": "The ability to read more quickly."
      },
      {
        "letter": "D",
        "text": "The transfer of information from one person to another."
      }
    ],
    "answerLetter": "A",
    "explanation": "Memory consolidation is the process through which newly acquired information becomes more stable.",
    "id": 304
  },
  {
    "qNum": 5,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Antibiotics are effective against susceptible bacteria, but they do not treat viral infections such as the common cold. When antibiotics are used unnecessarily, bacteria that can survive exposure may become more common. This process contributes to antimicrobial resistance. Public-health specialists therefore recommend using antibiotics only when clinically appropriate and following a qualified professional's instructions.",
    "question": "What is the thesis of the passage?",
    "options": [
      {
        "letter": "A",
        "text": "All infections should be treated with antibiotics."
      },
      {
        "letter": "B",
        "text": "Antibiotics are ineffective against every microorganism."
      },
      {
        "letter": "C",
        "text": "Responsible antibiotic use helps limit antimicrobial resistance."
      },
      {
        "letter": "D",
        "text": "Viral infections always develop into bacterial infections."
      }
    ],
    "answerLetter": "C",
    "explanation": "The passage explains why unnecessary antibiotic use contributes to resistance and recommends appropriate use.",
    "id": 305
  },
  {
    "qNum": 6,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Antibiotics are effective against susceptible bacteria, but they do not treat viral infections such as the common cold. When antibiotics are used unnecessarily, bacteria that can survive exposure may become more common. This process contributes to antimicrobial resistance. Public-health specialists therefore recommend using antibiotics only when clinically appropriate and following a qualified professional's instructions.",
    "question": "Which inference is most reasonable?",
    "options": [
      {
        "letter": "A",
        "text": "Taking antibiotics for a cold is always beneficial."
      },
      {
        "letter": "B",
        "text": "Antibiotics should be selected without medical advice."
      },
      {
        "letter": "C",
        "text": "Misuse of antibiotics can reduce their future effectiveness."
      },
      {
        "letter": "D",
        "text": "Bacteria cannot adapt to environmental pressures."
      }
    ],
    "answerLetter": "C",
    "explanation": "If resistant bacteria become more common, treatments that once worked may become less effective.",
    "id": 306
  },
  {
    "qNum": 7,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Antibiotics are effective against susceptible bacteria, but they do not treat viral infections such as the common cold. When antibiotics are used unnecessarily, bacteria that can survive exposure may become more common. This process contributes to antimicrobial resistance. Public-health specialists therefore recommend using antibiotics only when clinically appropriate and following a qualified professional's instructions.",
    "question": "The word “susceptible” in the passage means:",
    "options": [
      {
        "letter": "A",
        "text": "Resistant to treatment."
      },
      {
        "letter": "B",
        "text": "Capable of being affected by something."
      },
      {
        "letter": "C",
        "text": "Completely harmless."
      },
      {
        "letter": "D",
        "text": "Impossible to detect."
      }
    ],
    "answerLetter": "B",
    "explanation": "Susceptible bacteria are bacteria that can be affected by the antibiotic.",
    "id": 307
  },
  {
    "qNum": 8,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Scientific Text Analysis, Inferences & Thesis Extraction",
    "passage": "Antibiotics are effective against susceptible bacteria, but they do not treat viral infections such as the common cold. When antibiotics are used unnecessarily, bacteria that can survive exposure may become more common. This process contributes to antimicrobial resistance. Public-health specialists therefore recommend using antibiotics only when clinically appropriate and following a qualified professional's instructions.",
    "question": "Which statement is NOT supported by the passage?",
    "options": [
      {
        "letter": "A",
        "text": "Antibiotics can act against susceptible bacteria."
      },
      {
        "letter": "B",
        "text": "Antibiotics do not treat viral infections such as the common cold."
      },
      {
        "letter": "C",
        "text": "Unnecessary use can contribute to antimicrobial resistance."
      },
      {
        "letter": "D",
        "text": "Every bacterial infection requires the same antibiotic."
      }
    ],
    "answerLetter": "D",
    "explanation": "The passage does not say that all bacterial infections require identical treatment.",
    "id": 308
  },
  {
    "qNum": 9,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "Choose the best connector: “The sample size was small; _____, the findings should be interpreted cautiously.”",
    "options": [
      {
        "letter": "A",
        "text": "therefore"
      },
      {
        "letter": "B",
        "text": "nevertheless"
      },
      {
        "letter": "C",
        "text": "for example"
      },
      {
        "letter": "D",
        "text": "similarly"
      }
    ],
    "answerLetter": "A",
    "explanation": "“Therefore” introduces a consequence: a small sample size leads to cautious interpretation.",
    "id": 309
  },
  {
    "qNum": 10,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "Which sentence best completes the paragraph?",
    "options": [
      {
        "letter": "A",
        "text": "The digestive system breaks down food in the stomach."
      },
      {
        "letter": "B",
        "text": "Capillaries allow the exchange of substances between blood and tissues."
      },
      {
        "letter": "C",
        "text": "Bones provide structural support to the body."
      },
      {
        "letter": "D",
        "text": "Neurons transmit electrical signals."
      }
    ],
    "answerLetter": "B",
    "explanation": "The sentence continues the paragraph's explanation of blood vessels.",
    "id": 310
  },
  {
    "qNum": 11,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "Identify the rhetorical device in: “The laboratory was a beehive of activity.”",
    "options": [
      {
        "letter": "A",
        "text": "Simile"
      },
      {
        "letter": "B",
        "text": "Metaphor"
      },
      {
        "letter": "C",
        "text": "Irony"
      },
      {
        "letter": "D",
        "text": "Alliteration"
      }
    ],
    "answerLetter": "B",
    "explanation": "The laboratory is directly described as a beehive to suggest intense activity; no “like” or “as” is used.",
    "id": 311
  },
  {
    "qNum": 12,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "Which option creates the clearest logical sequence?",
    "options": [
      {
        "letter": "A",
        "text": "3–1–4–2"
      },
      {
        "letter": "B",
        "text": "1–2–3–4"
      },
      {
        "letter": "C",
        "text": "2–4–1–3"
      },
      {
        "letter": "D",
        "text": "4–3–2–1"
      }
    ],
    "answerLetter": "B",
    "explanation": "Collection must precede labelling, analysis and recording of results.",
    "id": 312
  },
  {
    "qNum": 13,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "Choose the best transition: “The treatment reduced fever in most participants. _____, it did not significantly change the duration of the illness.”",
    "options": [
      {
        "letter": "A",
        "text": "Furthermore"
      },
      {
        "letter": "B",
        "text": "In contrast"
      },
      {
        "letter": "C",
        "text": "For instance"
      },
      {
        "letter": "D",
        "text": "Consequently"
      }
    ],
    "answerLetter": "B",
    "explanation": "“In contrast” signals a difference between the improvement in fever and the lack of change in illness duration.",
    "id": 313
  },
  {
    "qNum": 14,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "Which sentence contains an unclear pronoun reference?",
    "options": [
      {
        "letter": "A",
        "text": "The nurse checked the patient's temperature."
      },
      {
        "letter": "B",
        "text": "After the doctor spoke to the nurse, she updated the chart."
      },
      {
        "letter": "C",
        "text": "The laboratory reported the result on Monday."
      },
      {
        "letter": "D",
        "text": "The students reviewed the chapter together."
      }
    ],
    "answerLetter": "B",
    "explanation": "“She” could refer to either the doctor or the nurse, so the reference is ambiguous.",
    "id": 314
  },
  {
    "qNum": 15,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Textual Cohesion, Coherence & Rhetorical Devices",
    "passage": "",
    "question": "What is the primary purpose of a rhetorical question in a scientific article?",
    "options": [
      {
        "letter": "A",
        "text": "Always to request a numerical answer."
      },
      {
        "letter": "B",
        "text": "To engage readers or emphasise an issue."
      },
      {
        "letter": "C",
        "text": "To replace all supporting evidence."
      },
      {
        "letter": "D",
        "text": "To introduce an unrelated topic."
      }
    ],
    "answerLetter": "B",
    "explanation": "A rhetorical question is generally used for emphasis or engagement rather than to obtain a literal answer.",
    "id": 315
  },
  {
    "qNum": 16,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Contextual Vocabulary in Medical & Biological Passages",
    "passage": "",
    "question": "In a medical passage, “benign” most commonly means:",
    "options": [
      {
        "letter": "A",
        "text": "Non-cancerous or not harmful in the relevant context."
      },
      {
        "letter": "B",
        "text": "Rapidly spreading throughout the body."
      },
      {
        "letter": "C",
        "text": "Caused by a virus."
      },
      {
        "letter": "D",
        "text": "Impossible to diagnose."
      }
    ],
    "answerLetter": "A",
    "explanation": "“Benign” commonly describes a non-cancerous tumour or a condition that is not harmful in the specified sense.",
    "id": 316
  },
  {
    "qNum": 17,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Contextual Vocabulary in Medical & Biological Passages",
    "passage": "",
    "question": "If a study describes a result as “preliminary,” the result is:",
    "options": [
      {
        "letter": "A",
        "text": "Final and universally accepted."
      },
      {
        "letter": "B",
        "text": "Early and requiring further investigation."
      },
      {
        "letter": "C",
        "text": "Known to be false."
      },
      {
        "letter": "D",
        "text": "Unrelated to the research question."
      }
    ],
    "answerLetter": "B",
    "explanation": "Preliminary findings are initial results that may need confirmation.",
    "id": 317
  },
  {
    "qNum": 18,
    "subject": "English",
    "chapter": "Medical & Scientific Reading Comprehension (18 Questions)",
    "topic": "Contextual Vocabulary in Medical & Biological Passages",
    "passage": "",
    "question": "In the sentence “The drug alleviated the symptoms,” “alleviated” means:",
    "options": [
      {
        "letter": "A",
        "text": "Worsened"
      },
      {
        "letter": "B",
        "text": "Reduced or eased"
      },
      {
        "letter": "C",
        "text": "Concealed permanently"
      },
      {
        "letter": "D",
        "text": "Caused"
      }
    ],
    "answerLetter": "B",
    "explanation": "To alleviate symptoms is to make them less severe.",
    "id": 318
  },
  {
    "qNum": 19,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The prefix “brady-” indicates:",
    "options": [
      {
        "letter": "A",
        "text": "Fast"
      },
      {
        "letter": "B",
        "text": "Slow"
      },
      {
        "letter": "C",
        "text": "Above"
      },
      {
        "letter": "D",
        "text": "Around"
      }
    ],
    "answerLetter": "B",
    "explanation": "“Brady-” means slow, as in bradycardia (a slower-than-normal heart rate).",
    "id": 319
  },
  {
    "qNum": 20,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The prefix “tachy-” means:",
    "options": [
      {
        "letter": "A",
        "text": "Rapid"
      },
      {
        "letter": "B",
        "text": "Painful"
      },
      {
        "letter": "C",
        "text": "Small"
      },
      {
        "letter": "D",
        "text": "Below"
      }
    ],
    "answerLetter": "A",
    "explanation": "“Tachy-” means fast or rapid, as in tachycardia.",
    "id": 320
  },
  {
    "qNum": 21,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The suffix “-itis” indicates:",
    "options": [
      {
        "letter": "A",
        "text": "Surgical removal"
      },
      {
        "letter": "B",
        "text": "Inflammation"
      },
      {
        "letter": "C",
        "text": "Blood condition"
      },
      {
        "letter": "D",
        "text": "Visual examination"
      }
    ],
    "answerLetter": "B",
    "explanation": "“-itis” is used in terms such as arthritis, meaning inflammation of a joint.",
    "id": 321
  },
  {
    "qNum": 22,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The root “nephr-” refers to the:",
    "options": [
      {
        "letter": "A",
        "text": "Liver"
      },
      {
        "letter": "B",
        "text": "Kidney"
      },
      {
        "letter": "C",
        "text": "Lung"
      },
      {
        "letter": "D",
        "text": "Brain"
      }
    ],
    "answerLetter": "B",
    "explanation": "“Nephr-” is the Greek-derived root for kidney.",
    "id": 322
  },
  {
    "qNum": 23,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The prefix “hypo-” generally means:",
    "options": [
      {
        "letter": "A",
        "text": "Excessive or above normal"
      },
      {
        "letter": "B",
        "text": "Below normal or deficient"
      },
      {
        "letter": "C",
        "text": "Between"
      },
      {
        "letter": "D",
        "text": "Equal"
      }
    ],
    "answerLetter": "B",
    "explanation": "“Hypo-” indicates a low, reduced or below-normal state.",
    "id": 323
  },
  {
    "qNum": 24,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The term “endoscopy” refers to:",
    "options": [
      {
        "letter": "A",
        "text": "Visual examination inside the body using an instrument."
      },
      {
        "letter": "B",
        "text": "Measurement of blood pressure."
      },
      {
        "letter": "C",
        "text": "Recording of brain electrical activity."
      },
      {
        "letter": "D",
        "text": "Surgical removal of a kidney."
      }
    ],
    "answerLetter": "A",
    "explanation": "“Endo-” means within, and “-scopy” refers to visual examination.",
    "id": 324
  },
  {
    "qNum": 25,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "What does the suffix “-ectomy” mean?",
    "options": [
      {
        "letter": "A",
        "text": "Inflammation"
      },
      {
        "letter": "B",
        "text": "Surgical removal"
      },
      {
        "letter": "C",
        "text": "Study of"
      },
      {
        "letter": "D",
        "text": "Pain"
      }
    ],
    "answerLetter": "B",
    "explanation": "“-ectomy” indicates surgical removal, as in appendectomy.",
    "id": 325
  },
  {
    "qNum": 26,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "The root “hepat-” refers to the:",
    "options": [
      {
        "letter": "A",
        "text": "Heart"
      },
      {
        "letter": "B",
        "text": "Liver"
      },
      {
        "letter": "C",
        "text": "Bone"
      },
      {
        "letter": "D",
        "text": "Skin"
      }
    ],
    "answerLetter": "B",
    "explanation": "“Hepat-” is the medical root for liver.",
    "id": 326
  },
  {
    "qNum": 27,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Greco-Latin Roots, Prefixes & Suffixes in Medicine",
    "passage": "",
    "question": "What does “bilateral” mean?",
    "options": [
      {
        "letter": "A",
        "text": "Affecting one side only."
      },
      {
        "letter": "B",
        "text": "Affecting both sides."
      },
      {
        "letter": "C",
        "text": "Located inside a bone."
      },
      {
        "letter": "D",
        "text": "Occurring after birth."
      }
    ],
    "answerLetter": "B",
    "explanation": "“Bi-” means two, and “lateral” refers to sides.",
    "id": 327
  },
  {
    "qNum": 28,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Academic Collocations, Phrasal Verbs & Scientific Idioms",
    "passage": "",
    "question": "Choose the correct collocation: “The research team _____ an experiment to test the hypothesis.”",
    "options": [
      {
        "letter": "A",
        "text": "made"
      },
      {
        "letter": "B",
        "text": "conducted"
      },
      {
        "letter": "C",
        "text": "did up"
      },
      {
        "letter": "D",
        "text": "built out"
      }
    ],
    "answerLetter": "B",
    "explanation": "“Conduct an experiment” is the standard academic collocation.",
    "id": 328
  },
  {
    "qNum": 29,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Academic Collocations, Phrasal Verbs & Scientific Idioms",
    "passage": "",
    "question": "Choose the best phrase: “The results are _____ with the hypothesis.”",
    "options": [
      {
        "letter": "A",
        "text": "consistent"
      },
      {
        "letter": "B",
        "text": "dependent"
      },
      {
        "letter": "C",
        "text": "crowded"
      },
      {
        "letter": "D",
        "text": "responsible"
      }
    ],
    "answerLetter": "A",
    "explanation": "“Consistent with” means in agreement with or compatible with.",
    "id": 329
  },
  {
    "qNum": 30,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Academic Collocations, Phrasal Verbs & Scientific Idioms",
    "passage": "",
    "question": "What does “carry out” mean in “The scientists carried out a clinical trial”?",
    "options": [
      {
        "letter": "A",
        "text": "Cancel"
      },
      {
        "letter": "B",
        "text": "Conduct or perform"
      },
      {
        "letter": "C",
        "text": "Publish immediately"
      },
      {
        "letter": "D",
        "text": "Explain verbally"
      }
    ],
    "answerLetter": "B",
    "explanation": "“Carry out” means to perform or conduct an activity.",
    "id": 330
  },
  {
    "qNum": 31,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Academic Collocations, Phrasal Verbs & Scientific Idioms",
    "passage": "",
    "question": "Choose the correct collocation: “The findings _____ light on the mechanism of infection.”",
    "options": [
      {
        "letter": "A",
        "text": "shed"
      },
      {
        "letter": "B",
        "text": "threw"
      },
      {
        "letter": "C",
        "text": "placed"
      },
      {
        "letter": "D",
        "text": "putted"
      }
    ],
    "answerLetter": "A",
    "explanation": "“Shed light on” means to clarify or help explain something.",
    "id": 331
  },
  {
    "qNum": 32,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Academic Collocations, Phrasal Verbs & Scientific Idioms",
    "passage": "",
    "question": "“Rule out a diagnosis” means to:",
    "options": [
      {
        "letter": "A",
        "text": "Confirm it beyond doubt."
      },
      {
        "letter": "B",
        "text": "Consider it the only possibility."
      },
      {
        "letter": "C",
        "text": "Determine that it is unlikely or not responsible."
      },
      {
        "letter": "D",
        "text": "Delay all investigations."
      }
    ],
    "answerLetter": "C",
    "explanation": "To rule out a diagnosis is to exclude it as an explanation based on available evidence.",
    "id": 332
  },
  {
    "qNum": 33,
    "subject": "English",
    "chapter": "Medical Terminology, Etymology & Advanced Lexicon (15 Questions)",
    "topic": "Academic Collocations, Phrasal Verbs & Scientific Idioms",
    "passage": "",
    "question": "Choose the best academic collocation: “The authors _____ a conclusion from the collected data.”",
    "options": [
      {
        "letter": "A",
        "text": "drew"
      },
      {
        "letter": "B",
        "text": "pulled"
      },
      {
        "letter": "C",
        "text": "lifted"
      },
      {
        "letter": "D",
        "text": "caught"
      }
    ],
    "answerLetter": "A",
    "explanation": "“Draw a conclusion” is the standard expression.",
    "id": 333
  },
  {
    "qNum": 34,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals",
    "passage": "",
    "question": "Choose the grammatically correct sentence.",
    "options": [
      {
        "letter": "A",
        "text": "The list of symptoms are long."
      },
      {
        "letter": "B",
        "text": "The list of symptoms is long."
      },
      {
        "letter": "C",
        "text": "The list of symptoms were long."
      },
      {
        "letter": "D",
        "text": "The list of symptoms have long."
      }
    ],
    "answerLetter": "B",
    "explanation": "The subject is “list,” which is singular; “of symptoms” does not change the subject.",
    "id": 334
  },
  {
    "qNum": 35,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals",
    "passage": "",
    "question": "Choose the correct verb: “Neither the doctor nor the nurses _____ available.”",
    "options": [
      {
        "letter": "A",
        "text": "is"
      },
      {
        "letter": "B",
        "text": "was"
      },
      {
        "letter": "C",
        "text": "are"
      },
      {
        "letter": "D",
        "text": "has"
      }
    ],
    "answerLetter": "C",
    "explanation": "With “neither…nor,” the verb generally agrees with the nearer subject; “nurses” is plural.",
    "id": 335
  },
  {
    "qNum": 36,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals",
    "passage": "",
    "question": "Complete the sentence: “By the time the ambulance arrived, the patient _____ consciousness.”",
    "options": [
      {
        "letter": "A",
        "text": "loses"
      },
      {
        "letter": "B",
        "text": "had lost"
      },
      {
        "letter": "C",
        "text": "has lose"
      },
      {
        "letter": "D",
        "text": "will lose"
      }
    ],
    "answerLetter": "B",
    "explanation": "The past perfect describes an event completed before another past event.",
    "id": 336
  },
  {
    "qNum": 37,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals",
    "passage": "",
    "question": "Choose the correct conditional: “If water reaches 100°C at standard atmospheric pressure, it _____.”",
    "options": [
      {
        "letter": "A",
        "text": "boiled"
      },
      {
        "letter": "B",
        "text": "will boiled"
      },
      {
        "letter": "C",
        "text": "boils"
      },
      {
        "letter": "D",
        "text": "would boiling"
      }
    ],
    "answerLetter": "C",
    "explanation": "The zero conditional uses the present simple for general scientific facts.",
    "id": 337
  },
  {
    "qNum": 38,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals",
    "passage": "",
    "question": "Choose the correct sentence.",
    "options": [
      {
        "letter": "A",
        "text": "Each of the samples have been labelled."
      },
      {
        "letter": "B",
        "text": "Each of the samples has been labelled."
      },
      {
        "letter": "C",
        "text": "Each of the samples are labelled."
      },
      {
        "letter": "D",
        "text": "Each of the samples were labelled."
      }
    ],
    "answerLetter": "B",
    "explanation": "“Each” is singular and takes “has.”",
    "id": 338
  },
  {
    "qNum": 39,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Advanced Syntax: Subject-Verb Agreement, Tenses & Conditionals",
    "passage": "",
    "question": "Complete the sentence: “The researchers _____ the data for three months before publishing the report.”",
    "options": [
      {
        "letter": "A",
        "text": "analyse"
      },
      {
        "letter": "B",
        "text": "have analysed"
      },
      {
        "letter": "C",
        "text": "had been analysing"
      },
      {
        "letter": "D",
        "text": "will analyse"
      }
    ],
    "answerLetter": "C",
    "explanation": "The past perfect continuous describes an activity continuing up to a point in the past.",
    "id": 339
  },
  {
    "qNum": 40,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Correction & Error Identification",
    "passage": "",
    "question": "Identify the error: “The results of the experiment was unexpected.”",
    "options": [
      {
        "letter": "A",
        "text": "“The results”"
      },
      {
        "letter": "B",
        "text": "“of the experiment”"
      },
      {
        "letter": "C",
        "text": "“was”"
      },
      {
        "letter": "D",
        "text": "“unexpected”"
      }
    ],
    "answerLetter": "C",
    "explanation": "“Results” is plural, so the correct verb is “were.”",
    "id": 340
  },
  {
    "qNum": 41,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Correction & Error Identification",
    "passage": "",
    "question": "Choose the corrected sentence: “The patient is suffering with a severe headache.”",
    "options": [
      {
        "letter": "A",
        "text": "The patient is suffering from a severe headache."
      },
      {
        "letter": "B",
        "text": "The patient is suffering at a severe headache."
      },
      {
        "letter": "C",
        "text": "The patient suffering by a severe headache."
      },
      {
        "letter": "D",
        "text": "The patient suffer to a severe headache."
      }
    ],
    "answerLetter": "A",
    "explanation": "The standard expression is “suffer from” a condition or symptom.",
    "id": 341
  },
  {
    "qNum": 42,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Correction & Error Identification",
    "passage": "",
    "question": "Which sentence avoids a dangling modifier?",
    "options": [
      {
        "letter": "A",
        "text": "After examining the scan, the diagnosis was written by the doctor."
      },
      {
        "letter": "B",
        "text": "After examining the scan, the doctor wrote the diagnosis."
      },
      {
        "letter": "C",
        "text": "Examining the scan, the diagnosis appeared clear."
      },
      {
        "letter": "D",
        "text": "After the scan, writing the diagnosis."
      }
    ],
    "answerLetter": "B",
    "explanation": "The person performing the examination is clearly identified as the doctor.",
    "id": 342
  },
  {
    "qNum": 43,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Correction & Error Identification",
    "passage": "",
    "question": "Choose the sentence with correct parallel structure.",
    "options": [
      {
        "letter": "A",
        "text": "The course teaches students to observe, analysing and interpretation."
      },
      {
        "letter": "B",
        "text": "The course teaches students observing, to analyse and interpretation."
      },
      {
        "letter": "C",
        "text": "The course teaches students to observe, analyse and interpret."
      },
      {
        "letter": "D",
        "text": "The course teaches students observation, analyse and to interpreting."
      }
    ],
    "answerLetter": "C",
    "explanation": "The three verbs share the same grammatical form: “to observe, analyse and interpret.”",
    "id": 343
  },
  {
    "qNum": 44,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Correction & Error Identification",
    "passage": "",
    "question": "Select the correctly punctuated sentence.",
    "options": [
      {
        "letter": "A",
        "text": "The patient reported fever, cough and, fatigue."
      },
      {
        "letter": "B",
        "text": "The patient reported fever cough, and fatigue."
      },
      {
        "letter": "C",
        "text": "The patient reported fever, cough, and fatigue."
      },
      {
        "letter": "D",
        "text": "The patient reported, fever, cough and fatigue."
      }
    ],
    "answerLetter": "C",
    "explanation": "Commas correctly separate the items in the series.",
    "id": 344
  },
  {
    "qNum": 45,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Correction & Error Identification",
    "passage": "",
    "question": "Choose the clearest and most concise sentence.",
    "options": [
      {
        "letter": "A",
        "text": "Due to the fact that the sample was contaminated, the test was repeated again."
      },
      {
        "letter": "B",
        "text": "Because the sample was contaminated, the test was repeated."
      },
      {
        "letter": "C",
        "text": "The test, which was repeated again, was due to contamination of the sample."
      },
      {
        "letter": "D",
        "text": "Owing to contamination being a fact, the test repeated itself."
      }
    ],
    "answerLetter": "B",
    "explanation": "It communicates the reason and action directly without unnecessary wording.",
    "id": 345
  },
  {
    "qNum": 46,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Rearrangement, Para-Jumbles & Discourse Completion",
    "passage": "",
    "question": "Arrange the sentences into a coherent paragraph.",
    "options": [
      {
        "letter": "A",
        "text": "2–3–4–1"
      },
      {
        "letter": "B",
        "text": "1–2–3–4"
      },
      {
        "letter": "C",
        "text": "3–2–1–4"
      },
      {
        "letter": "D",
        "text": "4–1–2–3"
      }
    ],
    "answerLetter": "A",
    "explanation": "Recruitment precedes assignment, data collection follows the intervention, and comparison comes after results are available.",
    "id": 346
  },
  {
    "qNum": 47,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Rearrangement, Para-Jumbles & Discourse Completion",
    "passage": "",
    "question": "Choose the best opening sentence for a paragraph about vaccination.",
    "options": [
      {
        "letter": "A",
        "text": "This is why the second group was larger."
      },
      {
        "letter": "B",
        "text": "Vaccination trains the immune system to recognise specific pathogens."
      },
      {
        "letter": "C",
        "text": "Therefore, the figures were recorded yesterday."
      },
      {
        "letter": "D",
        "text": "In contrast, the final table was blue."
      }
    ],
    "answerLetter": "B",
    "explanation": "It introduces the topic clearly and can be followed by supporting details.",
    "id": 347
  },
  {
    "qNum": 48,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Rearrangement, Para-Jumbles & Discourse Completion",
    "passage": "",
    "question": "Complete the dialogue logically.",
    "options": [
      {
        "letter": "A",
        "text": "The clinic is next to the pharmacy."
      },
      {
        "letter": "B",
        "text": "Yes, occasionally, especially when I stand up quickly."
      },
      {
        "letter": "C",
        "text": "Medication is a long word."
      },
      {
        "letter": "D",
        "text": "I prefer the blue folder."
      }
    ],
    "answerLetter": "B",
    "explanation": "The response directly answers the clinician's question and provides relevant detail.",
    "id": 348
  },
  {
    "qNum": 49,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Rearrangement, Para-Jumbles & Discourse Completion",
    "passage": "",
    "question": "Arrange the following sentences to explain a basic scientific investigation.",
    "options": [
      {
        "letter": "A",
        "text": "2–1–4–3"
      },
      {
        "letter": "B",
        "text": "1–3–2–4"
      },
      {
        "letter": "C",
        "text": "4–2–3–1"
      },
      {
        "letter": "D",
        "text": "3–4–1–2"
      }
    ],
    "answerLetter": "A",
    "explanation": "A question arises from observations, a hypothesis is proposed, an experiment tests it, and the evidence is analysed.",
    "id": 349
  },
  {
    "qNum": 50,
    "subject": "English",
    "chapter": "Applied Grammar, Sentence Structure & Clinical Clarity (17 Questions)",
    "topic": "Sentence Rearrangement, Para-Jumbles & Discourse Completion",
    "passage": "",
    "question": "Choose the most appropriate concluding sentence for a passage explaining the importance of clear clinical communication.",
    "options": [
      {
        "letter": "A",
        "text": "Consequently, clear and accurate communication can help patients understand instructions and support safer care."
      },
      {
        "letter": "B",
        "text": "The hospital building was completed many years ago."
      },
      {
        "letter": "C",
        "text": "Some scientific words contain Greek roots."
      },
      {
        "letter": "D",
        "text": "The weather was unusually warm that week."
      }
    ],
    "answerLetter": "A",
    "explanation": "It summarises the central point and follows logically from a discussion of clinical communication.",
    "id": 350
  }
];

/**
 * Normalizes subject names to match across curriculum and question bank.
 */
export function normalizeSubjectKey(name: string): string {
  const s = (name || '').toLowerCase();
  if (s.includes('bio')) return 'Biology';
  if (s.includes('chem')) return 'Chemistry';
  if (s.includes('phys')) return 'Physics';
  if (s.includes('math')) return 'Mathematics';
  if (s.includes('eng')) return 'English';
  if (s.includes('logic')) return 'Logical Reasoning and Problems';
  if (s.includes('read') || s.includes('general') || s.includes('gk') || s.includes('cultur')) {
    return 'Reading Skills and General Knowledge';
  }
  return name;
}

/**
 * Searches the 350-question bank for questions matching the selected Subject, Chapter, and Topic.
 * Never hallucinates: only returns questions and verified keys from the official markdown bank.
 */
export function getQuestionsFromBank(
  subjectName: string,
  chapterName: string,
  topicName?: string,
  count: number = 5,
  includeDiagramQuestion: boolean = false
): GeneratedMCQ[] {
  const normSubject = normalizeSubjectKey(subjectName);
  const pool = IMAT_QUESTION_BANK.filter((q) => q.subject === normSubject);

  const effectivePool = pool.length > 0 ? pool : IMAT_QUESTION_BANK;

  // Rank questions matching the requested chapter and topic
  const chLower = (chapterName || '').toLowerCase().trim();
  const topLower = (topicName || '').toLowerCase().trim();

  const scored = effectivePool.map((q) => {
    let score = 0;
    const qText = (q.question + ' ' + (q.chapter || '') + ' ' + (q.topic || '') + ' ' + (q.passage || '')).toLowerCase();

    // Direct chapter match
    if (q.chapter && chLower.includes(q.chapter.toLowerCase())) score += 10;
    if (q.chapter && q.chapter.toLowerCase().includes(chLower)) score += 10;

    // Direct topic match
    if (topLower && topLower !== 'all topics in this chapter') {
      if (q.topic && q.topic.toLowerCase().includes(topLower)) score += 8;
      if (qText.includes(topLower)) score += 5;
    }

    return { q, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected: IMATBankQuestion[] = [];
  const selectedIds = new Set<number>();

  for (const item of scored) {
    if (!selectedIds.has(item.q.id)) {
      selected.push(item.q);
      selectedIds.add(item.q.id);
    }
    if (selected.length >= count) break;
  }

  // If still need more, fill from the subject pool
  if (selected.length < count) {
    for (const item of effectivePool) {
      if (!selectedIds.has(item.id)) {
        selected.push(item);
        selectedIds.add(item.id);
      }
      if (selected.length >= count) break;
    }
  }

  // Format into standard GeneratedMCQ with 5 options (A, B, C, D, E)
  return selected.slice(0, count).map((item, index) => {
    const letterToIdx: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

    // Format options A-D from the question bank
    const formattedOptions: string[] = item.options.map((opt) => {
      const clean = opt.text.trim();
      return `Option ${opt.letter}: ${clean}`;
    });

    // Provide Option E if not already present, ensuring 5 options format
    if (formattedOptions.length === 4) {
      formattedOptions.push('Option E: None of the above / Insufficient data');
    }

    const correctIdx = letterToIdx[item.answerLetter] ?? 0;

    // Include passage clearly in the question stem when question is based on a passage
    let finalQuestion = item.question;
    const cleanPassage = item.passage ? item.passage.trim() : '';
    if (cleanPassage) {
      finalQuestion = `[READING PASSAGE]\n${cleanPassage}\n\n[QUESTION]\n${item.question}`;
    }

    return {
      id: index + 1,
      question: finalQuestion,
      passage: cleanPassage || undefined,
      options: formattedOptions,
      correctAnswer: correctIdx,
      marks: 4,
      negativeMarks: 1,
      explanation: item.explanation || `Correct answer is Option ${item.answerLetter}.`,
    };
  });
}
