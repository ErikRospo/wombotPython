const task = require("./index.js");
const Rest = require("./rest.js");
const styles = require("./styles.js");
const download = require("./download.js");
const fs = require("fs");
const quiet = true;
const inter = true;
const final = true;
let settings=JSON.parse(fs.readFileSync("./settings.json"))
async function generate(prompt, style, prefix, input_image = false,download_dir="./generated",iteration_=0) {
  function handler(data, prefix) {
    switch (data.state) {
      case "authenticated":
        if (!quiet) console.log(`${prefix}Authenticated, allocating a task...`);
        break;
      case "allocated":
        if (!quiet)
          console.log(`${prefix}Allocated, submitting the prompt and style...`);
        break;
      case "submitted":
        if (!quiet) console.log(`${prefix}Submitted! Waiting on results...`);
        break;
      case "progress":
        let current = data.task.photo_url_list.length;
        let max = styles.steps.get(style) + 1;
        if (!quiet)
          console.log(
            `${prefix}Submitted! Waiting on results... (${current}/${max})`
          );
        break;
      case "generated":
        if (!quiet)
          console.log(
            `${prefix}Results are in, downloading the final image...`
          );
        break;
      case "downloaded":
        if (!quiet) console.log(`${prefix}Downloaded!`);
        break;
    }
  }

  let res = await task(
    prompt,
    style,
    data => handler(data, prefix),
    { final, inter,download_dir },
    input_image,iteration_
  );
  if (!quiet && final)
    console.log(
      `${prefix}Your results have been downloaded to the following files:`
    );
  else if (!quiet)
    console.log(
      `${prefix}Task finished, the results are available at the following addresses:`
    );
  if (!quiet) {
    for (let inter of res.inter) {
      console.log(inter);
    }
    if (final) console.log(res.path);
    else console.log(res.url);
  }

  return res;
}


async function generate_sequential(prompt, style, times,directory=Date.now()) {
  let last_image = {};
  const download_dir=`./generated/${directory}/`
  for (let n = 0; n < times; n++) {
    console.log(`${n+1}/${times} Started`)
    let res = await generate(prompt, style, `${n + 1}: `, last_image,download_dir,n);
    let limage = fs.readFileSync(res.path).toString("base64");
    last_image = {
      image_weight: "MEDIUM",
      media_suffix: "jpeg",
      input_image: limage
    };
    console.log(`${n+1}/${times} Finished`)
    
  }
}
if (require.main === module) {
  generate_sequential(settings.prompt,settings.style, settings.iterations,settings.file_folder);
}
module.exports.generate = generate;
module.exports.generate_sequential = generate_sequential;