const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs").promises;
const { exec } = require("child_process");

const KICKSTART =
  "https://github.com/google/coding-competitions-archive/tree/main/kickstart";
const KICKSTART_RAW =
  "https://raw.githubusercontent.com/google/coding-competitions-archive/main/kickstart";
const KICKSTART_YEAR = "2013";
const KICKSTART_ROUND = "round_a";
const KICKSTART_QNAME = "rational_number_tree";
const KICKSTART_TESTFOLDER = "data/secret";

const testFilePath =
  "/Users/nifasat/iCloud Drive (Archive)/Documents/coding pgs/input.txt";
const codeFilePath =
  "/Users/nifasat/iCloud Drive (Archive)/Documents/coding pgs/code.cpp";
const outputFilePath =
  "/Users/nifasat/iCloud Drive (Archive)/Documents/coding pgs/output.txt"

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';

// Combine the information to form the actual URL
const actualURL = `${KICKSTART}/${KICKSTART_YEAR}/${KICKSTART_ROUND}/${KICKSTART_QNAME}/${KICKSTART_TESTFOLDER}`;
const rawURL = `${KICKSTART_RAW}/${KICKSTART_YEAR}/${KICKSTART_ROUND}/${KICKSTART_QNAME}/${KICKSTART_TESTFOLDER}`;
async function fetchSubtasks() {
  return new Promise((res, rej) => {
    axios
      .get(actualURL)
      .then((response) => {
        const $ = cheerio.load(response.data);

        // Extract the JSON data from the script tag
        const embeddedDataScript = $(
          'script[data-target="react-app.embeddedData"]'
        ).html();

        if (embeddedDataScript) {
          // Parse the JSON data
          const embeddedData = JSON.parse(embeddedDataScript);

          // Extract subtask names from the tree structure
          const subtaskNames = embeddedData.payload.tree.items
            .filter(
              (item) =>
                item.contentType === "directory" &&
                item.name.startsWith("subtask")
            )
            .map((item) => item.name);

          res(subtaskNames);
        } else {
          console.error(
            "Script tag not found or does not contain the expected data."
          );
          rej("err");
        }
      })
      .catch((error) => {
        console.error(`Failed to fetch content. ${error.message}`);
        rej(error.message);
      });
  });
}
function compileCpp(filePath) {
  return new Promise((resolve, reject) => {
    exec(
      `g++ -std=c++14 "${filePath}" -o "${filePath.replace(".cpp", "")}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject(`Compilation failed: ${stderr}`);
        } else {
          resolve(`Compilation successful: ${stdout}`);
        }
      }
    );
  });
}

function runExecutable(executablePath) {
  return new Promise((resolve, reject) => {
    exec(`"${executablePath}" < "${testFilePath}" > "${outputFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        reject(`Execution failed: ${stderr}`);
      } else {
        resolve(`Execution successful: ${stdout}`);
      }
    });
  });
}

function checkSubtask(data, subtaskNumber){
    if(subtaskNumber >= data.length){
        return;
    }
    const subtask = data[subtaskNumber];
    const subtaskURL = `${rawURL}/${subtask}`;
    const testfileURL = `${subtaskURL}/1.in`;
    const answerFileURL = `${subtaskURL}/1.ans`;
    axios
      .get(testfileURL, { headers: { Accept: "text/plain" } })
      .then((res) => {
        fs.writeFile(testFilePath, res.data,'utf-8').then((res) => {
          compileCpp(codeFilePath).then((res) => {
            const executablePath = codeFilePath.replace(".cpp", "");
            runExecutable(executablePath).then(() => {
              axios.get(answerFileURL).then((answerRes) => {
                fs.readFile(outputFilePath, "utf-8").then((outputDataRes) => {
                  if (outputDataRes != answerRes.data) {
                    console.log((`${RED + subtask} - Failed${RESET}`));
                  } else {
                    console.log((`${GREEN + subtask} - Passed${RESET}`));
                  }
                  checkSubtask(data,subtaskNumber+1);
                });
              });
            });
          });
        });
    });
}

async function getFile() {
  const data = await fetchSubtasks();
  checkSubtask(data,0);
}

getFile();
