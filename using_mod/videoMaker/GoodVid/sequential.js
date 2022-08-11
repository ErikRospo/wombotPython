/* eslint-disable no-constant-condition */
const { task } = require("./index.js");
const styles = require("./styles.js");
const fs = require("fs");
const settings=JSON.parse(fs.readFileSync("settings.json"));
const quiet=settings.quiet||true;
const inter=settings.inter||false;
const final=settings.final||true;
async function generate(
    prompt,
    style,
    prefix,
    inputImage = false,
    downloadDir = "./generated",
    iteration_ = 0
) {
    let warned = false;
    function handler(data, prefix) {
        switch (data.state) {
        case "authenticated":
            if (!quiet) console.log(`${prefix}AUTH`);
            break;
        case "allocated":
            if (!quiet) console.log(`${prefix}ALLOC`);
            break;
        case "submitted":
            if (!quiet) console.log(`${prefix}SUB`);
            break;
        case "progress":
            // eslint-disable-next-line no-case-declarations
            let progress = data.task.photo_url_list.length;
            if (progress != 0) {
                if (!quiet)
                    console.log(
                        `${prefix}SUBPR (${
                            data.task.photo_url_list.length
                        }/${styles.steps.get(style)})`
                    );
            } else {
                if (!warned) {
                    if (!quiet) console.log(`${prefix}WAIT`);
                    warned = true;
                }
            }
            break;
        case "generated":
            if (!quiet) console.log(`${prefix}GEN`);
            break;
        case "downloaded":
            if (!quiet) console.log(`${prefix}DLD`);
            break;
        }
    }

    let res = await task(
        prompt,
        style,
        (data) => handler(data, prefix),
        { final, inter, downloadDir },
        inputImage,
        iteration_,
        prefix
    );

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
    for (let n = 0; n < prompts.length; n++) {
        let res = await generate(
            prompts[n],
            style,
            `${n + 1}/${prompts.length}: `
        );
        images.push(res);
    }
    return images;
}

module.exports.generate = generate;
module.exports.generateSequential = generateSequential;
module.exports.generateFromArray = generateFromArray;
