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
    import {v3_tiny_model_url,yolo,magicRectangle,} from "./yoloApi"
    import api from '@/common/api'

    const YOLO_HEIGHT = 352;
    const YOLO_WIDTH = 480;

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

        beforeDestroy() {
            const stream = typeof this.stream.stop === 'function' ? this.stream : this.stream.getTracks()[0]
            stream.stop();
        },

        methods: {
            openNotificationSuccess(info) {
                console.log(info)// eslint-disable-line
                this.$notification.open({
                    message: '签到成功',
                    description: info,
                    icon: <a-icon type = 'smile' style = 'color: #108ee9' / >
            });
            },
            openNotificationError(info) {
                console.log(info)// eslint-disable-line
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

                const modelUrl = v3_tiny_model_url;
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

                    const boxes=await yolo(model,tempCanvas,imageSize)

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
                        const bbox={"xmin":_left,
                            "ymin":_top,
                            "xmax":_left+width,
                            "ymax":_top+height,
                            "score":score};
                        bboxs.push(bbox)
                        magicRectangle(CanvasContext, _left, _top, width, height)

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
                                    console.log(response);// eslint-disable-line
                                    const stu_number = response.data.results[0]["stu_number"];
                                    this.new_stu_name = response.data.results[0]["name"];
                                    if (stu_number != undefined) {
                                        api.addWelcomeData(stu_number);
                                    }
                                    console.log(id);// eslint-disable-line
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
