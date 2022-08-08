/* eslint-disable no-constant-condition */
const task = require("./index.js");
const styles = require("./styles.js");
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
    inputImage = false,
    downloadDir = "./generated",
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
            // eslint-disable-next-line no-case-declarations
            if (!quiet)
                console.log(
                    `${prefix}Submitted! Waiting on results... (${data.task.photo_url_list.length}/${styles.steps.get(style) + 1})`
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
        { final, inter, downloadDir},
        inputImage,
        iteration_,
        prefix
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

async function generateSequential(
    prompt,
    style,
    times,
    directory = Date.now(),
    inputImage = false
) {
    let lastImage = {};
    if (inputImage) {
        lastImage = inputImage;
    }

    const downloadDir = `./generated/${directory}/`;
    for (let n = 0; n < times; n++) {
        console.log(`${n + 1}/${times} Started`);
        let res = await generate(
            prompt,
            style,
            `${n + 1}: `,
            lastImage,
            downloadDir,
            n
        );
        let limage = fs.readFileSync(res.path).toString("base64");
        lastImage = {
              
            // eslint-disable-next-line camelcase
            image_weight: "MEDIUM",
            // eslint-disable-next-line camelcase
            media_suffix: "jpeg",
            // eslint-disable-next-line camelcase
            input_image: limage
        };
        console.log(`${n + 1}/${times} Finished`);
    }
}
async function generateFromArray(prompts, style) {
    let images = [];
    let limit = 4;
    if (prompts.length > limit) {
        for (let i = 0; i < Math.floor(prompts.length / limit); i++) {
            let promises = [];
            for (let j = 0; j < limit; j++) {
                let n = i * limit + j;
                promises.push(
                    generate(prompts[n], style, `${n + 1}/${prompts.length}: `)
                        .then(e => {
                            images.push(e);
                        })
                        .catch(e => {
                            console.log(e);
                        })
                );
            }

            await Promise.all(promises);
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
            while (true) {
                try {
                    let res = await generate(
                        prompts[n],
                        style,
                        `${n + 1}/${prompts.length}: `
                    );
                    images.push(res);
                    break;
                } catch (e) {
                    console.log(e);
                }
            }
            // generate(prompts[n], style, `${n + 1}/${prompts.length}: `)
            //   .then(e => {
            //     images.push(e);
            //   })
            //   .catch(e => {
            //     console.log(e);
            //   });
        }
    }
    return images;
}
if (require.main === module) {
    generateSequential(
        settings.prompt,
        settings.style,
        settings.iterations,
        settings.file_folder
    );
}

module.exports.generate = generate;
module.exports.generateSequential = generateSequential;
module.exports.generateFromArray = generateFromArray;
