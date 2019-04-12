<template>
    <div>
        <div ref="loading_message">
            摄像头调用测试程序
            <div>
                <img class="spin" src="../assets/logo.png">
            </div>
        </div>
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
        <button @click="get" >运行</button>
        <div class="webcam-ui-container">
            <div id="webcam-wrapper">
                <!--
                <video ref="myvideo" width="288" height="288" playsinline autoplay muted ></video>
                -->
                <canvas ref="canvas" id="canvas" width="288" height="288" style="margin: auto;"></canvas>

            </div>
            <div>
            </div>

        </div>
    </div>
</template>

<script>
    import * as tf from "@tensorflow/tfjs"
    import postprocess from "./yoloProcess"

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
    const SCORE_THRESHOLD = .15;     // eslint-disable-line no-unused-vars
    const IOU_THRESHOLD = .3;       // eslint-disable-line no-unused-vars


    export default {
        name: "YoloWebCam",


        methods: {
            async get() {

                const mVideo = document.createElement('video');
                mVideo.height=INPUT_SIZE;
                mVideo.width=INPUT_SIZE;
//                mVideo.playsinline=true;
//                mVideo.autoplay = true;
                mVideo.setAttribute('muted',true);
                mVideo.setAttribute('autoplay',true);
                mVideo.setAttribute('playsinline',true);
//                mVideo.setAttribute('webkit-playsinline', true);
                //不加这行谷歌浏览器运行一些会有问题
//                mVideo.play();

//                const webCam = new Webcam(this.$refs['myvideo']);
                const webCam = new Webcam(mVideo);

                await webCam.setup();

                this.doneLoading();

                const canvas=this.$refs['canvas'];
                await this.runCam(webCam,canvas);
            },

// eslint-disable-next-line
            runCam: async function (Camera,Canvas) {
                const modelUrl =v3_tiny_model;
                const model = await tf.loadLayersModel(modelUrl);// eslint-disable-line no-unused-vars

                const video=Camera.webcamElement;
                const ratio=INPUT_SIZE/Math.max(video.videoHeight,video.videoWidth);
                const drawImage_Height=ratio*video.videoHeight;
                const drawImage_Width=ratio*video.videoWidth;
                const drawImage_X=(INPUT_SIZE-drawImage_Width)/2;
                const drawImage_Y=(INPUT_SIZE-drawImage_Height)/2;
                const CanvasContext=Canvas.getContext('2d');
                CanvasContext.font="20px Times New Roman";
                CanvasContext.fillStyle="rgb(0,0,255)";
                CanvasContext.strokeStyle="rgb(0,0,255)";
//                CanvasContext.globalCompositeOperation = 'source-atop';//重叠部分可见，其他透明。
                var frameNum=0;
                while (true) // eslint-disable-line
                {
                    frameNum=frameNum+1;
//                    CanvasContext.drawImage(video, drawImage_X,drawImage_Y , drawImage_Width, drawImage_Height);
                    const startTime = performance.now();// eslint-disable-line
                    const boxes = await this._predict("v3_tiny_model", model, video, MAX_BOXES, SCORE_THRESHOLD, IOU_THRESHOLD, 1, v3_tiny_anchors, faceClasses, INPUT_SIZE)
                    if(frameNum<=50)
                        continue;
                    CanvasContext.clearRect(0,0,INPUT_SIZE,INPUT_SIZE);
                    CanvasContext.drawImage(video, drawImage_X,drawImage_Y , drawImage_Width, drawImage_Height);


                    boxes.forEach(box => {
                        const {
                            top, left, bottom, right, height, width, score, className   // eslint-disable-line no-unused-vars
                        } = box;

                        CanvasContext.fillText(score,left,top)
                        CanvasContext.strokeRect(left,top,width,height);

                    });

                    const endTime = performance.now();// eslint-disable-line

                    //do something log ...
                    console.log("inference: " + (endTime - startTime) + " milliseconds."); // eslint-disable-line
//                    console.log('tf.memory(): ', tf.memory()); // eslint-disable-line

                    await tf.nextFrame();
                }
            },

            doneLoading() {
                const elem = this.$refs['loading_message'];
                elem.style.display = 'none';

                const successElem = this.$refs['success_message'];
                successElem.style.display = 'block';

//                const webcamElem = this.$refs['webcam_wrapper'];
//                webcamElem.style.display = 'flex';
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
                    const outputs =model.predict(imageTensor);

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
                    [INPUT_SIZE,INPUT_SIZE],
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
        adjustVideoSize(width, height) {
            const aspectRatio = width / height;
            if (width >= height) {
                this.webcamElement.width = aspectRatio * this.webcamElement.height;
            } else if (width < height) {
                this.webcamElement.height = this.webcamElement.width / aspectRatio;
            }
        }

        async setup() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {facingMode: 'user'}
                });
                window.stream = stream;
                this.webcamElement.srcObject = stream;
                return new Promise(resolve => {
                    this.webcamElement.onloadedmetadata = () => {
                        this.adjustVideoSize(
                            INPUT_SIZE,
                            INPUT_SIZE);
                        resolve();
                    };
                });
            } else {
                alert("No");
                throw new Error('No webcam found!');
            }
        }
    }




</script>


<style scoped>
    #webcam-wrapper {
        border-radius: 5px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        margin: 0 auto;
        width: 288px;
        height: 288px;
        position: relative;
    }
</style>
