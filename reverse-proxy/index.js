const express = require("express");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
  region: "eu-north-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  Bucket: "vercel-output-bucket",
});

const app = express();
const PORT = process.env.PORT || 3000;
app.get("/api/health", (req, res) => {
  return res.status(200).json({ msg: "all good" });
});
app.get("/*", async (req, res) => {
  const host = req.hostname;

  const id = host.split(".")[0];
  let filePath = req.path;
  if (filePath === "/") {
    filePath += "index.html";
  }
  console.log("fp: ", filePath);

  const command = new GetObjectCommand({
    Bucket: "vercel-output-bucket",
    Key: `__output/${id}${filePath}`,
  });
  const contents = await s3.send(command);
  const str = await contents.Body.transformToString();
  // console.log(str);
  // console.log(contents);
  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : filePath.endsWith("svg")
    ? "image/svg+xml"
    : "application/javascript";
  res.set("Content-Type", type);

  res.send(str);
});

app.listen(PORT, () => {
  console.log(`service listening on port: ${PORT}`);
});
