# Google Coding Competitions Tester

This script allows you to automatically test your solutions for archived Google coding competitions, such as Kickstart and Code Jam. The competitions are no longer active, but you can still practice with past problems and test your code against the provided test cases.

## Features
- Automatically fetches test cases from the official competition archive on GitHub.
- Compiles and runs your C++ solution against those test cases.
- Compares the program's output with the expected results and reports whether your solution passed or failed each test.

## Prerequisites

Ensure the following software is installed on your machine:
- **Node.js**: To run the script.
- **C++ Compiler** (e.g., `g++`): To compile your solution.
- **Required Node.js packages**: Axios, Cheerio, and fs.

You can install the required packages by running:

```bash
npm install axios cheerio
```
## Configurations

Add env for input, output and code file paths and update index.js script with problem information including KICKSTART_YEAR, KICKSTART_ROUND, KICKSTART_QNAME and run the script using:

```bash
node index.js
```



