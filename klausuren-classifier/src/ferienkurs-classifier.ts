import { ClassifierEntry, ClassifierIndex, ExamIndex, SubjectMatchKeywords, Subjects } from "./interfaces";
import { getSemesterFromString, getSubjectFromString } from "./shared";
import { verbose } from "./vars";

const fs = require("fs");

let classifiedExams: number = 0;
let notClassifiedExams: number = 0;

const subjectMatchKeywordsLookup: SubjectMatchKeywords = {
  Exphys1: ["PH0001"],
  Exphys2: ["PH0002"],
  Exphys3: ["PH0003"],
  Exphys4: ["PH0004"],
  LinAlg: ["MA9201"],
  Analysis1: ["MA9202"],
  Analysis2: ["MA9203"],
  Analysis3: ["MA9204"],
  Theo1: ["PH0005"],
  Theo2: ["PH0006"],
  Theo3: ["PH0007"],
  Kernphysik: [],
  Festkoerperphysik: [],
  KondensierteMaterie: ["PH0018"],
  Elektronikpraktikum: [],
  Chemie: [],
  WiPro: [],
};

let classifier = function (basePath: string, classifiedIndex: ClassifierIndex) {
  console.log("\x1b[33m" + "ferienkurs-classifier: Starting classification" + "\x1b[0m");

  const filesPath: string = basePath + "ferienkurs/files/";

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
    let subject: Subjects = getSubjectFromString(examKey, subjectMatchKeywordsLookup);
    if (subject === "Sonstiges") {
      notClassifiedExams++;
    } else {
      classifiedExams++;
    }

    //Find semester
    let semester: string = getSemesterFromString(examKey, true);

    if (verbose && subject === "Sonstiges") {
      console.log("ferienkurs-classifier: Could not classify exam: " + examKey);
    }

    //Add to classifiedIndex
    if (classifiedIndex[subject] == undefined) {
      classifiedIndex[subject] = {};
    }

    if (classifiedIndex[subject]![semester] == undefined) {
      classifiedIndex[subject]![semester] = [];
    }

    let examIndexEntry = examIndex[rawExamKey];
    let isExercise: boolean = examIndexEntry.link.includes("exercise") ? true : false;
    let classifierEntry: ClassifierEntry = {
      link: examIndexEntry.link,
      fileName: examIndexEntry.fileName,
      solutionFileName: filesPath + examIndexEntry.solutionFileName,
      solution: examIndexEntry.solution,
      semester: semester,
      subject: subject,
      isExercise: isExercise,
    };

    classifiedIndex[subject]![semester].push(classifierEntry);
  }

  //Print all exams that could not be classified
  if (verbose) {
    console.log("\x1b[36m%s\x1b[0m ", "ferienkurs-classifier: " + Object.keys(examIndex).length + " exams found");
    console.log("\x1b[36m%s\x1b[0m", "ferienkurs-classifier: " + classifiedExams + " exams classified");
    console.log("\x1b[36m%s\x1b[0m", "ferienkurs-classifier: " + notClassifiedExams + " exams not classified");
  }

  return classifiedIndex;
};

module.exports = {
  classifier: classifier,
};
