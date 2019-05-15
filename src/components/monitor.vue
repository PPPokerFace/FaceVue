<template>
    <div>
        <a-row>
            <a-col :span="16">
                <a-card>
                <a-form
                        :form="form"
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
                    <canvas ref="canvas" height="300" width="400"></canvas>
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
                                        title="test">
                                    <template slot="description">
                                        <div>姓名：{{item.label}}</div>
                                        <div>置信度：{{100-item.distance}}</div>
                                    </template>
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
                faceInfo: []
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

            openVideoCaptrue111: function () {
                if (FlvJs.isSupported()) {
                    const flvPlayer = FlvJs.createPlayer({
                        type: 'flv',
                        url: 'https://127.0.0.1/b/media/'
                    })
                    flvPlayer.attachMediaElement(this.$refs["video"]);
                    flvPlayer.load();
                    flvPlayer.play();

                }
            },


            openVideoCaptrue: function () {
                const id = this.form.getFieldValue("videoStreamAddress")

                const data = {
                    "requestVal": "1",
                    "id": id
                };
                this.webSocketOnSend(JSON.stringify(data));
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
                console.log(data)
                const retVal = data["retVal"]         // number
                const faceInfo = data["faceInfo"]     // Array
                if (retVal == 1) {
                    const dataurl = "data:image/jpeg;base64," + data["image"]
                    const img = new Image();
                    let canvas = this.$refs["canvas"];
                    img.src = dataurl;
                    const faceInfoList = this.faceInfo
                    img.onload = function () {
                        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                        faceInfo.forEach((face) => {
                            faceInfoList.unshift(face)
                            if(faceInfoList.length>5)
                            {
                                faceInfoList.pop()
                            }
                        })
                    };
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
