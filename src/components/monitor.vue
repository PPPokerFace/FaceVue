<template>
    <div>
        <a-row>
            <a-col :span="16">
                <a-card>
                    <a-form
                            ref="monitorForm"
                            :form="form"
                            layout="inline"
                    >
                        <a-form-item
                                label="监控地址"
                                :help="tips"
                        >
                            <a-input
                                    v-decorator="[
                        'videoStreamAddress',
                        {rules: [{
                        required: true,
                        message: 'Please input the video stream address' }]}]"
                                    placeholder="video stream address"
                            >
                                <a-icon
                                        slot="prefix"
                                        type="user"
                                        style="color:rgba(0,0,0,.25)"
                                />
                            </a-input>
                        </a-form-item>
                        <a-form-item>
                            <a-button
                                    type="primary"
                                    @click="openVideoCaptrue"
                            >
                                打开监控
                            </a-button>
                        </a-form-item>
                    </a-form>
                    <div>
                        <canvas ref="canvas" height="600" width="800" max-width="100%"></canvas>
                        <video ref="video"></video>
                    </div>
                </a-card>
            </a-col>
            <a-col :span="8">
                <a-card>
                    <a-list
                            itemLayout="vertical"
                            :dataSource="faceInfo">
                        <!--:grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }"-->
                        <a-list-item slot="renderItem" slot-scope="item, index">
                            <a-card hoverable>
                                <a-card-meta
                                        :title="item.label">
                                    <template slot="description">
                                        <div>置信度：{{100-item.distance}}</div>
                                        <div>{{new Date()}}}</div>
                                    </template>
                                    <a-avatar
                                            style="width:90px;height:120px"
                                            slot="avatar"
                                            :src="item.img"/>
                                </a-card-meta>
                            </a-card>
                        </a-list-item>
                    </a-list>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script>
    import api from "../common/api";
    import FlvJs from "flv.js"
    import ACol from "ant-design-vue/es/grid/Col";

    export default {
        name: "monitor",
        components: {ACol},
        data() {
            return {
                id: '',
                socket: null,
                tips: undefined,
                faceInfo: [],
                faceNameSet: new Set(),
            }
        },
        beforeCreate() {
            this.form = this.$form.createForm(this);
        },
        created() {
            this.initWebSocket();
        },
        destroyed() {
            this.socket.close() //离开路由之后断开websocket连接
        },
        methods: {

            openVideoCaptrue: function () {
                const id = this.form.getFieldValue("videoStreamAddress")

                const data = {
                    "requestVal": "1",
                    "id": id
                };
                this.webSocketOnSend(JSON.stringify(data));
                this.$refs["monitorForm"].$el.style["display"]="none"
            },

            validatePrimeNumber: function (number) {
                if (number === 11) {
                    return {
                        validateStatus: 'success',
                        errorMsg: null,
                    };
                }
                return {
                    validateStatus: 'error',
                    errorMsg: 'The prime between 8 and 12 is 11!',
                };
            },

            initWebSocket() { //初始化weosocket
                const wsuri = api.getWsMonitor()
                this.socket = new WebSocket(wsuri);
                this.socket.onmessage = this.webSocketOnMessage;
                this.socket.onopen = this.webSocketOnOpen;
                this.socket.onerror = this.webSocketOnError;
                this.socket.onclose = this.webSocketOnClose;
            },
            webSocketOnOpen() { //连接建立之后执行send方法发送数据
                //let actions = {"test": "12345"};
                //this.webSocketOnSend(JSON.stringify(actions));
            },
            webSocketOnError() {//连接建立失败重连
//                this.initWebSocket();
            },
            webSocketOnMessage(e) { //数据接收
                const data = JSON.parse(e.data);
                const retVal = data["retVal"]         // number
                const faceInfo = data["faceInfo"]     // Array
                if (retVal == 1) {
                    const dataurl = "data:image/jpeg;base64," + data["image"]
                    const img = new Image();
                    let canvas = this.$refs["canvas"];
                    const faceInfoList = this.faceInfo
                    const faceNameSet = this.faceNameSet
                    img.onload = function () {
                        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                        faceInfo.forEach((face) => {
                            console.log(face)
                            if (100 - face["distance"] >= 70 && !faceNameSet.has(face.label)) {
                                const avatar = document.createElement("canvas");
                                const ctx = avatar.getContext("2d").drawImage(img,
                                    face["xmin"],
                                    face["ymin"],
                                    face["xmax"] - face["xmin"],
                                    face["ymax"] - face["ymin"],
                                    0,
                                    0,
                                    240,
                                    150);
                                face["img"] = avatar.toDataURL("image/jpeg");
                                faceNameSet.add(face.label);
                                faceInfoList.unshift(face)
                            }
                            if (faceInfoList.length > 5) {
                                const facePop = faceInfoList.pop();
                                faceNameSet.delete(facePop.label);
                            }
                        })
                    };
                    img.src = dataurl;
                }
            },
            webSocketOnSend(Data) {//数据发送
                this.socket.send(Data);
            },
            webSocketOnClose(e) {  //关闭
            },
        }
    }
</script>

<style scoped>

</style>
