<template>
    <a-card title="Camera">
        <a-button type="primary" @click="get" slot="extra" :disabled="disabled">Run</a-button>
        <div ref="yolo_div">

            <!--<a href="#" slot="extra">more</a>-->
            <div ref="error_message" style="display:none">
                Sorry! An error occured while loading the model 😢
                <br>
                If you're on an iPhone, please try using Safari.
            </div>
            <div ref="success_message" style="display:none">
                摄像头开启成功.. .<br/>
                【注意】网页会下载约5M的神经网络模型<br/>
                【注意】此外会预读取20帧空帧，请耐心等待...
            </div>

            <div class="webcam-ui-container" style="text-align: center">
                <a-spin tip="Loading..." :spinning="loading">
                    <div ref="webcam-wrapper" id="webcam-wrapper"
                         v-bind:style="{width:webcap_wrapper_width+'px' ,height:webcap_wrapper_height+'px'}">
                        <!--
                        <video ref="myvideo" width="288" height="288" playsinline autoplay muted ></video>
                        -->
                        <canvas ref="canvas" id="canvas" v-bind:width="canvas_width" v-bind:height="canvas_height"
                                style="margin: auto;"></canvas>
                    </div>
                </a-spin>
                <div>{{ matchRes }} {{matchScore}}</div>

            </div>
        </div>
    </a-card>
</template>

