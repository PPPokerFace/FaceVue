<template>
    <div>
        <div>模型性能估计</div>
        <div>本模块用于YOLO前端模型指标测量</div>
        <div></div>
        <canvas ref="canvas"></canvas>
        <button @click="doObjectDetection">执行</button>

    </div>

</template>

<script>
    import {v3_tiny_model_url, yolo} from "./yoloApi"
    import * as tf from "@tensorflow/tfjs"
    //import fileList from "./fileList"
    import api_HOST from "../common/api"
    import Vue from "vue"

    const YOLO_SIZE = 288;

    export default {
        name: "ObjectDetection",

        methods: {
            async doObjectDetection() {

                const model = await tf.loadLayersModel(v3_tiny_model_url);       // eslint-disable-line no-unused-vars

                const canvas = this.$refs['canvas']
                canvas.height = canvas.width = YOLO_SIZE


                const res = new Array()

                for (let i = 0; i < fileList.length; i++) {

                    const filename = "img_align_celeba/0" + fileList[i] + ".jpg";
                    const img = new Image()
                    img.src = filename;
                    img.onload = async function () {
                        const img_width = img.width
                        const img_height = img.height

                        const ratio = Math.min(canvas.height / img_height, canvas.width / img_width);
                        const drawImage_Height = ratio * img_height;
                        const drawImage_Width = ratio * img_width;
                        const drawImage_X = (canvas.width - drawImage_Width) / 2;
                        const drawImage_Y = (canvas.height - drawImage_Height) / 2;
                        const imageSize = [218, 178];

                        const CanvasContext = canvas.getContext('2d');
                        CanvasContext.drawImage(img, drawImage_X, drawImage_Y, drawImage_Width, drawImage_Height)

                        const boxes = await yolo(model, canvas, imageSize)
                        boxes.forEach(box => {
                                const {
                                    top, left, bottom, right, height, width, score, className   // eslint-disable-line no-unused-vars
                                } = box
                                const x1 = left;
                                const y1 = top;
                                const x2 = left + width;
                                const y2 = y1 + height;
                                const data = filename + " " + box["class"] + " " + score + " " + parseInt(x1).toString() + " " + parseInt(y1).toString()
                                    + " " + parseInt(x2).toString() + " " + parseInt(y2).toString();
                                res.push(data)
                            }
                        )

                        const api = "https://127.0.0.1/b/object-detection-metrics/";
                        Vue.prototype.$axios.post(api, JSON.stringify(res))
                    }
                }
            }


        }

    }


</script>

<style scoped>

</style>
