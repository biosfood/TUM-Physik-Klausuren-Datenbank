import { ClassifierEntry, ClassifierIndex, ExamIndex, SubjectMatchKeywords, Subjects } from "./interfaces";
import { getSemesterFromString, getSubjectFromString } from "./shared";
import { verbose } from "./vars";

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
  console.log("\x1b[33m" + "sjakob-classifier: Starting classification" + "\x1b[0m");

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
    let subject: Subjects = getSubjectFromString(examKey, subjectMatchKeywordsLookup);

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
    console.log("\x1b[36m%s\x1b[0m", "sjakob-classifier: " + Object.keys(examIndex).length + " exams found");
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

    console.log("\x1b[36m%s\x1b[0m", "sjakob-classifier: " + classifiedExams + " exams classified");
    console.log(
      "\x1b[36m%s\x1b[0m",
      "sjakob-classifier: " + (Object.keys(examIndex).length - classifiedExams) + " exams not classified:"
    );
    //Print names of unclassified exams
  }

  return classifiedIndex;
};

module.exports = {
  classifier: classifier,
};
