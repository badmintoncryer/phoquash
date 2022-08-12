import React from 'react'
// import EXIF from "exif-js";
// import loadImage, { MetaData } from "blueimp-load-image";
// import picture from "../../../temp/picture/IMG_5309.jpg";

// const loadImage = async (url: string) => {
//   const image = new Image();
//   image.src = url;
//   await new Promise((resolve) => {
//     image.onload = resolve;
//   });

//   return image;
// };

// const loadImageToCanvas = async (url: string) => {
//   const image = await loadImage(
//     picture,
//     (
//       img: HTMLImageElement | Event | HTMLCanvasElement,
//       data: MetaData | undefined
//     ) => console.log({ data }),
//     { orientation: true }
//   );
//   console.log({ image });
// };

// const getExifData = (url: string) => {
//   const exifData = EXIF.getData(picture, () => {
//     console.log("test");
//     const orientation = EXIF.getTag(this, "Orientation");
//     console.log({ orientation });
//   });
//   console.log({ exifData });
// };
// const url =
//   "https://user-images.githubusercontent.com/64848616/173073397-d6354780-83d3-48b5-8ed0-0416b1d98c24.jpg";

// const load = async () => {
// console.log("start loading");
// loadImageToCanvas(url);

// const picture = await loadImage(url);
// console.log({ picture });
// getExifData(url);
// };

const TravelRecord = () => {
  // load();
  return <div></div>
}

export default TravelRecord
