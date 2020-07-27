export default function createBitmap(image) : createjs.Bitmap {
    const bitmap = new createjs.Bitmap(image);
    bitmap.rotation = -25 | 0;
    bitmap.regX = (bitmap.image.width / 2) | 0;
    bitmap.regY = (bitmap.image.height / 2) | 0;
    bitmap.name = "flower";
    bitmap.cursor = "pointer";
    return bitmap;
}