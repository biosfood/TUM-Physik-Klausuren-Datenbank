//Path to the exams folder (relative to the parent folder of this file)
import * as path from "path";
import { ClassifierIndex } from "./src/interfaces";
import * as fs from "fs";
var sjakobClassifier = require("./sjakob-classifier");

const pathToExams: string = path.resolve(__dirname, "..") + "/scraper/";
console.log(pathToExams);

let classifiedIndex: ClassifierIndex = {};

classifiedIndex = sjakobClassifier.classifier(pathToExams, classifiedIndex);

//Write indexFile
let indexFile = JSON.stringify(classifiedIndex, null, 2);
fs.writeFileSync("classifiedIndex.json", indexFile);
