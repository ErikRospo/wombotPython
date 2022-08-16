#!/home/erik/.nvm/versions/node/v18.7.0/bin/node
const sequential = require("./sequential.js");
const fs = require("fs");
const path = require("path");
const settings=JSON.parse(fs.readFileSync("./settings.json", "utf8"));
let samplesArray = fs
    .readFileSync(settings.samplePath)
    .toString()
    .replace("\r\n", "\n")
    .split("\n")
    .filter((v) => {
        return v.length>2;
    }).filter((v) => {
        return (v.indexOf("#")===-1)&(v.indexOf("[")===-1)&(v.indexOf("]")===-1);
    });
if (settings.logPrompts) console.log(samplesArray);
const style = settings.style;

(async function() {
    let start=Date.now();
    let dir=path.resolve(`./generated/${Date.now()}`);
    fs.mkdirSync(dir, { recursive: true });
    sequential.generateLaggySequential(samplesArray,style,settings.times,settings.weighting,dir,false).then((v) => {
        // console.log(v);
        let end=Date.now();
        console.log(`Finished in ${(end-start)/1000} seconds`);
        let r={
            "responses":v,
            "settings":settings,
            "timeStart":start,
            "timeEnd":end,
            "timeTotal":end-start,
            "timeSeconds":(end-start)/1000,
            "timePerSample":(end-start)/v.length
        };
        fs.writeFileSync(`${dir}/final.json`,JSON.stringify(r));
        fs.writeFileSync("path.txt",path.resolve(`${dir}/final.json`));
    }).catch((err) => {
        console.log(err);
    }).finally(() => {
        console.log("Done");
    });
})();
