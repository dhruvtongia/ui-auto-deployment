import express from "express";
import cors from "cors";
import { generateId, getAllFiles } from "./utils/generateId";
import { simpleGit, SimpleGit, CleanOptions } from "simple-git";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
const git: SimpleGit = simpleGit().clean(CleanOptions.FORCE);

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generateId();
  const localPath = path.join(__dirname, `/out/${id}`);
  git.clone(repoUrl, localPath);

  const allFiles = getAllFiles(localPath);
  // put all the files in S3. Since we can't directly upload a folder to s3 we, upload all files one by one
  res.json({ id });
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
