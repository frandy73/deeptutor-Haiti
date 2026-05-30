/**
 * ministryData.ts
 * Baz done rezime ak direktiv ofisyèl Ministè Edikasyon Nasyonal (MENFP)
 * Kouvri depi 1ère AF rive nan NS4 (Filo).
 */

export interface MinistrySubjectData {
  subject: string;
  topics: string[];
  keyConcepts: string[];
  methodology?: string;
}

export interface MinistryLevelData {
  level: string;
  description: string;
  subjects: MinistrySubjectData[];
}

export const MINISTRY_CURRICULUM: Record<string, MinistryLevelData> = {
  "1ère AF": {
    level: "1ère Ane Fondamantal",
    description: "Baz alfabetizasyon ak kalkil inisyal.",
    subjects: [
      {
        subject: "Kreyòl",
        topics: ["Alfabetizasyon", "Vwayèl ak Konsòn", "Lekti kout", "Eskriti baz"],
        keyConcepts: ["Grafèm", "Fonèm", "Dekodaj"],
      },
      {
        subject: "Matematik",
        topics: ["Chif 0 a 100", "Adisyon senp", "Soustraction senp", "Fòm jeometrik baz"],
        keyConcepts: ["Inite", "Dizèn", "Kantite"],
      }
    ]
  },
  "9ème AF": {
    level: "9ème Ane Fondamantal",
    description: "Fen twazyèm sik fondamantal, preparasyon pou premye egzamen Leta.",
    subjects: [
      {
        subject: "Matematik",
        topics: [
          "Aljèb: Rasin kare, Puissans, Faktorisasyon, Ekwasyon 1er degre",
          "Jeometri: Teyorèm Pitagò, Teyorèm Thalès, Vektè, Solid nan espas",
          "Fonksyon: Fonksyon lineyè ak afin",
          "Estatistik: Mwayèn, Frekans, Medyàn"
        ],
        keyConcepts: ["Rasyonèl", "Irasyonèl", "Pwolonjman", "Symmetry"],
        methodology: "Toujou idantifye done yo anvan ou kòmanse rezolisyon an. Sèvi ak inite mezi yo (m, cm, kg)."
      },
      {
        subject: "Kreyòl",
        topics: [
          "Gramè: Fonksyon mo, Gwoup Non, Gwoup Vèb",
          "Òtograf: Aksan, Tirè, Apostwòf nan Kreyòl",
          "Literati: Pwovèb Ayisyen, Kont, Lejann",
          "Konpreyansyon: Analiz tèks"
        ],
        keyConcepts: ["Predika", "Sijè", "Konpleman", "Figi de stil"],
        methodology: "Respekte règ òtograf ofisyèl 1979 la."
      },
      {
        subject: "Istwa & Jeyografi",
        topics: [
          "Istwa: Peryòd kolonyal, Revolisyon 1804, Gwo lidè (Toussaint, Dessalines)",
          "Jeyografi: 10 Depatman yo, Mòn yo, Rivyè prensipal (Artibonite), Klima Ayiti"
        ],
        keyConcepts: ["Endepandans", "Souverènte", "Orografi", "Idrografi"]
      }
    ]
  },
  "NS4 (Filo)": {
    level: "Nouveau Secondaire 4",
    description: "Fen segondè, preparasyon pou Baccalauréat la.",
    subjects: [
      {
        subject: "Filozofi",
        topics: [
          "Moun ak Mond lan: Konsyans, Enkonsyan, Pèsepsyon",
          "Aksyon: Moral, Dwa, Jistis, Leta",
          "Konesans: Verite, Logik, Syans",
          "Estetik: Atizay ak Bote"
        ],
        keyConcepts: ["Egzistansyalism", "Rationalism", "Anpiris", "Dyalektik"],
        methodology: "Disertasyon dwe gen: Entwodiksyon (Pwoblèm), Devlopman (Tez, Antitez, Sintèz), ak Konklizyon."
      },
      {
        subject: "Fizik",
        topics: [
          "Mekanik: Lwa Newton, Travail ak Enèji, Osilatè",
          "Elektrisite: Chan elektrik, Kondansatè, Kouran Altènatif",
          "Optik: Refleksyon, Refraksyon, Lantiy",
          "Thermodinamik: Chalè, Tanperati, Lwa Joule"
        ],
        keyConcepts: ["Vektè fòs", "Enèji sinetik", "Indiksyon", "Flux"],
        methodology: "Sèvi ak Sistèm Entènasyonal (SI) pou inite yo."
      },
      {
        subject: "Français",
        topics: [
          "Analyse Littéraire: Courants littéraires (Romantisme, Surréalisme, Indigénisme)",
          "Dissertation: Structure et argumentation",
          "Grammaire: Syntaxe complexe, modes et temps"
        ],
        keyConcepts: ["Argumentation", "Rhétorique", "Style"]
      }
    ]
  }
};

export const getOfficialContextForLevel = (level: string, subject?: string): string => {
  const data = MINISTRY_CURRICULUM[level];
  if (!data) return "";

  let context = `--- ENFÒMASYON OFISYÈL MENFP (Nivo: ${data.level}) ---\n`;
  context += `Deskripsyon: ${data.description}\n\n`;

  const subjectsToInclude = subject 
    ? data.subjects.filter(s => s.subject.toLowerCase() === subject.toLowerCase())
    : data.subjects;

  subjectsToInclude.forEach(s => {
    context += `Matyè: ${s.subject}\n`;
    context += `- Gwo Tèm: ${s.topics.join(", ")}\n`;
    context += `- Konsèp Kle: ${s.keyConcepts.join(", ")}\n`;
    if (s.methodology) context += `- Metodoloji: ${s.methodology}\n`;
    context += "\n";
  });

  context += "--- FIN ENFÒMASYON OFISYÈL ---\n";
  return context;
};
