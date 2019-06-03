<template>
    <div style="text-align: center;">
        <a-card title="上传自己的人脸照片" style="max-width: 600px;margin: 0 auto;">
            <a-upload-dragger id="upload" name="file" :multiple="true" :action="getUploadUrl"
                              :beforeUpload="beforeUp"
                              @change="handleChange"
                              :headers="header"
            >
                <p class="ant-upload-drag-icon">
                    <a-icon type="inbox"/>
                </p>
                <p class="ant-upload-text">上传文件</p>
                <p class="ant-upload-hint">点击打开文件框/拖拽文件进入</p>
            </a-upload-dragger>
        </a-card>
    </div>
</template>

<script>
    import api from "@/common/api";
    import * as tf from "@tensorflow/tfjs"
    import {v3_tiny_model_url, yolo, letterbox} from "../yoloApi"

    export default {
        name: "uploadImg",
        data() {
            return {
                filename: '',
                model: undefined
            }
        },
        computed: {
            header: function () {
                return {'Authorization': 'Token ' + localStorage.getItem('token')}
            }
        },
        mounted() {
            if (localStorage.getItem("faceed") == "no")
                this.$message.error("请先认证！");
            localStorage.removeItem("faceed")
            const that = this;
            tf.loadLayersModel(v3_tiny_model_url).then((model) => {
                    that.model = model;
                }
            )
        },
        methods: {
            handleChange(info) {
                console.log(info);
                const status = info.file.status;
                this.filename = info.name;
                if (status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (status === 'done') {
                    this.$message.success(`${info.file.name} file uploaded successfully.`);
                } else if (status === 'error') {
                    this.$message.error(`${info.file.name} file upload failed.`);
                }
            }
            ,
            getUploadUrl(info) {
                return api.uploadImage(info.name);
            },
            dataURLtoFile(dataurl, filename) {
                var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, {type: mime});
            },
            rotate90: function (canvas) {
                const rotate = 90;
                const newCanvas = document.createElement("canvas");
                const canvasContext = newCanvas.getContext('2d');
                newCanvas.width = canvas.height;
                newCanvas.height = canvas.width;
                canvasContext.translate(newCanvas.width / 2, newCanvas.height / 2);
                canvasContext.rotate(rotate * Math.PI / 180);
                canvasContext.translate(-newCanvas.width / 2, -newCanvas.height / 2);
                canvasContext.drawImage(canvas, newCanvas.width / 2 - canvas.width / 2, newCanvas.height / 2 - canvas.height / 2);
                canvasContext.restore();
                return newCanvas

            },
            beforeUp(file, fileList) {
                //正则表达式，匹配zip结尾文件，i表示不区分大小写
                const zipPart = /^.*\.(zip)$/i;
                if (zipPart.test(file.name)) {
                    return true;
                } else {
                    const hide = this.$message.loading('识别人脸中', 0);
                    return new Promise((resolve, reject) => {


                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        const canvas = document.createElement("canvas");
                        const that = this;
                        reader.onload = (e) => {
                            const img = new Image();
                            const dataurl = e.target.result;
                            img.onload = async (e) => {
                                canvas.width = e.target.width;
                                canvas.height = e.target.height;
                                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

                                //对原图进行三次旋转
                                let canvasTemp = canvas;
                                for (let i = 0; i < 3; i++) {
                                    const canvasLetter = letterbox(canvasTemp, [352, 480])
                                    const boxes = await yolo(this.model, canvasLetter, [canvasTemp.height, canvasTemp.width])
                                    if (boxes.length !== 0) {
                                        const newFile = that.dataURLtoFile(canvasTemp.toDataURL(), file.name)
                                        //文件伪造，这一句不能少
                                        newFile.uid = file.uid;
                                        setTimeout(hide, 0);
                                        resolve(newFile);
                                        return;
                                    } else {
                                        canvasTemp = this.rotate90(canvasTemp);
                                    }
                                }
                                //所有旋转尝试之后还不能得到人脸则放弃上传
                                setTimeout(hide, 0);
                                this.$message.info("没有识别到人脸！");
                                reject();
                            };
                            img.src = dataurl;
                        };
                    })
                }
            },
        }
    }
</script>

<style scoped>
</style>
