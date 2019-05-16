import{
    v3_tiny_model,
    v3_tiny_anchors,
    faceClasses,
    predict,
} from './yoloProcess';

const MAX_BOXES = 20;
const SCORE_THRESHOLD = .5;
const IOU_THRESHOLD = .45;

export const v3_tiny_model_url=v3_tiny_model;
export async function yolo(
    model, image, imageSize) {

    return predict(
        "v3_tiny_model",
        model,
        image,
        MAX_BOXES,
        SCORE_THRESHOLD,
        IOU_THRESHOLD,
        faceClasses.length,
        v3_tiny_anchors,
        faceClasses,
        imageSize)
}

export function letterbox(
    canvas,yoloSize)
{
    const oldShape=[canvas.height,canvas.width];
    const ratio= Math.min(yoloSize[0] / oldShape[0], yoloSize[1]/oldShape[1])
    const newSize=[oldShape[0]*ratio,oldShape[1]*ratio];

    const dh=(yoloSize[0]-newSize[0])/2;
    const dw=(yoloSize[1]-newSize[1])/2;

    const newCanvas=document.createElement("canvas");
    newCanvas.height=yoloSize[0];
    newCanvas.width=yoloSize[1];
    newCanvas.getContext("2d").drawImage(canvas, dw, dh, newSize[1], newSize[0]);
    return newCanvas

}

export function magicRectangle(context, x, y, width, height) {
    const ctx = context;
    ctx.strokeStyle = "rgb(0,151,229)";
    ctx.lineWidth = 8;
    let Point = function (x, y) {
        return {x: x, y: y};
    }
    let points = new Array();
    const r = 0.2 * Math.min(height, width);
    const we = 0.1 * width;
    const he = 0.1 * height;
    const wr = width - 2 * r - 2 * we;
    const hr = height - 2 * r - 2 * he;


    points.push(
        Point(x, y),
        Point(x + r, y),
        Point(x + r + we, y),
        Point(x + r + we + wr, y),
        Point(x + r + we + wr + we + r, y),
        Point(x + r + we + wr + we + r, y + r),
        Point(x + r + we + wr + we + r, y + r + he),
        Point(x + r + we + wr + we + r, y + r + he + hr),
        Point(x + r + we + wr + we + r, y + r + he + hr + he + r),
        Point(x + r + we + wr + we, y + r + he + hr + he + r),
        Point(x + r + we + wr, y + r + he + hr + he + r),
        Point(x + r + we, y + r + he + hr + he + r),
        Point(x, y + r + he + hr + he + r),
        Point(x, y + r + he + hr + he),
        Point(x, y + r + he + hr),
        Point(x, y + r + he));
    ctx.beginPath();
    ctx.moveTo(points[1].x, points[1].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.moveTo(points[3].x, points[3].y);
    ctx.arcTo(points[4].x, points[4].y, points[6].x, points[6].y, r)
    ctx.lineTo(points[6].x, points[6].y);
    ctx.moveTo(points[7].x, points[7].y);
    ctx.arcTo(points[8].x, points[8].y, points[9].x, points[9].y, r)
    ctx.lineTo(points[10].x, points[10].y);
    ctx.moveTo(points[11].x, points[11].y);
    ctx.arcTo(points[12].x, points[12].y, points[13].x, points[13].y, r)
    ctx.lineTo(points[14].x, points[14].y);
    ctx.moveTo(points[15].x, points[15].y);
    ctx.arcTo(points[0].x, points[0].y, points[1].x, points[1].y, r)
    ctx.stroke();
}
