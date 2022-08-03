const task = require("./index.js");
const styles = require("./styles.js");
const fs = require("fs");
const quiet = false;
const inter = false;
const final = true;

async function generate(prompt, style, reference_image, prefix) {
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
    reference_image,
    data => handler(data, prefix),
    { final, inter }
  );
  if (!quiet && final)
    console.log(
      `${prefix}Your results have been downloaded to the following files:`
    );
  else if (!quiet)
    console.log(
      `${prefix}Task finished, the results are available at the following addresses:`
    );

  return res;
}

// (async () => {
//   let prompt = argc._[0];
//   let style = +argc._[1] || 3;
//   if (!quiet)
//     console.log(`Prompt: \`${prompt}\`, Style: \`${styles.get(style)}\``);

//   for (let n = 0; n < +argc.times; n++) {
//     const prefix = argc.times == 1 ? `` : `${n + 1}: `;
//     if (argc.noasync) await generate(prompt, style, prefix);
//     else generate(prompt, style, prefix);
//   }
// })();
let prompt_file = "prompts.txt";
let prompts = fs.readFileSync(prompt_file).toString().split("\n");
let i = 0;
//https://securetoken.googleapis.com/v1/token?key=AIzaSyDCvp5MTJLUdtBYEKYWXJrlLzu1zuKM6Xw
function do_one_iteration(i, resp) {
  let prompt = prompts[Math.floor(Math.random() * prompts.length)];
  let style = 3;
  console.log(`Prompt: \'${prompt}\', Style: \'${style}\'`);
  return generate(
    prompt,
    style,
    "https://lh3.googleusercontent.com/OQmz-rOkIfcqf5nJGOfwv8li1wPJp6-KNvqehBpeB96jylIqGJheg7wUA_uT8SYKrqt_EdgQxzlEKSplRw=w544-h544-l90-rj",
    `${i}: `
  );
}
do_one_iteration(i)
    .then(resp => {
      console.log(resp);
    })
    .catch(err => {
      console.log(err);
    });
  i++;
