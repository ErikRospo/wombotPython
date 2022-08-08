const sequential = require("./sequential.js");
const fs = require("fs");
const mkdirp = require("mkdirp");
const sample = "../lyrics_sample.txt";
const download = require("./download.js");
samples_array = fs.readFileSync(sample).toString().split("\n");

(async function() {
  let res = await sequential.generate_from_array(samples_array, 15, 15);

  let dir = "./generated/result" + Date.now();
  mkdirp(dir);
  fs.writeFileSync(dir + "/result.txt", JSON.stringify(res, null, 2));
  for (let i = 0; i < res.length; i++) {
    mkdirp(dir + "/" + i);
    download(dir + "/" + i + "/0.jpg", res[i].url);
  }
})();
