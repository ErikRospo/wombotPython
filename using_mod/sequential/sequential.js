const task = require("./index.js");
const Rest = require("./rest.js");
const styles = require("./styles.js");
const download=require("./download.js");
const fs=require("fs");
const quiet = false;
const inter = false;
const final = true;

async function generate(prompt, style, prefix,input_image=false) {
    function handler(data, prefix) {
        switch (data.state) {
            case "authenticated":
                if (!quiet) console.log(`${prefix}Authenticated, allocating a task...`);
                break;
            case "allocated":
                if (!quiet) console.log(`${prefix}Allocated, submitting the prompt and style...`);
                break;
            case "submitted":
                if (!quiet) console.log(`${prefix}Submitted! Waiting on results...`);
                break;
            case "progress":
                let current = data.task.photo_url_list.length;
                let max = styles.steps.get(style) + 1;
                if (!quiet) console.log(`${prefix}Submitted! Waiting on results... (${current}/${max})`);
                break;
            case "generated":
                if (!quiet) console.log(`${prefix}Results are in, downloading the final image...`);
                break;
            case "downloaded":
                if (!quiet) console.log(`${prefix}Downloaded!`);
                break;
        }
    }

    let res = await task(prompt, style, (data) => handler(data, prefix), {final, inter}, input_image);
    if (!quiet && final)
        console.log(`${prefix}Your results have been downloaded to the following files:`);
    else if (!quiet)
        console.log(`${prefix}Task finished, the results are available at the following addresses:`);

    for (let inter of res.inter)
        console.log(inter);

    if (final) console.log(res.path);
    else console.log(res.url);
    return res
}

// (async () => {
//     let prompt = argc._[0];
//     let style = +argc._[1] || 3;
//     if (!quiet)
//         console.log(`Prompt: \`${prompt}\`, Style: \`${styles.get(style)}\``);

//     for (let n = 0; n < +argc.times; n++) {
//         const prefix = argc.times == 1 ? `` : `${n+1}: `;
//         if (argc.noasync) await generate(prompt, style, prefix);
//         else generate(prompt, style, prefix);
//     }
// })();
async function generate_sequential(prompt,style,times){
    let last_image={};
    for (let n=0;n<times;n++){
        let res=await generate(prompt,style,`${n+1}: `,last_image);
        let limage=fs.readFileSync(res.path).toString('base64');
        last_image={
            image_weight:'HIGH',
            media_suffix:'jpeg',
            input_image:limage
        }   
    }
}
generate_sequential("a red sunset over a beach",40,3)