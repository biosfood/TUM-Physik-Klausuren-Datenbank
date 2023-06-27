const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');

const websiteUrl = 'https://users.ph.nat.tum.de/sjakob/klausuren.html';
const downloadDirectory = './files';
const downloadDelay = 1000; //ms
const dryRund = true; // Set to true if you only want to generate the index file without downloading the files
const silent = true; // Set to true if you don't want to see the progress messages

scrapeAndDownloadPDFs(websiteUrl, downloadDirectory)
    .then(() => printProgress('Scraping and downloading complete.'))
    .catch(error => console.error('An error occurred:', error));



async function scrapePDFLinks(url) {
    const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
    const page = await browser.newPage();
    await page.goto(url);

    page
        .on('console', message =>
            console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`))
        .on('pageerror', ({ message }) => console.log(message))
        .on('response', response =>
            console.log(`${response.status()} ${response.url()}`))
        .on('requestfailed', request =>
            console.log(`${request.failure().errorText} ${request.url()}`))

    const pdfLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        let pdfLinks = [];

        for (let link of links) {
            if (link.href.toLowerCase().endsWith('.pdf')) {
                pdfLinks.push({
                    name: link.innerHTML,
                    link: link.href
                })
            }
        }
        return pdfLinks;
    });

    await browser.close();

    return pdfLinks;
}

async function downloadPDF(url, directory) {
    const response = await axios.get(url, { responseType: 'stream', httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    const fileName = path.basename(url);
    const filePath = path.join(directory, fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function scrapeAndDownloadPDFs(url, directory) {
    const pdfLinks = await scrapePDFLinks(url);
    const index = {};

    const solutionIndex = []

    for (const link of pdfLinks) {
        // Generate index entry
        //console.log(link)
        console.log(link)
        const fileName = path.basename(link.link);
        if (fileName.endsWith("_lsg.pdf")) {
            const examName = fileName.replace("_lsg.pdf", ".pdf");
            const solutionName = fileName;
            solutionIndex.push({ examName: examName, solution: solutionName, solutionLink: link.link })
                /* //search for the corresponding exam
                const examName = fileName.replace("_lsg.pdf", ".pdf");
                console.log(examName)
                const examLink = pdfLinks.find(element => element.link == examName);
                if (examLink == undefined) {
                    console.error(`Could not find exam for ${link.link}.`);
                } else {
                    index[examLink.name].solution = link.link;
                    index[examLink.name].solutionFileName = fileName;
                } */
        } else {
            const examLink = link.link;
            const examName = link.name;
            index[examName] = { link: examLink, fileName: fileName, solution: "", solutionFileName: "" }
        }
        try {
            printProgress(`Downloading: ${link.link}`);
            if (!dryRund) {
                await downloadPDF(link.link, directory);
                printProgress(`Downloaded: ${link.link}`);
            } else {
                printProgress("Dry run, not downloading anything.")
            }
        } catch (error) {
            console.error(`Failed to download ${link.link}. Error: ${error.message}`);
        }

        // Add a delay between each download to avoid getting blocked by the server
        if (!dryRund) {
            await new Promise(resolve => setTimeout(resolve, downloadDelay));
        }
    }

    //Match solutions to exams
    console.log(index)
    for (const solution of solutionIndex) {

        //get property in index that matches the exam name
        exam = Object.keys(index).find(key => index[key].fileName === solution.examName);

        console.log(exam);
        if (exam == undefined) {
            console.error(`Could not find exam for ${solution.examName}.`);
            index[solution.examName] = { link: "", fileName: "", solution: solution.solutionLink, solutionFileName: solution.solution }
        } else {
            index[exam].solution = solution.solutionLink;
            index[exam].solutionFileName = solution.solution;
        }
    }


    const indexFilePath = path.join(directory, '_index.json');
    fs.writeFileSync(indexFilePath, JSON.stringify(index, null, 2));
}

function printProgress(message) {
    if (!silent) {
        printProgress(message);
    }
}