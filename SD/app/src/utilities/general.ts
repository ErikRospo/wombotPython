export function grid(width: number, height: number, value?: any): any[][] {
    let t: any[][] = []
    let v: any[]
    for (let x = 0; x < width; x++) {
        v = []
        for (let y = 0; y < height; y++) {
            v.push(value)
        }
        t.push(v)
    }
    return t
}
export function nullGrid(width: number, height: number): null[][] {
    let t: any[][] = []
    let v: any[]
    for (let x = 0; x < width; x++) {
        v = []
        for (let y = 0; y < height; y++) {
            v.push(null)
        }
        t.push(v)
    }
    return t
}
export function roundto(value: number, base: number): number {
    return Math.round(value / base) * base
}

export function floorto(value:number,base:number):number{
	return Math.floor(value/base)*base;
}
export function ceilto(value:number,base:number):number{
	return Math.ceil(value/base)*base;
}




export function round(value: number, places: number): number {
    return roundto(value, 10 ** places)
}
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function postData(url = '', data = {},headers={}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response // parses JSON response into native JavaScript objects
}
