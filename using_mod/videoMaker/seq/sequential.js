const task = require("./index.js");
const Rest = require("./rest.js");
const styles = require("./styles.js");
const download = require("./download.js");
const fs = require("fs");

let settings = JSON.parse(fs.readFileSync("./settings.json"));
let quiet = false;
let inter = false;
let final = false;
if (typeof quiet === "undefined") {
  quiet = true;
}
if (typeof inter === "undefined") {
  inter = false;
}
if (typeof final === "undefined") {
  final = true;
}
async function generate(
  prompt,
  style,
  prefix,
  input_image = false,
  download_dir = "./generated",
  iteration_ = 0
) {
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
    { final, inter, download_dir },
    input_image,
    iteration_
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

async function generate_sequential(
  prompt,
  style,
  times,
  directory = Date.now()
) {
  let last_image = {};
  const download_dir = `./generated/${directory}/`;
  for (let n = 0; n < times; n++) {
    console.log(`${n + 1}/${times} Started`);
    let res = await generate(
      prompt,
      style,
      `${n + 1}: `,
      last_image,
      download_dir,
      n
    );
    let limage = fs.readFileSync(res.path).toString("base64");
    last_image = {
      image_weight: "MEDIUM",
      media_suffix: "jpeg",
      input_image: limage
    };
    console.log(`${n + 1}/${times} Finished`);
  }
}
async function generate_from_array(prompts, style) {
  let images = [];
  let limit = 4;
  if (prompts.length > limit) {
    for (let i = 0; i < Math.floor(prompts.length / limit); i++) {
      for (let j = 0; j < limit - 1; j++) {
        let n = i * limit + j;
        generate(prompts[n], style, `${n + 1}/${prompts.length}: `)
          .then(e => {
            images.push(e);
          })
          .catch(e => {
            console.log(e);
          });
      }
      let res = await generate(
        prompts[i * limit + (limit - 1)],
        style,
        `${i * limit + (limit - 1)}/${prompts.length}: `
      );
      images.push(res);
    }
    for (let i = 0; i < prompts.length % limit; i++) {
      let n = prompts.length - i - 1;
      let res = await generate(
        prompts[n],
        style,
        `${n + 1}/${prompts.length}: `
      );
      images.push(res);
    }
  } else {
    for (let n = 0; n < prompts.length; n++) {
      generate(prompts[n], style, `${n + 1}/${prompts.length}: `)
        .then(e => {
          images.push(e);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }
  return images;
}
if (require.main === module) {
  generate_sequential(
    settings.prompt,
    settings.style,
    settings.iterations,
    settings.file_folder
  );
}

module.exports.generate = generate;
module.exports.generate_sequential = generate_sequential;
module.exports.generate_from_array = generate_from_array;
