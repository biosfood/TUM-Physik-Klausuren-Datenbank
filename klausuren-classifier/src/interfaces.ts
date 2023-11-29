export type Subjects =
  | "Exphys1"
  | "Exphys2"
  | "Exphys3"
  | "Exphys4"
  | "LinAlg"
  | "Analysis1"
  | "Analysis2"
  | "Analysis3"
  | "Theo1"
  | "Theo2"
  | "Theo3"
  | "Kernphysik"
  | "Festkoerperphysik"
  | "KondensierteMaterie"
  | "Elektronikpraktikum"
  | "Chemie"
  | "WiPro"
  | "Sonstiges";
export type ClassifierIndex = {
  [key in Subjects]?: ClassifierSubjectEntry; //Subjects
};

export interface ClassifierSubjectEntry {
  [key: string]: ClassifierEntry[]; //Years
}

export interface ClassifierEntry {
  link: string;
  fileName: string;
  solutionFileName: string;
  solution: string;
  semester: string;
  subject: Subjects;
}

export interface ExamIndex {
  [key: string]: ExamIndexEntry;
}

export interface ExamIndexEntry {
  link: string;
  fileName: string;
  solutionFileName: string;
  solution: string;
}

export type SubjectMatchKeywords = {
  [key in Subjects]?: string[];
};
