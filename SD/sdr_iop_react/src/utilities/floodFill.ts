export function floodFill(image: number[][], sr: number, sc: number, newColor: number): number[][] {
    //Get the input which needs to be replaced.
    const current = image[sr][sc];

    //If the newColor is same as the existing 
    //Then return the original image.
    if (current === newColor) {
      return image;
    }

    //Other wise call the fill function which will fill in the existing image.
    fill(image, sr, sc, newColor, current,0);

    //Return the image once it is filled
    return image;
  }

  function fill(image: number[][], sr: number, sc: number, newColor: number, current: number,depth:number): void {
    //If row is less than 0
    if (sr < 0) {
      return;
    }

    //If column is less than 0
    if (sc < 0) {
      return;
    }

    //If row is greater than image length
    if (sr > image.length - 1) {
      return;
    }

    //If column is greater than image length
    if (sc > image[sr].length - 1) {
      return;
    }

    //If the current pixel is not which needs to be replaced
    if (image[sr][sc] !== current) {
      return;
    }

    //Update the new color
    image[sr][sc] = newColor;
    if (depth>10){
      return;
    }

    //Fill in all four directions
    //Fill Prev row
    fill(image, sr - 1, sc, newColor, current,depth+1);

    //Fill Next row
    fill(image, sr + 1, sc, newColor, current,depth+1);

    //Fill Prev col
    fill(image, sr, sc - 1, newColor, current,depth+1);

    //Fill next col
    fill(image, sr, sc + 1, newColor, current,depth+1);

  }