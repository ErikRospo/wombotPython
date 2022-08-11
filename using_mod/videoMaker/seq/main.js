const sequential = require("./sequential.js");
const fs = require("fs");
const mkdirp = require("mkdirp");
const download = require("./download.js");
const path = require("path");
const imagepixels = require("image-pixels");
const imageoutput = require("image-output");
const imageencode = require("image-encode");
const { exit } = require("process");
const settings=require("./settings.js");
let samplesArray = fs
    .readFileSync(settings.samplePath)
    .toString()
    .replace("\r\n", "\n")
    .split("\n")
    .filter((v) => {
        return v.length>2;
    });
if (settings.logPrompts) console.log(samplesArray);
const style = settings.style;
(async function () {
    sequential.generateFromArray(samplesArray, style, 15).then(
        async (ff) => {
            let res = ff;
            let dir = path.resolve("./generated/result" + Date.now());
            mkdirp(dir);

            // fs.writeFileSync(dir + "/result.txt",JSON.stringify(res,null,4));
            // fs.writeFileSync(dir + "/result.txt", JSON.stringify(res, null, 2));
            let imagePaths = [];
            let dirPaths = [];

            for (let i = 0; i < res.length; i++) {
                await mkdirp(dir + "/" + i);
                dirPaths.push(path.resolve(dir + "/" + i));
                await download(res[i].url, dir + "/" + i + "/0.jpg");
                imagePaths.push(path.resolve(dir + "/" + i + "/0.jpg"));
            }
            // we want to interpolate between the images
            // by first generating based off of the just the first image
            // than, based off of a weighted average of the first and second image, about (0.1/0.9)
            // than, based off of a weighted average of the first and second image, about (0.2/0.8)
            // etc...
            // than, based off of a weighted average of the first and second image, about (0.9/0.1)
            // finally, based off of the second image
            // this will give us a smooth (ish) transition between the images
            // we then do this for each image pair in our sequence
            // once we have all of these images, we can make a video out of them
            // we can also make a video out of the original images, if we want

            function mix(first, second, weight) {
                return first * weight + second * (1 - weight);
            }
            let allPaths = [];
            for (let i = 0; i < res.length; i++) {
                let first = await imagepixels(imagePaths[i]);
                let second;
                if (i != res.length - 1) {
                    second = await imagepixels(imagePaths[i + 1]);
                } else {
                    second = await imagepixels(imagePaths[0]);
                }
                try {
                    fs.mkdirSync(dirPaths[i], { recursive: true });
                } catch {
                    console.log("mkdir failed");
                    exit(1);
                }
                for (let j = 1; j < 10; j++) {
                    let weight = 1 - j / 10;
                    let newImage = new Uint8Array(first.data.length);
                    let prefix=`i:${i + 1}/${res.length},j:${j + 1}/10: `.padEnd(22," ");
                    console.log(`${prefix}AS`);

                    for (let k = 0; k < first.data.length; k++) {
                        newImage[k] = Math.floor(
                            mix(first.data[k], second.data[k], weight)
                        );
                    }
                    console.log(`${prefix}AD`);
                    let ii = imageencode(
                        newImage,
                        [first.width, first.height],
                        "jpeg"
                    );
                    console.log(`${prefix}GS`);

                    imageoutput(
                        {
                            data: newImage,
                            width: first.width,
                            height: first.height
                        },
                        dirPaths[i] + "/" + (j) + "source.jpg"
                    );
                    let resim=await sequential.generate(
                        samplesArray[(i+Math.round(1-j/10))%samplesArray.length],
                        style,
                        prefix,
                        {
                            // the reason we choose high is to try to make the images similar to the starting
                            // image, thus (Hopefully) reducing flickering.
                            // eslint-disable-next-line camelcase
                            image_weight: "HIGH",
                            // eslint-disable-next-line camelcase
                            media_suffix: "jpeg",
                            // eslint-disable-next-line camelcase
                            input_image: ii.toString("base64")
                        },
                        dirPaths[i] + "/" + 10-j + ".jpg"
                    );
                    await download(resim.url, dirPaths[i] + "/" + j + ".jpg");
                    console.log(`${prefix}GD`);

                    allPaths.push(path.resolve(dirPaths[i] + "/" + j + ".jpg"));
                }
            }
            fs.writeFileSync("path.txt",dir);

            let ap=[allPaths,imagePaths].flat();
            ap.sort((a,b) => {
                let a1=parseInt(a.split("/").slice(-1)[0].split(".")[0]);
                let b1=parseInt(b.split("/").slice(-1)[0].split(".")[0]);
                let a2=parseInt(a.split("/").slice(-2)[0]);
                let b2=parseInt(b.split("/").slice(-2)[0]);
                if(a2==b2){
                    return a1-b1;
                }
                return a2-b2;
            });
            fs.writeFileSync(dir + "/allPaths.txt",ap.join("\n"));
        },
        (e) => {
            console.log(e);
        }
    );
})();
