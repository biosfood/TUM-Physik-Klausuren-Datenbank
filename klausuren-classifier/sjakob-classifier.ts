import { ClassifierEntry, ClassifierIndex, ExamIndex, SubjectMatchKeywords, Subjects } from "./src/interfaces";
import { verbose } from "./src/vars";

const fs = require("fs");

const subjectMatchKeywordsLookup: SubjectMatchKeywords = {
  Exphys1: ["ExperimentalphysikI", "exph1"],
  Exphys2: ["ExperimentalphysikII", "exph2"],
  Exphys3: ["ExperimentalphysikIII", "exph3"],
  Exphys4: ["ExperimentalphysikIV", "exph4"],
  LinAlg: ["LineareAlgebra", "linalg"],
  Analysis1: ["Analysis1", "hm2_an1"],
  Analysis2: ["Analysis2", "hm3_an2"],
  Analysis3: ["Analysis3"],
  Theo1: ["Mechanik", "Formelhilfe", "mech"],
  Theo2: ["Elektrodynamik", "Hilfsblatt", "englishversion"],
  Theo3: ["Quantenmechanik", "qm1"],
  Kernphysik: ["undAstrophysik1"],
  Festkoerperphysik: ["Festkörperphysik"],
  KondensierteMaterie: ["kondensiertenMaterie"],
  Elektronikpraktikum: ["Elektronikpraktikum"],
  Chemie: ["Chemie", "chem"],
  WiPro: ["WissenschaftlicheProgrammierung", "wipro"],
};

let classifier = function (basePath: string, classifiedIndex: ClassifierIndex) {
  console.log("Running sjakob-classifier");

  const filesPath: string = basePath + "sjacob/files/";

  //Read indexFile
  let indexFile = fs.readFileSync(filesPath + "_index.json");
  let examIndex = JSON.parse(indexFile) as ExamIndex;

  for (let rawExamKey in examIndex) {
    let examKey: string = rawExamKey;
    //Remove all whitespace from examKey
    examKey = examKey.replace(/\s/g, "");
    //remove <s> and </s> from examKey
    examKey = examKey.replace(/<s>/g, "");
    examKey = examKey.replace(/<\/s>/g, "");

    //Find subject
    let subject: Subjects = getSubjectFromString(examKey);

    //Find semester
    let semester: string = getSemesterFromString(examKey);

    if (verbose && subject === "Sonstiges") {
      console.log("sjakob-classifier: Could not classify exam: " + examKey);
    }

    //Add to classifiedIndex
    if (classifiedIndex[subject] == undefined) {
      classifiedIndex[subject] = {};
    }

    if (classifiedIndex[subject]![semester] == undefined) {
      classifiedIndex[subject]![semester] = [];
    }

    let examIndexEntry = examIndex[rawExamKey];
    let classifierEntry: ClassifierEntry = {
      link: examIndexEntry.link,
      fileName: examIndexEntry.fileName,
      solutionFileName: filesPath + examIndexEntry.solutionFileName,
      solution: examIndexEntry.solution,
      semester: semester,
      subject: subject,
    };

    classifiedIndex[subject]![semester].push(classifierEntry);
  }

  //Print all exams that could not be classified
  if (verbose) {
    console.log("sjakob-classifier: " + Object.keys(examIndex).length + " exams found");
    let classifiedExams: number = 0;
    for (let subjectKey in classifiedIndex) {
      let subject = classifiedIndex[subjectKey as Subjects];
      if (subjectKey === "Sonstiges" || subject === undefined) {
        continue;
      }
      for (let semesterKey in subject) {
        let semester = subject[semesterKey];
        classifiedExams += semester.length;
      }
    }

    console.log("sjakob-classifier: " + classifiedExams + " exams classified");
    console.log("sjakob-classifier: " + (Object.keys(examIndex).length - classifiedExams) + " exams not classified:");
    //Print names of unclassified exams
  }

  return classifiedIndex;
};

//Extracts the semester Data from the filename string and returns it in the format "SS2020" or "WS2020/2021", returns "????" if no year was found
function getSemesterFromString(string: string): string {
  let semester: string = "";

  //Check if the string contains a year
  let yearRegex = /\d{4}/g;
  let yearMatch = string.match(yearRegex);
  if (yearMatch === null) {
    return "????";
  }

  //If length of the yearMatch is 1, its a summer semester, if its 2 its a winter semester
  if (yearMatch.length === 1) {
    semester = "SS" + yearMatch[0];
  } else if (yearMatch.length === 2) {
    semester = "WS" + yearMatch[0] + "/" + yearMatch[1];
  } else {
    semester = "??" + yearMatch[0];
  }

  return semester;
}

//Extracts the subject from the filename string and returns it in the format "Exphys1" or "Theo3", returns "Sonstiges" if no subject was found
function getSubjectFromString(string: string) {
  let subject: Subjects = "Sonstiges";
  for (let subjectKey in subjectMatchKeywordsLookup) {
    let keywords: string[] | undefined = subjectMatchKeywordsLookup[subjectKey as Subjects];
    if (keywords === undefined) {
      continue;
    }
    for (let keyword of keywords) {
      if (string.includes(keyword)) {
        subject = subjectKey as Subjects;
        break;
      }
    }
  }

  return subject;
}

module.exports = {
  classifier: classifier,
};
