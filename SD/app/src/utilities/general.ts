export function grid(width:number,height:number,value?:any): any[][]{
    let t:any[][]=[]
    let v:any[]
    for (let x = 0; x < width; x++) {
        v=[]
        for (let y = 0; y < height; y++) {
            v.push(value)            
        }        
        t.push(v)
    }
    return t
}
export function nullGrid(width:number,height:number): null[][]{
    let t:any[][]=[]
    let v:any[]
    for (let x = 0; x < width; x++) {
        v=[]
        for (let y = 0; y < height; y++) {
            v.push(null)            
        }        
        t.push(v)
    }
    return t
}