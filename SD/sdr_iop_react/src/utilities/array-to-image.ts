/**
 * @function getDataUrlFromArr
 * @param {Uint8ClampedArray} arr
 * @param {int} w
 * @param {int} h
 * @returns {string}
 */
export function getDataUrlFromArr(arr: Uint8ClampedArray, w: number, h: number): string {
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