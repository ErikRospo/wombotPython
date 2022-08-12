/* eslint-disable no-constant-condition */
const { task } = require("./index.js");
const styles = require("./styles.js");
const fs = require("fs");
const settings=require("./settings");

const colors=require("./colors");
const imagepixels = require("image-pixels");
// const imageoutput = require("image-output");
const imageencode = require("image-encode");
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
                    if (waited<5){
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
    function processImages(images){
        // fs.readFileSync(images[imageIndex].path).toString("base64");
        // let imageIndex=image.index;
        let imageDataList=[];
        let imageList=[];
        for (let i=Math.max(0,images.length-10);i<images.length;i++){
            imageList.push(fs.readFileSync(images[i].path));
        }
        const imageHeight=1568;
        const imageWidth=960;
        
        // then, get the image data from the image data list
        for (let i=0;i<imageList.length;i++){
            imageDataList.push(imagepixels(imageList[i]));
        }
        // then, get the image data from the image data list
        for (let i=0;i<imageDataList.length;i++){
            imageDataList[i]=imageDataList[i].data;
        }
        let imageData=imageDataList[0];
        for (let i=0;i<imageData.length;i++){
            for (let j=1;j<imageDataList.length;j++){
                imageData[i]+=imageDataList[j][i]/j;
            }
            imageData[i]/=Math.sqrt(imageDataList.length);
        }
        imageData=imageData.map((x) => Math.round(x));
        let image=imageencode(imageData,"jpg",{"width":imageWidth,"height":imageHeight});
        return image.toString("base64");
    }
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
            let ii=processImages(images);
            lastImage={
                // eslint-disable-next-line camelcase
                input_image:ii,
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