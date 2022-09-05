const identify=require("./identify");
const fs=require("fs");
identify().then(res=>{
    fs.writeFileSync('./idtoken.jwt',res)
    console.log(res)
})