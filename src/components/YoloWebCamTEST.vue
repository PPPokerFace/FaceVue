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
                <canvas ref="canvas" id="canvas" width="360" height="360" style="margin: auto;"></canvas>

            </div>
            <div>
            </div>

        </div>
    </div>
</template>

<script>
    import * as tf from "@tensorflow/tfjs"
    import postprocess from "./yoloProcess"
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

    const YOLO_WIDTH=480
    const YOLO_HEIGHT=352

    const CANVAS_SIZE=360
    const IMAGE_WIDTH=360
    const IMAGE_HEIGHT=360


    export default {
        name: "YoloWebCam",


        methods: {
            async get() {


                const mVideo = document.createElement('video');
                mVideo.height=IMAGE_HEIGHT;
                mVideo.width=IMAGE_WIDTH;
//                mVideo.playsinline=true;
                //this.mVideo.autoplay = true;
                mVideo.setAttribute('muted',true);
                mVideo.setAttribute('autoplay',false);
                mVideo.setAttribute('playsinline',true);
//                mVideo.setAttribute('webkit-playsinline', true);
                //不加这行谷歌浏览器运行一些会有问题
//                mVideo.play();

//                const webCam = new Webcam(this.$refs['myvideo']);
                const webCam = new Webcam(mVideo);
                const canvas=this.$refs['canvas'];


                this.doneLoading();

                await this.runCam(webCam,canvas);
            },

// eslint-disable-next-line
            runCam: async function (Camera,Canvas) {

                const modelUrl =v3_tiny_model;
                const model = await tf.loadLayersModel(modelUrl);// eslint-disable-line no-unused-vars

                await Camera.setup();
                const video=Camera.webcamElement;
                const ratio=Math.min(IMAGE_HEIGHT,IMAGE_WIDTH)/Math.max(video.videoHeight,video.videoWidth);
                const drawImage_Height=ratio*video.videoHeight;
                const drawImage_Width=ratio*video.videoWidth;
                const drawImage_X=(CANVAS_SIZE-drawImage_Width)/2;// eslint-disable-line
                const drawImage_Y=(CANVAS_SIZE-drawImage_Height)/2;// eslint-disable-line
                const CanvasContext=Canvas.getContext('2d');
                CanvasContext.font="20px Times New Roman";
                CanvasContext.fillStyle="rgb(0,0,255)";
                CanvasContext.strokeStyle="rgb(0,0,255)";
//                CanvasContext.globalCompositeOperation = 'source-atop';//重叠部分可见，其他透明。
                var frameNum=0;

                console.log("Canvas Size:",drawImage_Width,drawImage_Height)
                while (true) // eslint-disable-line
                {
                    frameNum=frameNum+1;
//                    CanvasContext.drawImage(video, drawImage_X,drawImage_Y , drawImage_Width, drawImage_Height);
                    const startTime = performance.now();// eslint-disable-line
                    const boxes = await this._predict("v3_tiny_model", model, video, MAX_BOXES, SCORE_THRESHOLD, IOU_THRESHOLD, 1, v3_tiny_anchors, faceClasses, INPUT_SIZE)
                    if(frameNum<=50)
                        continue;
                    CanvasContext.clearRect(0,0,IMAGE_WIDTH,IMAGE_HEIGHT);

                    CanvasContext.drawImage(video, drawImage_X,drawImage_Y , drawImage_Width, drawImage_Height);


                    boxes.forEach(box => {
                        const {
                            top, left, bottom, right, height, width, score, className   // eslint-disable-line no-unused-vars
                        } = box;

                        if(frameNum%10==0)
                        {
                            //https://blog.csdn.net/csdn_yudong/article/details/79668655
                            //for this code
                            let param = new URLSearchParams()
                            param.append('image',Canvas.toDataURL('image/jpeg'))
                            param.append('bbox',left.toString()+','+top.toString()+','+(left+width).toString()+','+(top+height).toString())
                            param.append('detected',1)

                            /*


                            axios.post('/dododo/',param)
                                .then(function (response){
                                    console.log(response);              // eslint-disable-line
                                })
                                .catch((function (error) {
                                    console.log(error)                  // eslint-disable-line
                                }));


                              */

                        }

                        CanvasContext.fillText(score.toFixed(2),left,top)
                        CanvasContext.strokeRect(left,top,width,height);

                    });

                    const endTime = performance.now();// eslint-disable-line

                    //do something log ...
                    if (frameNum%200==0)
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
                    console.log(imageTensor.shape)                  // eslint-disable-line
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
                    [IMAGE_HEIGHT,IMAGE_WIDTH],
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
        adjustVideoSize(/*width, height,*/yolo_size) {  // eslint-disable-line

            this.webcamElement.width=YOLO_WIDTH
            this.webcamElement.height=YOLO_HEIGHT
            /*

            const aspectRatio = width / height;
            if (width >= height) {
                this.webcamElement.width = aspectRatio * this.webcamElement.height;
            } else if (width < height) {
                this.webcamElement.height = this.webcamElement.width / aspectRatio;
            }
            */
            console.log("YOLO Size:",this.webcamElement.width,this.webcamElement.height)               // eslint-disable-line
        }

        async setup() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {facingMode: 'user'}
                });
                //window.stream = stream;
                this.webcamElement.srcObject = stream;
                return new Promise(resolve => {
                    this.webcamElement.onloadedmetadata = () => {
                        this.adjustVideoSize(
                            /*IMAGE_WIDTH,IMAGE_HEIGHT,*/INPUT_SIZE);
                        resolve();
                    };
                });
            } else {
                alert("No webcam found!");
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
        width: 360px;
        height: 360px;
        position: relative;
    }
</style>
