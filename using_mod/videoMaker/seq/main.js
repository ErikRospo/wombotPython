const sequential = require("./sequential.js");
const fs = require("fs");
const mkdirp = require("mkdirp");
const sample = "../lyrics_sample.txt";
const download = require("./download.js");
const path = require("path");
samples_array = fs.readFileSync(sample).toString().split("\n");
const style = 15;
(async function() {
  const sarl = samples_array.length;
  sequential.generate_from_array(samples_array, style, 15).then((ff)=>{
  let res=ff
    let dir = path.resolve("./generated/result" + Date.now());
  mkdirp(dir);

  // fs.writeFileSync(dir + "/result.txt",JSON.stringify(res,null,4));
  // fs.writeFileSync(dir + "/result.txt", JSON.stringify(res, null, 2));
  for (let i = 0; i < res.length; i++) {
    mkdirp(dir + "/" + i);
    download(res[i].url, dir + "/" + i + "/0.jpg");
  }
  for (let i = 0; i < res.length; i++) {
    let pr = "";
    sequential.generate_sequential(
      samples_array[i % sarl],
      style,
      5,
      dir + "/" + i + "/res1/",
      res[i].url
    );
    sequential.generate_sequential(
      samples_array[(i % sarl) + 1],
      style,
      5,
      dir + "/" + i + "/res2/",
      res[(i + 1) % sarl].url
    );
  }
})})();
