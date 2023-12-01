import { Subjects } from "./interfaces";

//Extracts the semester Data from the filename string and returns it in the format "SS2020" or "WS2020/2021", returns "????" if no year was found
export function getSemesterFromString(string: string, ferienkursFormat: boolean = false): string {
  let semester: string = "";

  //Check if the string contains a year
  let yearRegex = /\d{4}/g;
  let yearMatch = string.match(yearRegex);
  if (yearMatch === null) {
    return "????";
  }

  //If length of the yearMatch is 1, its a summer semester, if its 2 its a winter semester
  if (!ferienkursFormat) {
    if (yearMatch.length === 1) {
      semester = "SS" + yearMatch[0];
    } else if (yearMatch.length === 2) {
      semester = "WS" + yearMatch[0] + "/" + yearMatch[1];
    } else {
      semester = "??" + yearMatch[0];
    }
  } else {
    //Match SSYYYY or WSYYYY/YYY
    let semesterRegex = /(SS|WS)\d{4}(\/\d{4})?/g;
    let semesterMatch = string.match(semesterRegex);
    if (semesterMatch === null) {
      return "????";
    }

    if (semesterMatch[0].startsWith("SS")) {
      semester = semesterMatch[0];
    } else if (semesterMatch[0].startsWith("WS")) {
      let year = semesterMatch[0].match(yearRegex);
      semester = "WS" + year + "/" + (parseInt(year![0]) + 1);
    }
  }

  return semester;
}

//Extract the semester Data from a filename that has the date as the format yyyys or yyyyw

//Extracts the subject from the filename string and returns it in the format "Exphys1" or "Theo3", returns "Sonstiges" if no subject was found
export function getSubjectFromString(string: string, lookupTable: { [key: string]: string[] }) {
  let subject: Subjects = "Sonstiges";
  for (let subjectKey in lookupTable) {
    let keywords: string[] | undefined = lookupTable[subjectKey as Subjects];
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
