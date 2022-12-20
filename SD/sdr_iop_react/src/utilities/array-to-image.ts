/**
 * @function getDataUrlFromArr
 * @param {Uint8ClampedArray} arr
 * @param {int} w
 * @param {int} h
 * @returns {string}
 */
export function getDataUrlFromArr(arr: Uint8ClampedArray, w?: number, h?: number): string {
  if(typeof w === 'undefined' || typeof h === 'undefined') {
    w = h = Math.sqrt(arr.length / 4);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;
  if (ctx){
  const imgData = ctx.createImageData(w, h);
  imgData.data.set(arr);
  ctx.putImageData(imgData, 0, 0);
  }
  return canvas.toDataURL();
}

/**
 * @function getImgFromDataUrl
 * @param {string} data
 * @returns {HTMLImageElement}
 */
export function getImgFromDataUrl(data: string): HTMLImageElement {
  const img = document.createElement('img');
  img.src = data;
  return img;
}

/**
 * @function getImgFromArr
 * @param {Uint8ClampedArray} arr
 * @param {int} w
 * @param {int} h
 * @returns {HTMLImageElement}
 */
export function getImgFromArr(arr: Uint8ClampedArray, w: number, h: number): HTMLImageElement {
  return getImgFromDataUrl(getDataUrlFromArr(arr, w, h));
}
export function transformImage(imagedata: ImageData): number[][] {
  let imgarr: number[][] = []
  let s = 0

  for (let x = 0; x < imagedata.width; x++) {
      let temparr: number[] = [];
      for (let y = 0; y < imagedata.height; y++) {

          temparr.push(imagedata.data[(y * imagedata.width + x) * 4])
      }
      imgarr.push(temparr)
  }
  console.log(s)
  console.log(imgarr)

  return imgarr
}
export function transformData(data: number[][],transparency?:number): ImageData | undefined {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
      let imagedata = ctx.createImageData(data.length, data[0].length)
      let s = 0
      for (let x = 0; x < imagedata.width; x++) {
          for (let y = 0; y < imagedata.height; y++) {
              imagedata.data[(x + y * imagedata.width) * 4] = data[x][y]
              imagedata.data[(x + y * imagedata.width) * 4 + 1] =data[x][y]
              imagedata.data[(x + y * imagedata.width) * 4 + 2] =data[x][y]
              imagedata.data[(x + y * imagedata.width) * 4 + 3] = 255
              s += data[x][y]
          }
      }
      console.log(s)
      console.log(imagedata)
      return imagedata
  }
}