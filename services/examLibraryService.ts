/**
 * examLibraryService.ts
 * Katalòg tout egzamen Bac yo avèk metadata konplè.
 * Chak egzamen gen yon URL dirèk nan /exams/ folder (public static).
 */

export interface ExamEntry {
  id: string;
  title: string;       // Tit ki parèt nan UI a
  subject: string;     // "Fizik" | "Syans Sosyal" | "Syans Eksperyantal"
  level: string;       // "NS4" | "9ème AF"
  year: string;        // "2025", "2024", etc.
  track: string;       // "SES" | "SMP-SVT" | "Philo A" | "Philo C-D" | "NS4" | "9ème AF"
  topic: string;       // Sijè egzamen an (ex: "Kapasite", "Induction")
  pdfPath: string;     // URL pou fetche PDF la (/exams/physique/...)
  icon: string;        // Emoji pou reprezante egzamen an
  isOfficial?: boolean; // Si se yon egzamen ofisyèl Bac
}

export const EXAM_LIBRARY: ExamEntry[] = [
  // ══════════════════════════════════════════════
  // 2025 — MODÈL EGZAMEN
  // ══════════════════════════════════════════════
  {
    id: 'phys-2025-modele-ses',
    title: 'Modèl Fizik 2025 — SES (Tèks Ofisyèl)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SES',
    topic: 'Modèl Konplè', pdfPath: '/exams/physique/TEXTE-MODELE-PHYSIQUE-2025-SES.pdf',
    icon: '📋', isOfficial: true
  },
  {
    id: 'phys-2025-modele-smp',
    title: 'Modèl Fizik 2025 — SMP-SVT (Tèks Ofisyèl)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SMP-SVT',
    topic: 'Modèl Konplè', pdfPath: '/exams/physique/TEXTE-MODELE-PHYSIQUE-2025-SMP-SVT.pdf',
    icon: '📋', isOfficial: true
  },
  {
    id: 'phys-2025-modele-general',
    title: 'Modèl Egzamen Fizik 2025 (Jeneral)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'NS4',
    topic: 'Modèl Konplè', pdfPath: '/exams/physique/Physique-modele-examen.pdf',
    icon: '📋', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2025 — NS4 (Philo NS4)
  // ══════════════════════════════════════════════
  {
    id: 'phys-2025-ns4-force',
    title: 'Fizik NS4 2025 — Fòs (Force)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'NS4',
    topic: 'Mekanik / Fòs', pdfPath: '/exams/physique/Physique-NS4-2025-Force.pdf',
    icon: '⚡', isOfficial: true
  },
  {
    id: 'phys-2025-ns4-induction',
    title: 'Fizik NS4 2025 — Endiksyon (Induction)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'NS4',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique-NS4-2025-Induction.pdf',
    icon: '🔌', isOfficial: true
  },
  {
    id: 'phys-2025-ns4-ses-gravite',
    title: 'Fizik NS4 2025 — Gravite (SES)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SES',
    topic: 'Mekanik / Gravite', pdfPath: '/exams/physique/Physique-NS4-2025-SES-Gravite.pdf',
    icon: '🌍', isOfficial: true
  },
  {
    id: 'phys-2025-ns4-ses-dilatation',
    title: 'Fizik NS4 2025 — Dilatason (SES)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SES',
    topic: 'Tèmodinamik', pdfPath: '/exams/physique/Physique-NS4-SES-Dilatation.pdf',
    icon: '🌡️', isOfficial: true
  },
  {
    id: 'phys-2025-ns4-smp-entropie',
    title: 'Fizik NS4 2025 — Antwopi (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SMP-SVT',
    topic: 'Tèmodinamik', pdfPath: '/exams/physique/Physique-NS4-SMP-SVT-Entropie.pdf',
    icon: '🔥', isOfficial: true
  },
  {
    id: 'phys-2025-ns4-mecanique',
    title: 'Fizik NS4 Desanm 2025 — Mekanik (Egzamen Konplè)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'NS4',
    topic: 'Mekanik', pdfPath: '/exams/physique/Physique-NS4-mecanique-decembre-2025.pdf',
    icon: '🏗️', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2025 — PHILO A
  // ══════════════════════════════════════════════
  {
    id: 'phys-2025-philo-a-quantique',
    title: 'Fizik Philo A 2025 — Fizik Kantik',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'Philo A',
    topic: 'Fizik Kantik', pdfPath: '/exams/physique/Physique-Philo-A-2025-Quantique.pdf',
    icon: '⚛️', isOfficial: true
  },
  {
    id: 'phys-2025-philo-a-dynamique',
    title: 'Fizik Philo A 2025 — Dinamik',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'Philo A',
    topic: 'Mekanik / Dinamik', pdfPath: '/exams/physique/Physique-Philo-A-Dynamique.pdf',
    icon: '🚀', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2025 — PHILO C-D
  // ══════════════════════════════════════════════
  {
    id: 'phys-2025-philo-cd-chaleur',
    title: 'Fizik Philo C-D 2025 — Chalè',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'Philo C-D',
    topic: 'Tèmodinamik', pdfPath: '/exams/physique/Physique-PHILO-C-D-2025-Chaleur.pdf',
    icon: '🌡️', isOfficial: true
  },
  {
    id: 'phys-2025-philo-cd-cinetique',
    title: 'Fizik Philo C-D 2025 — Sinetik',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'Philo C-D',
    topic: 'Tèmodinamik / Sinetik', pdfPath: '/exams/physique/Physique-Philo-C-D-2025Cinetique.pdf',
    icon: '💨', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2025 — SES
  // ══════════════════════════════════════════════
  {
    id: 'phys-2025-ses-densite',
    title: 'Fizik Bac 2025 — Dansite (SES)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SES',
    topic: 'Mekanik / Dansite', pdfPath: '/exams/physique/Physique-SES-2025-Densite.pdf',
    icon: '⚖️', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2025 — SMP-SVT
  // ══════════════════════════════════════════════
  {
    id: 'phys-2025-smp-vitesse',
    title: 'Fizik Bac 2025 — Vitès (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2025', track: 'SMP-SVT',
    topic: 'Mekanik / Vitès', pdfPath: '/exams/physique/Physique-SMP-SVT-Vitesse.pdf',
    icon: '🏎️', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2024
  // ══════════════════════════════════════════════
  {
    id: 'phys-2024-bac-complet',
    title: 'Fizik Bac 2024 — Egzamen Konplè',
    subject: 'Fizik', level: 'NS4', year: '2024', track: 'NS4',
    topic: 'Konplè', pdfPath: '/exams/physique/Physique-2024-Bacc-Copy.pdf',
    icon: '📚', isOfficial: true
  },
  {
    id: 'phys-2024-ses-continu',
    title: 'Fizik 2024 — Kouran Kontiny (SES)',
    subject: 'Fizik', level: 'NS4', year: '2024', track: 'SES',
    topic: 'Elektrisite', pdfPath: '/exams/physique/physique-2024-SES-CONTINU.pdf',
    icon: '🔋', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2022
  // ══════════════════════════════════════════════
  {
    id: 'phys-2022-ses-bigbang',
    title: 'Fizik 2022 — Big Bang (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Kosmoloji', pdfPath: '/exams/physique/Physique_2022_SES_Big-bang.pdf',
    icon: '🌌', isOfficial: true
  },
  {
    id: 'phys-2022-ses-cosmique',
    title: 'Fizik 2022 — Reyonman Kosmik (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Fizik Modèn', pdfPath: '/exams/physique/Physique_2022_SES_Cosmique.pdf',
    icon: '☄️', isOfficial: true
  },
  {
    id: 'phys-2022-ses-electromagnetisme',
    title: 'Fizik 2022 — Elektwomagnetis (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique_2022_SES_Electromagnetisme.pdf',
    icon: '🔌', isOfficial: true
  },
  {
    id: 'phys-2022-ses-englert',
    title: 'Fizik 2022 — Englert (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Fizik Modèn', pdfPath: '/exams/physique/Physique_2022_SES_Englert.pdf',
    icon: '🏆', isOfficial: true
  },
  {
    id: 'phys-2022-ses-etoile',
    title: 'Fizik 2022 — Etwal (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Astrfizik', pdfPath: '/exams/physique/Physique_2022_SES_Etoile.pdf',
    icon: '⭐', isOfficial: true
  },
  {
    id: 'phys-2022-ses-gravite',
    title: 'Fizik 2022 — Gravite (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Mekanik / Gravite', pdfPath: '/exams/physique/Physique_2022_SES_Gravite.pdf',
    icon: '🌍', isOfficial: true
  },
  {
    id: 'phys-2022-ses-kajita',
    title: 'Fizik 2022 — Kajita (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Fizik Modèn', pdfPath: '/exams/physique/Physique_2022_SES_Kajita.pdf',
    icon: '🔬', isOfficial: true
  },
  {
    id: 'phys-2022-ses-marconi',
    title: 'Fizik 2022 — Marconi (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique_2022_SES_Marconi.pdf',
    icon: '📡', isOfficial: true
  },
  {
    id: 'phys-2022-ses-oncle',
    title: 'Fizik 2022 — Tonton Jan (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Fizik Aplikasyon', pdfPath: '/exams/physique/Physique_2022_SES_Oncle.pdf',
    icon: '🏠', isOfficial: true
  },
  {
    id: 'phys-2022-ses-perl',
    title: 'Fizik 2022 — Perl (SES)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SES',
    topic: 'Fizik Modèn', pdfPath: '/exams/physique/Physique_2022_SES_Perl.pdf',
    icon: '⚛️', isOfficial: true
  },
  {
    id: 'phys-2022-smp-schrodinger',
    title: 'Fizik 2022 — Schrödinger (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SMP-SVT',
    topic: 'Mekanik Kantik', pdfPath: '/exams/physique/Physique_2022_SMP-SVT-Schrodinger.pdf',
    icon: '⚛️', isOfficial: true
  },
  {
    id: 'phys-2022-smp-charpak',
    title: 'Fizik 2022 — Charpak (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SMP-SVT',
    topic: 'Fizik Modèn', pdfPath: '/exams/physique/Physique_2022_SMP-SVT_Charpak.pdf',
    icon: '🔬', isOfficial: true
  },
  {
    id: 'phys-2022-smp-wineland',
    title: 'Fizik 2022 — Wineland (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2022', track: 'SMP-SVT',
    topic: 'Fizik Kantik', pdfPath: '/exams/physique/Physique_2022_SMP-SVT_Wineland_b.pdf',
    icon: '🏅', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2021
  // ══════════════════════════════════════════════
  {
    id: 'phys-2021-ses-bobine',
    title: 'Fizik 2021 — Bobin (SES)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SES',
    topic: 'Elektrisite / Endiksyon', pdfPath: '/exams/physique/Physique_2021_SES_Bobine.pdf',
    icon: '🔌', isOfficial: true
  },
  {
    id: 'phys-2021-ses-courant',
    title: 'Fizik 2021 — Kouran (SES)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SES',
    topic: 'Elektrisite', pdfPath: '/exams/physique/Physique_2021_SES_Courant.pdf',
    icon: '⚡', isOfficial: true
  },
  {
    id: 'phys-2021-smp-armature',
    title: 'Fizik 2021 — Amati (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SMP-SVT',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique_2021_SVT-SMP_Armature.pdf',
    icon: '🔧', isOfficial: true
  },
  {
    id: 'phys-2021-smp-balistique',
    title: 'Fizik 2021 — Balistik (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SMP-SVT',
    topic: 'Mekanik', pdfPath: '/exams/physique/Physique_2021_SVT-SMP_Balistique.pdf',
    icon: '🚀', isOfficial: true
  },
  {
    id: 'phys-2021-smp-barlow',
    title: 'Fizik 2021 — Rou Balo (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SMP-SVT',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique_2021_SVT-SMP_Barlow.pdf',
    icon: '⚙️', isOfficial: true
  },
  {
    id: 'phys-2021-smp-energie',
    title: 'Fizik 2021 — Enèji (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SMP-SVT',
    topic: 'Tèmodinamik / Enèji', pdfPath: '/exams/physique/Physique_2021_SVT-SMP_Energie.pdf',
    icon: '🔥', isOfficial: true
  },
  {
    id: 'phys-2021-smp-fourneau',
    title: 'Fizik 2021 — Fou (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SMP-SVT',
    topic: 'Tèmodinamik', pdfPath: '/exams/physique/Physique_2021_SVT-SMP_Fourneau.pdf',
    icon: '🏭', isOfficial: true
  },
  {
    id: 'phys-2021-ses-svt-armaturo',
    title: 'Fizik 2021 — Amati (SVT-SMP)',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'SMP-SVT',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique-2021-svt-SMP-Armaturo.pdf',
    icon: '🔧', isOfficial: true
  },
  {
    id: 'phys-2021-bac-permanent',
    title: 'Fizik 2021 — Bac Pèmanan',
    subject: 'Fizik', level: 'NS4', year: '2021', track: 'NS4',
    topic: 'Konplè', pdfPath: '/exams/physique/physique-2021-Bac-Permanent-.pdf',
    icon: '📚', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2020
  // ══════════════════════════════════════════════
  {
    id: 'phys-2020-smp-regression',
    title: 'Fizik 2020 — Regilesyon (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2020', track: 'SMP-SVT',
    topic: 'Analiz Grafik', pdfPath: '/exams/physique/physique-2020-SVT-regression-.pdf',
    icon: '📊', isOfficial: true
  },
  {
    id: 'phys-2020-smp-tangente',
    title: 'Fizik 2020 — Tanjant (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2020', track: 'SMP-SVT',
    topic: 'Analiz Grafik', pdfPath: '/exams/physique/Physique_2020_SVT-SMP_Tangente.pdf',
    icon: '📈', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 2019
  // ══════════════════════════════════════════════
  {
    id: 'phys-2019-ses-cinetique',
    title: 'Fizik 2019 — Sinetik (SES)',
    subject: 'Fizik', level: 'NS4', year: '2019', track: 'SES',
    topic: 'Tèmodinamik / Sinetik', pdfPath: '/exams/physique/Physique_2019_SES_Cinetique.pdf',
    icon: '💨', isOfficial: true
  },
  {
    id: 'phys-2019-smp-condensateur',
    title: 'Fizik 2019 — Kondansatè (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2019', track: 'SMP-SVT',
    topic: 'Elektrisite', pdfPath: '/exams/physique/Physique_2019_SVT-SMP_Condensateur.pdf',
    icon: '🔋', isOfficial: true
  },
  {
    id: 'phys-2019-smp-induction',
    title: 'Fizik 2019 — Endiksyon (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2019', track: 'SMP-SVT',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique_2019_SVT-SMP_Induction.pdf',
    icon: '🔌', isOfficial: true
  },
  {
    id: 'phys-2019-smp-transformateur',
    title: 'Fizik 2019 — Transfòmatè (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2019', track: 'SMP-SVT',
    topic: 'Elektwomagnetis', pdfPath: '/exams/physique/Physique_2019_SVT-SMP_Transformateur.pdf',
    icon: '⚡', isOfficial: true
  },
  {
    id: 'phys-2019-smp-alimentation',
    title: 'Fizik 2019 — Alimantasyon (SMP-SVT)',
    subject: 'Fizik', level: 'NS4', year: '2019', track: 'SMP-SVT',
    topic: 'Elektrisite', pdfPath: '/exams/physique/physique-2019-SVT-SMP-AIMENTATION.pdf',
    icon: '🔌', isOfficial: true
  },

  // ══════════════════════════════════════════════
  // 9ème AF — Sciences Expérimentales ak Sociales
  // ══════════════════════════════════════════════
  {
    id: 'sci-9af-sociales-2010-2023',
    title: 'Syans Sosyal 9è AF — Koleksyon 2010-2023',
    subject: 'Syans Sosyal', level: '9ème AF', year: '2010-2023', track: '9ème AF',
    topic: 'Koleksyon Konplè', pdfPath: '/exams/sciences/Science-sociales-2010-2023-9e-AF.pdf',
    icon: '🌍', isOfficial: true
  },
  {
    id: 'sci-9af-experimentales-2010-2023',
    title: 'Syans Ekspèrimantal 9è AF — Koleksyon 2010-2023',
    subject: 'Syans Ekspèrimantal', level: '9ème AF', year: '2010-2023', track: '9ème AF',
    topic: 'Koleksyon Konplè', pdfPath: '/exams/sciences/Sciences-Experimentales-2010-2023-9e-AF.pdf',
    icon: '🔬', isOfficial: true
  },
];

// ─── Helper fonksyon pou filtre ───────────────────────────────────────────────

export function getExamsByYear(year: string): ExamEntry[] {
  return EXAM_LIBRARY.filter(e => e.year === year || e.year.startsWith(year));
}

export function getExamsByTrack(track: string): ExamEntry[] {
  return EXAM_LIBRARY.filter(e => e.track === track);
}

export function getExamsByLevel(level: string): ExamEntry[] {
  return EXAM_LIBRARY.filter(e => e.level === level);
}

export function getExamsBySubject(subject: string): ExamEntry[] {
  return EXAM_LIBRARY.filter(e => e.subject === subject);
}

export function getAvailableYears(): string[] {
  const years = [...new Set(EXAM_LIBRARY.map(e => e.year))];
  return years.sort((a, b) => b.localeCompare(a));
}

export function getAvailableTracks(): string[] {
  return [...new Set(EXAM_LIBRARY.map(e => e.track))];
}

export function searchExams(query: string): ExamEntry[] {
  const q = query.toLowerCase();
  return EXAM_LIBRARY.filter(e =>
    e.title.toLowerCase().includes(q) ||
    e.topic.toLowerCase().includes(q) ||
    e.year.includes(q) ||
    e.track.toLowerCase().includes(q)
  );
}
