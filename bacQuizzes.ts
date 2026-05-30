import { Quiz } from './types';

// Example Structure for MENFP Exams Database
type ExamDB = {
    [level: string]: {
        [subject: string]: {
            [year: string]: Quiz;
        }
    }
};

export const EXAM_DATABASE: ExamDB = {
    "9ème AF": {
        "Kreyòl": {
            "2023": {
                title: "Egzamen Leta 9ème AF - Kreyòl 2023",
                questions: [
                    {
                        id: "kr9-1",
                        question: "Nan fraz sa a: 'Mwen wè bèl ti flè a', ki fonksyon mo 'bèl' la?",
                        correctAnswer: "Adjektif kalifikatif.",
                        explanation: "Mo 'bèl' la ap kalifye, oswa devlope kalite 'flè' a. (MENFP Trap: Elèv la konn konfonn li ak yon advèb)."
                    },
                    {
                        id: "kr9-2",
                        question: "Lè yon moun di 'Li kouri tankou van', ki figi de stil sa ye?",
                        correctAnswer: "Konparezon.",
                        explanation: "Prezans mo 'tankou' a asire nou tèm nan konpare. (MENFP Trap: Pafwa elèv kwè se 'metafò' lè yo bliye gade zouti konparezon an)."
                    },
                    {
                        id: "kr9-3",
                        question: "Ki pwovèb ki ale ak ide: pridan pi bon pase regrèt?",
                        correctAnswer: "Pito ou lèd ou la.",
                        explanation: "Klere sou reyalite prekosyon fas a danje."
                    },
                    {
                        id: "kr9-4",
                        question: "Chwazi omonim pou mo 'Sèl' jwenn nan fraz: Zile sa gen yon sèl mòn.",
                        correctAnswer: "Sèl (pou mete nan manje).",
                        explanation: "Menm pwononsyasyon (e souvan menm òtograf an Kreyòl) men 2 reyalite diferan."
                    }
                ]
            }
        }
    },
    "NS4": {
        "Fizik": {
            "2025 (SES)": {
                title: "Quiz Fizik Bac 2025 (Modèl SES)",
                questions: [
                    {
                        id: "q-ses-1",
                        question: "[Kapasite Ekivalan] Nou gen 4 kondansatè ki monte an 2 seri de 2 eleman (chak branch gen 2 kondansatè an seri, epi 2 branch sa yo branche an paralèl: premye branch lan gen 3 µF ak 6 µF an seri, dezyèm branch lan gen 2 µF ak 4 µF an seri). Ki valè kapasite ekivalan (C_eq) tout asosyasyon sa a?",
                        correctAnswer: "3,33 µF",
                        explanation: "Pèlen MENFP: Pa jis adisyone tout kapasite yo! Pou premye branch lan: C1 = (3 * 6)/(3 + 6) = 2 µF. Pou dezyèm branch lan: C2 = (2 * 4)/(2 + 4) = 1,33 µF. Kòm 2 branch yo an paralèl, nou adisyone yo: C_eq = 2 + 1,33 = 3,33 µF."
                    },
                    {
                        id: "q-ses-2",
                        question: "[Tansyon Seri] Pou menm montaj la k ap travay anba yon d.d.p konstante 90 V, kisa vòltaj la ye nan bòn kondansatè 3 µF la?",
                        correctAnswer: "60 V",
                        explanation: "Pèlen MENFP: Elèv yo konn panse 90 V la ap divize an de (45 V) oswa pi piti a ap jwenn pi piti vòltaj. Chaj branch lan se Q = C1 * V = 2 µF * 90 V = 180 µC. Pou kondansatè 3 µF la: V = Q/C = 180 µC / 3 µF = 60 V. Nan seri, se pi piti a ki pran pi gwo vòltaj la!"
                    },
                    {
                        id: "q-ses-3",
                        question: "[Enèji Stoke] Kalkile enèji total ki stoke nan tout montaj kondansatè sa a anba vòltaj 90 V la.",
                        correctAnswer: "13,48 mJ",
                        explanation: "Pèlen MENFP: Atansyon ak konvèsyon mikwofarad (µF) an Farad (F)! Fòmil la se W = 1/2 * C_eq * V² = 0.5 * 3.33 * 10^-6 F * 90² V² = 13,48 * 10^-3 J = 13,48 mJ."
                    },
                    {
                        id: "q-ses-4",
                        question: "[Spires Bobin] Nou enwoule yon fil metalik ki gen 62.8 m longè sou yon sipò izolan silendrik ki gen 20 cm longè ak 2 cm dyamèt. Konbyen spira (spires) bobin sa a genyen?",
                        correctAnswer: "1 000 spires",
                        explanation: "Pèlen MENFP: Pa konfonn dyamèt fil la ak dyamèt sipò a! Longè yon sèl spira se sikonferans silenn lan: C = π * D = 3.14 * 0.02 m = 0.0628 m. Kantite spira se N = L_fil / C_spire = 62.8 / 0.0628 = 1000 spires."
                    },
                    {
                        id: "q-ses-5",
                        question: "[Rezistans & Rezistivite] Si rezistivite fil metalik la se ρ = 1.6 µΩ·cm epi dyamèt fil la se 0.2 mm. Pou yon longè fil 62.8 m, ki valè rezistans la?",
                        correctAnswer: "32 Ω",
                        explanation: "Pèlen MENFP: Konvèsyon ρ soti nan µΩ·cm pou ale nan Ω·m se pi gwo pèlen an (1.6 µΩ·cm = 1.6 * 10^-8 Ω·m). Reyon fil la se r = 0.1 mm = 10^-4 m. Seksyon S = π * r² = 3.14 * 10^-8 m². Rezistans R = ρ * L / S = 1.6 * 10^-8 * 62.8 / (3.14 * 10^-8) = 32 Ω."
                    }
                ]
            },
            "2025 (SMP-SVT)": {
                title: "Quiz Fizik Bac 2025 (Modèl SMP-SVT)",
                questions: [
                    {
                        id: "q-smp-1",
                        question: "[Kondansatè Plan] Yon kondansatè plan ki gen plak li yo separe pa 2 cm konekte sou 100 V. Si kapasite li se 40 pF, ki chaj (Q) li pran?",
                        correctAnswer: "4 nC",
                        explanation: "Pèlen MENFP: Sonje prefiks yo! piko (pF) se 10^-12 epi nano (nC) se 10^-9. Fòmil la se Q = C * V = 40 * 10^-12 F * 100 V = 4000 * 10^-12 C = 4 * 10^-9 C = 4 nC."
                    },
                    {
                        id: "q-smp-2",
                        question: "[Chan Elektrik] Ki valè chan elektrik (E) ki genyen ant de plak kondansatè sa a?",
                        correctAnswer: "5 kV/m",
                        explanation: "Pèlen MENFP: Pa bliye konvèti distans 2 cm an mèt (0.02 m)! Fòmil la se E = U / d = 100 V / 0.02 m = 5000 V/m = 5 kV/m."
                    },
                    {
                        id: "q-smp-3",
                        question: "[Fòs Atraksyon] Ki fòs elektrik atraksyon ki egziste ant de plak kondansatè sa a?",
                        correctAnswer: "10 µN",
                        explanation: "Pèlen MENFP: Fòmil la se F = 1/2 * Q * E. Si nou ranplase valè yo: F = 0.5 * (4 * 10^-9 C) * 5000 V/m = 10^-5 N = 10 µN."
                    },
                    {
                        id: "q-smp-4",
                        question: "[Sikui R-C Seri] Yon kouran altènatif i(t) = 4√2 cos(314t) ap pase nan yon rezistans R = 20 Ω ak yon kondansatè C = 40 µF ki an seri. Kalkile enpedans (Z) sikui sa a.",
                        correctAnswer: "82 Ω",
                        explanation: "Pèlen MENFP: Pa jis adisyone rezistans lan ak reyaktans lan (sa bay 99.6 Ω ki se yon fo chwa)! Reyaktans lan se Xc = 1 / (C * ω) = 1 / (40 * 10^-6 * 314) = 79.6 Ω. Enpedans lan kalkile ak fòmil triyang lan: Z = √(R² + Xc²) = √(20² + 79.6²) = 82 Ω."
                    },
                    {
                        id: "q-smp-5",
                        question: "[Anplitid Kouran] Pou menm kouran i(t) = 4√2 cos(314t) la, ki valè amplitude (entansite maksimòm I_m) kouran an?",
                        correctAnswer: "5,65 A",
                        explanation: "Pèlen MENFP: Anplitid se valè maksimòm lan ki devan kosinis la (I_m = 4√2 A = 5.65 A). Pa konfonn li ak valè efikas la ki se I_eff = 4 A!"
                    }
                ]
            }
        },
        "Biyoloji": {
            "2021": {
                title: "Egzamen Leta NS4 - Biyoloji 2021",
                questions: [
                    {
                        id: "bio-1",
                        question: "Ki òganit nan selil la ki responsab pou respirasyon selilè a?",
                        correctAnswer: "Mitokondri a (Mitochondrie).",
                        explanation: "Se la enèji ATP a fabrike. (MENFP Trap: Yo mete 'Klowoplas' souvan pou wè si wap konfonn respirasyon plant ak selil bèt)."
                    },
                    {
                        id: "bio-2",
                        question: "Ki asid nileyik ki gen ladan l 'Uracile' nan plas 'Thymine'?",
                        correctAnswer: "ARN (Asid Ribonikleyik).",
                        explanation: "ARN itilize U pandan ADN itilize T. Sa se yon pèlen klasik nan klasman baz azote yo."
                    },
                    {
                        id: "bio-3",
                        question: "Nan ki faz fize kwomatik la parèt klè pandan mitoz la?",
                        correctAnswer: "Pwofaz (Prophase).",
                        explanation: "Kromosom yo kondanse epi fize yo kòmanse enstale (Fuseau achromatique)."
                    }
                ]
            }
        }
    }
};

export const getQuizFromDatabase = (level: string, subject: string, year: string): Quiz | null => {
    try {
        return EXAM_DATABASE[level]?.[subject]?.[year] || null;
    } catch {
        return null;
    }
};

