const gnd=require("../get_next_data.js");
let style_timeout = 0;
let style_cache;
function get_styles(force_refresh) {
    
    if (new Date().getTime() >= style_timeout || force_refresh) {
        return new Promise(async (resolve, reject) => {
            try{
            let res = await gnd.update_all("./styles.json","./styles.js");
            
            // style_cache = res.artStyles;
            style_timeout = Date.now()+(60*60*1000*24);
            resolve(style_cache);
            }catch(e){
                reject(e);
            }
        });
    } else {
        return new Promise((resolve) => {
            resolve(style_cache);
        });
    }
}
module.exports={get_styles};
get_styles();