import fs from "fs";
import path from "path";

const MAX_LEN = 5;
const SUBSET = "1234567890qwertyuioplkjhgfdsazxcvbnm";

export const generateId = (): string => {
  let ans = "";
  for (let i = 0; i < MAX_LEN; i++) {
    ans += SUBSET[Math.floor(Math.random() * SUBSET.length)];
  }
  return ans;
};

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};
