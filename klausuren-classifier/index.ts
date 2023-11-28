//Path to the exams folder (relative to the parent folder of this file)
import * as path from "path";

const pathToExams: string = path.dirname(__filename).split(path.sep).pop() + "/scraper/";
console.log(pathToExams);