<script>
    import * as tf from "@tensorflow/tfjs"
    import postprocess from "./yoloProcess"
    import tip from './error.js'
    import api from '@/common/api'
    import axios from 'axios'                   // eslint-disable-line no-unused-vars


    import {
        v1_tiny_model,              // eslint-disable-line no-unused-vars
        v2_tiny_model,              // eslint-disable-line no-unused-vars
        v3_tiny_model,              // eslint-disable-line no-unused-vars
        v3_model,                   // eslint-disable-line no-unused-vars
        v1_tiny_anchors,            // eslint-disable-line no-unused-vars
        v2_tiny_anchors,            // eslint-disable-line no-unused-vars
        v3_tiny_anchors,            // eslint-disable-line no-unused-vars
        v3_anchors,                 // eslint-disable-line no-unused-vars
        faceClasses                 // eslint-disable-line no-unused-vars
    } from './yoloConfig';              // eslint-disable-line no-unused-vars
    const MAX_BOXES = 20;           // eslint-disable-line no-unused-vars
    const INPUT_SIZE = 288;         // eslint-disable-line no-unused-vars
    const SCORE_THRESHOLD = .5;     // eslint-disable-line no-unused-vars
    const IOU_THRESHOLD = .45;       // eslint-disable-line no-unused-vars

    const YOLO_HEIGHT = 352;
    const YOLO_WIDTH = 480;

    //    let this.canvas_width = 480;
    //    let this.canvas_height = 360;


    export default {
        name: "YoloWebCam",

        data() {
            return {
                canvas_width: 10,
                canvas_height: 10,
                webcap_wrapper_width: 100,
                webcap_wrapper_height: 100,
                matchRes: 0,
                matchScore: 0,
                matchTimes: 0,
                disabled: false,
                loading: false,
                cam_destory: true,
                stream: 0,
                new_stu_name: '',
                old_stu_name: '',
            }
        },
        watch: {
            new_stu_name() {
                if (this.new_stu_name != this.old_stu_name) {
                    if(localStorage.getItem("yearcheckinevent")!=undefined){
                        this.old_stu_name = this.new_stu_name;
                        this.openNotificationSuccess(this.new_stu_name);
                    }else {
                        this.openNotificationError();
                    }
                }
            }
        },
        mounted() {

            // 动态设置背景图的高度为浏览器可视区域高度


            // 首先在Virtual DOM渲染数据时，设置下背景图的高度．
//                this.clientHeight.height = `${document.documentElement.clientHeight}px`;
            // 然后监听window的resize事件．在浏览器窗口变化时再设置下背景图高度．
//            const that = this;

//            window.onresize = function temp() {

//            }
        },
        beforeDestroy() {
            const stream = typeof this.stream.stop === 'function' ? this.stream : this.stream.getTracks()[0]
            stream.stop();
        },
        methods: {
            openNotificationSuccess(info) {
                console.log(info)
                this.$notification.open({
                    message: '签到成功',
                    description: info,
                    icon: <a-icon type = 'smile' style = 'color: #108ee9' / >
            });
            },
            openNotificationError(info) {
                console.log(info)
                this.$notification.open({
                    message: '签到未开始',
                    description: info,
                    icon: <a-icon type = 'stop' style = 'color: #108ee9' / >
            });
            },

            async get(e) {          // eslint-disable-line
                this.disabled = true;
                this.loading = true;
                const mVideo = document.createElement('video');
                mVideo.setAttribute('muted', true);
                mVideo.setAttribute('autoplay', true);
                mVideo.setAttribute('playsinline', true);

//                const webCam = new Webcam(this.$refs['myvideo']);
                const webCam = new Webcam(mVideo);
                const canvas = this.$refs['canvas'];

                await this.runCam(webCam, canvas);
            },

            // eslint-disable-next-line
            runCam: async function (Camera, Canvas) {

                const modelUrl = v3_tiny_model;
                const model = await tf.loadLayersModel(modelUrl);       // eslint-disable-line no-unused-vars

                await Camera.setup();

                this.stream = Camera.getStream()


                const video = Camera.webcamElement;
                const ratio1 = video.videoHeight / video.videoWidth;
                const new_width = Math.min(480, this.$refs['yolo_div'].offsetWidth);
                // const new_height=this.$refs['yolo_div'].offsetHeight;
                const new_height = ratio1 * new_width;

                this.webcap_wrapper_width = new_width;
                this.canvas_width = new_width;
                this.webcap_wrapper_height = new_height;
                this.canvas_height = new_height;

                const ratio = Math.min(this.canvas_height / video.videoHeight, this.canvas_width / video.videoWidth);
                const drawImage_Height = ratio * video.videoHeight;
                const drawImage_Width = ratio * video.videoWidth;
                const drawImage_X = (this.canvas_width - drawImage_Width) / 2;
                const drawImage_Y = (this.canvas_height - drawImage_Height) / 2;
                const imageSize = [drawImage_Height, drawImage_Width];
                const CanvasContext = Canvas.getContext('2d');
                CanvasContext.font = "20px Times New Roman";
                CanvasContext.fillStyle = "rgb(0,0,255)";
                CanvasContext.strokeStyle = "rgb(0,151,229)";

                const tempCanvas = document.createElement("canvas")
                if (video.videoHeight > video.videoWidth) {
                    tempCanvas.height = YOLO_WIDTH;
                    tempCanvas.width = YOLO_HEIGHT;
                } else {
                    tempCanvas.height = YOLO_HEIGHT;
                    tempCanvas.width = YOLO_WIDTH;
                }
                const tempCanvasContext = tempCanvas.getContext('2d');

//                CanvasContext.globalCompositeOperation = 'source-atop';//重叠部分可见，其他透明。
                var frameNum = 0;
//                console.log("Video Size:", video.videoWidth,video.videoHeight);     // eslint-disable-line
//                console.log("Canvas Size:", drawImage_Width, drawImage_Height);

                let emptyframe = true;

                while (this.cam_destory) // eslint-disable-line
                {
                    tempCanvasContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height)

                    frameNum = frameNum + 1;
                    if (emptyframe == true) {
                        let tempCanvasContextArray = tempCanvasContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data
                        let tempCanvasContextArrayLength = tempCanvasContextArray.length;
                        let valMax = 0;
                        for (let i = 0; i < 1500; i++) {
                            let index = Math.round(Math.random() * length);
                            let val = tempCanvasContextArray[index];
                            valMax = val > valMax ? val : valMax;
                            if (valMax != 0)
                                break;
                        }
                        if (valMax == 0) {
                            continue;
                        } else {
                            emptyframe = false;
                            this.loading = false;
                        }
                    }


                    const startTime = performance.now();            // eslint-disable-line

                    const boxes = await this._predict("v3_tiny_model", model, tempCanvas, MAX_BOXES, SCORE_THRESHOLD, IOU_THRESHOLD, 1, v3_tiny_anchors, faceClasses, imageSize)
                    CanvasContext.clearRect(0, 0, this.canvas_width, this.canvas_height);
                    CanvasContext.drawImage(tempCanvas, drawImage_X, drawImage_Y, drawImage_Width, drawImage_Height);

                    let bboxs=new Array();
                    boxes.forEach(box => {
                        const {
                            top, left, bottom, right, height, width, score, className   // eslint-disable-line no-unused-vars
                        } = box;

                        // Calcaute the offset of left and top
                        const _left = left + drawImage_X;
                        const _top = top + drawImage_Y;
                        const _width = width;
                        const _height = height;
                        const _score=score;
                        const bbox={"xmin":_left,
                            "ymin":_top,
                            "xmax":_left+_width,
                            "ymax":_top+_height,
                            "score":_score};
                        bboxs.push(bbox)
                        this.magicRectangle(CanvasContext, _left, _top, _width, _height)

                    });

                    if (frameNum % 10 == 0 && boxes.length!==0) {
                        //https://blog.csdn.net/csdn_yudong/article/details/79668655
                        //for this code
                        let that = this

                        api.sendImage(Canvas, bboxs, true).then((response) => {
                            const matchRes = response.data.face[0].match;
                            const matchScore = response.data.face[0].similarity;
                            if (matchScore >= 0.66) {
                                that.matchRes = matchRes;
                                that.matchScore = matchScore;

                                api.getStudent(matchRes).then((response) => {
                                    console.log(response);
                                    const id = response.data.results[0]["id"];
                                    this.new_stu_name = response.data.results[0]["name"];
                                    if (id != undefined) {
                                        api.addWelcomeData(id);
                                    }
                                    console.log(id);
                                });
                            } else {

                                that.matchRes = 0;
                                that.matchScore = 0;
                            }
                        });
                    }



                    const endTime = performance.now();// eslint-disable-line

                    //do something log ...
                    if (frameNum % 200 == 0) {
                        console.log("inference: " + (endTime - startTime) + " milliseconds."); // eslint-disable-line
                        console.log('tf.memory(): ', tf.memory()); // eslint-disable-line
                    }

                    await tf.nextFrame();
                }
            },

            magicRectangle(context, x, y, width, height) {
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

            },


            async _predict(
                version,
                model,
                image,
                maxBoxes,
                scoreThreshold,
                iouThreshold,
                numClasses,
                anchors,
                classNames,
                inputSize,              // eslint-disable-line no-unused-vars
            ) {
                let outputs = tf.tidy(() => {
                    let imageTensor = tf.browser.fromPixels(image, 3);
                    imageTensor = imageTensor.expandDims(0).toFloat().div(tf.scalar(255));
                    const outputs = model.predict(imageTensor);
                    return outputs;
                });

                const boxes = await postprocess(
                    version,
                    outputs,
                    anchors,
                    numClasses,
                    classNames,
                    /*
                    image.constructor.name === 'HTMLVideoElement' ?
                        [image.videoHeight, image.videoWidth] :
                        [image.height, image.width],
                        */
                    inputSize,
                    maxBoxes,
                    scoreThreshold,
                    iouThreshold
                );

                tf.dispose(outputs);

                return boxes;
            },
        }

    };

    /**
     * This file is originally from:
     * https://github.com/tensorflow/tfjs-examples/blob/master/webcam-transfer-learning/webcam.js
     * The following modifications were made to the original file:
     * - `setup` has been changed to work for Safari, changes sourced from:
     *    https://github.com/google/emoji-scavenger-hunt/blob/master/src/js/camera.ts#L43-L56
     * - `capture` has been changed to just divide by 255 instead of
     *    divide by 127 and subtract 1.
     * Just run `diff` tbh, yuno MIT license.
     */
    /**
     * A class that wraps webcam video elements to capture Tensor4Ds.
     */

    class Webcam {
        /**
         * @param {HTMLElement} webcamElement A HTMLVideoElement representing the webcam feed.
         */
        constructor(webcamElement) {
            this.webcamElement = webcamElement;
        }

        /**
         * Adjusts the video size so we can make a centered square crop without
         * including whitespace.
         * @param {number} width The real width of the video element.
         * @param {number} height The real height of the video element.
         */
        adjustVideoSize(width, height) {  // eslint-disable-line

            this.webcamElement.width = width;
            this.webcamElement.height = height;
            /*
            const aspectRatio = width / height;
            if (width >= height) {
                this.webcamElement.width = aspectRatio * this.webcamElement.height;
            } else if (width < height) {
                this.webcamElement.height = this.webcamElement.width / aspectRatio;
            }
            */
            console.log("YOLO Size:", this.webcamElement.width, this.webcamElement.height)               // eslint-disable-line
        }

        async setup() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {facingMode: 'user'}
                });
                //window.stream = stream;
                this.webcamElement.srcObject = this.stream;
                return new Promise(resolve => {
                    this.webcamElement.onloadedmetadata = () => {
                        if (this.webcamElement.videoHeight > this.webcamElement.videoWidth) {
                            this.adjustVideoSize(
                                YOLO_HEIGHT, YOLO_WIDTH);
                        } else {
                            this.adjustVideoSize(
                                YOLO_WIDTH, YOLO_HEIGHT);
                        }
                        resolve();
                    };
                });
            } else {
                alert("No webcam found!");
                throw new Error('No webcam found!');
            }
        }

        getStream() {
            return this.stream;
        }
    }


</script>


<style scoped>
    #webcam-wrapper {
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        margin: 0 auto;
        /*width: 480px;*/
        /*height: 360px;*/
        position: relative;
    }
</style>
