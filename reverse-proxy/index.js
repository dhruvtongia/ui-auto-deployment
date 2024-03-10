const express = require("express");
const { S3 } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  Bucket: "vercel-output-bucket",
});

const app = express();

app.get("/*", async (req, res) => {
  const host = req.hostname;

  const id = host.split(".")[0];
  let filePath = req.path;
  if (filePath === "/") {
    filePath += "index.html";
  }
  console.log("fp: ", filePath);

  const contents = await s3.getObject({
    Bucket: "vercel-output-bucket",
    Key: `__output/${id}${filePath}`,
  });

  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "application/javascript";
  res.set("Content-Type", type);

  res.send(contents.Body);
});

app.listen(3001, () => {
  console.log(`service listening on port: 3001`);
});
