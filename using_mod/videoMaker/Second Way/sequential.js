/* eslint-disable no-constant-condition */
const { task } = require("./index.js");
const styles = require("./styles.js");
const fs = require("fs");
const settings=require("./settings");

const colors=require("./colors");
const quiet=settings.quiet||false;
const inter=settings.inter||false;
const final=true;
async function generate(
    prompt,
    style,
    prefix,
    inputImage = false,
    downloadDir = "./generated",
    iteration_ = 0
) {
    let waited=0;
    function handler(data, prefix) {
        switch (data.state) {
        case "authenticated":
            if (!quiet) colors.printGreen(`${prefix}Authenticated`);
            break;
        case "allocated":
            if (!quiet) colors.printBlue(`${prefix}Allocated`);
            break;
        case "submitted":
            if (!quiet) colors.printGreen(`${prefix}Submitted`);
            break;
        case "progress":
            // eslint-disable-next-line no-case-declarations
            let progress = data.task.photo_url_list.length;
            if (progress != 0) {
                if (!quiet)
                    colors.printYellow(
                        `${prefix}Submitted (${
                            data.task.photo_url_list.length
                        }/${styles.steps.get(style)})`
                    );
            } else {
                waited++;
                if (!quiet){ 
                    if (waited<10){
                        colors.printRed(`${prefix}Waiting ${waited}`);
                
                    } else {
                        colors.printAlert(`${prefix}Waiting ${waited}`);
                    
                    }
                }
            }
            break;
        case "generated":
            if (!quiet) colors.printGreen(`${prefix}Generated`);
            break;
        case "downloaded":
            if (!quiet) colors.printBlue(`${prefix}Downloaded`);
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
async function generateLaggySequential(
    prompts,
    style,
    times,
    weighting,
    directory = Date.now(),
    inputImage = false
) {
    
    let lastImage = {};
    if (inputImage) {
        lastImage = inputImage;
    }
    let images={};
    for (let n=0;n<prompts.length;n++) {
        let prompt=prompts[n];
        for (let i=0;i<times;i++){
            
            let imgID=(i+times*n);
            let imageIndex=Math.max(imgID-weighting,0);
            
            let prefix = `${imgID + 1}/${(times) * (prompts.length)}: `;
            let res=await generate(
                prompt,
                style,
                prefix,
                lastImage,
                `${directory}/${imgID}`
            );
            
            images[imgID]={
                "res":res,
                "imageIndex":imageIndex,
                "prompt":prompt,
                "style":style,
                "weighting":weighting,
                "directory":directory,
                "path":res.path
            };
            lastImage={
                // eslint-disable-next-line camelcase
                input_image:fs.readFileSync(images[imageIndex].path).toString("base64"),
                // eslint-disable-next-line camelcase
                media_suffix:"jpeg",
                // eslint-disable-next-line camelcase
                image_weight:"HIGH"
            };
        }
    }
    return images;
}

module.exports.generate = generate;
module.exports.generateLaggySequential = generateLaggySequential;