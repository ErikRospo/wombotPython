type ImageSrc = string |undefined;

/**
 * @param {number} width The width of the end tiles. *NOT* the length of `images`
 * @param {number} height The height of the end tiles. *NOT* the length of `images[n]`
 * @param {ImageSrc[][]} images A list of lists of the image's sources. Can be a string
 */
export function createImageTile(width: number, height: number, images: ImageSrc[][]): ImageRectangle[][] {
    let newEl:ImageRectangle[][]=[]
    for (let x = 0; x < images.length; x++) {
        let tempList:ImageRectangle[]=[];
        for (let y = 0; y < images[x].length; y++) {
            let element = images[x][y];
            tempList.push({x:x*width,y:y*height,width:width,height:height,image:element})
            
        }        
        newEl.push(tempList)
    }
    return newEl
}
export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageRectangle extends Rectangle {
    image: ImageSrc
}