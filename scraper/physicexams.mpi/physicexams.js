//Load all html files in the directory "requests"
var fs = require("fs");
const { get } = require("http");
var path = require("path");
const axios = require("axios");
const https = require("https");

var dir = path.join(__dirname, "requests");
var files = fs.readdirSync(dir);

const baseAssetsUrl = "https://physicsexams.mpi.fs.tum.de";
const downloadDirectory = "./files";
const downloadDelay = 1000;

//File Index Structure:
//  {
//    "title": "title_of_exam",
//    "link": "link_to_pdf",
//    "fileName": "name_of_local_file"
//    "solution": "link_to_solution_pdf"
//    "solutionFileName": "name_of_local_solution_file"
//  }
var fileIndex = [];

for (file in files) {
  var file = path.join(dir, files[file]);
  var html = fs.readFileSync(file, "utf8");
  html = cleanup(html);
  var blocks = splitIntoBlocks(html);
  getIndexData(blocks);
  fs.writeFileSync("files/_index.json", JSON.stringify(fileIndex));
}

downloadAllFilesInIndex();

async function downloadAllFilesInIndex() {
  for (let element of fileIndex) {
    await downloadPDF(element.link, downloadDirectory);
    await downloadPDF(element.solution, downloadDirectory);
    await new Promise((resolve) => setTimeout(resolve, downloadDelay));
  }
}

async function downloadPDF(url, directory) {
  const response = await axios.get(url, {
    responseType: "stream",
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });
  const fileName = path.basename(url);
  const filePath = path.join(directory, fileName);
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function cleanup(html) {
  //Remove all whitespace
  html = html.replace(/\s/g, "");
  //Remove all linebreaks
  html = html.replace(/\n/g, "");
  html = html.replace(/\\n/g, "");
  //Remove all tabs
  html = html.replace(/\t/g, "");

  return html;
}

function getIndexData(blocks) {
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    links = filterPDFLinks(block);
    if (links.length != 2) {
      console.log("ERROR: Block does not contain 2 links");
      console.log(links);
      links.push("");
    }
    let title = getTitle(block);
    console.log(title);

    let indexEntry = {
      title: title,
      link: baseAssetsUrl + links[0],
      fileName: getFileName(links[0]),
      solution: baseAssetsUrl + links[1],
      solutionFileName: getFileName(links[1]),
    };

    fileIndex.push(indexEntry);
  }
}

function germanize(string) {
  string = string.replace(/\\u([0-9a-fA-F]{4})/g, (m, cc) => String.fromCharCode("0x" + cc));
  return string;
}

function getFileName(link) {
  var fileName = link.match(/[^\/]*\.pdf/);
  if (fileName) {
    fileName = fileName[0];
  }
  return fileName;
}

function getTitle(block) {
  var title = block.match(/<b>.*?<\/b>/g);
  if (title) {
    title = title[0].replace(/<b.*?>/, "").replace(/<\/b>/, "");
  }
  return title;
}

function splitIntoBlocks(html) {
  //split into blocks that start with <tr and end with </tr> and contain .pdf
  var blocks = html.match(/<trclass='trSpecial'>.*?<\/tr>/g);
  if (blocks) {
    blocks = blocks.map(function (block) {
      return block.replace(/<trclass='trSpecial'>/, "").replace(/<\/tr>/, "");
    });
  }

  for (let i = 0; i < blocks.length; i++) {
    if (!blocks[i].includes(".pdf")) {
      blocks.splice(i, 1);
      i--;
    }
  }

  return blocks;
}

function filterPDFLinks(html) {
  var links = html.match(/href='([^']*\.pdf)'/g);
  if (links) {
    links = links.map(function (link) {
      return link.replace(/href='/, "").replace(/'/, "");
    });
  }
  for (let i = 0; i < links.length; i++) {
    links[i] = germanize(links[i]);
  }
  return links;
}
