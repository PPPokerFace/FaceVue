<template>
    <div>
        <a-card title="报道进度" style="height: 400px">
            <ve-liquidfill :data="WaterPercentData" :settings="WaterPercentSettings"></ve-liquidfill>
        </a-card>
        <a-card title="报道情况" style="min-height: 500px"
                :bodyStyle='{paddingLeft:"1px",paddingTop:"1px",paddingRight:"1px"}'>
            <welcome-data ref="mychild" :refresh="refresh"></welcome-data>
        </a-card>
        <a-card title="新生分布图" style="height: 500px">
            <ve-map :data="MapData" :settings="MapSettings" :extend="MapExtend"></ve-map>
        </a-card>
        <a-card title="各学院报道情况" style="height: 400px">
            <ve-histogram :data="CollegeProcessData" :settings="CollegeProcessSettings"
                          :extend="CollegeProcessExtend"></ve-histogram>
        </a-card>
        <a-card title="报道进度排名" style="height: 400px"
                :bodyStyle='{paddingLeft:"1px",paddingTop:"1px",paddingRight:"1px"}'>
            <ve-bar :data="ProgressOrderData" :settings="ProgressOrderSettings"
                    :extend="ProgressOrderExtend"></ve-bar>
        </a-card>
        <a-card title="其他功能" style="min-height: 500px">

        </a-card>
    </div>
</template>

<script>
    import WelcomeData from './welcomeData.vue'
    import api from "../../common/api";

    export default {
        name: "welcomeDataShowPhone",
        components: {WelcomeData},
        data() {
            this.WaterPercentSettings = {
                wave: [0.5, 0.3, 0.1],
                seriesMap: {
                    '1': {
                        radius: '75%',
                        center: ['50%', '35%'],
                    }
                }
            };
            this.MapSettings = {
                roam: false,
                aspectScale: 0.8,
                mapGrid: {
                    top: 'middle'
                },
                zoom: 1.5,
                itemStyle: {
                    areaColor: '#c5edff'
                },
                label: {
                    show: true,
                    formatter: function (params) {
                        if (params.value >= 0) {
                            let strr = params.name + ':' + params.value
                            console.log(strr)
                            return strr
                        } else {
                            return ''
                        }
                    },
                    borderWidth: 0
                },
            };
            this.MapExtend = {
                legend: {
                    show: false,
                    top: 'middle',
                    left: 'left',
                    orient: 'vertical',
                },
            };
            this.CollegeProcessExtend = {
                legend: {
                    show: ['学院人数', '报道人数'],
                },
                barGap: '-100%',
                grid: {
                    top: '50px',
                    height: '60%'
                },
                xAxis: {
                    axisLabel: {
                        show: true,
                        fontSize: 10,
                        interval: 0,
                        rotate: 90
                        // formatter: function (value) {
                        //     return value.split("").join("\n");
                        // }

                    }
                }
            }
            this.CollegeProcessSettings = {
                dataOrder: {label: '报道率', order: 'desc'},

                // stack: {'学生': ['学院人数', '报道人数']}
            }
            this.ProgressOrderExtend = {
                legend: {
                    show: false,
                    top: 'middle',
                    left: 'left',
                    orient: 'vertical',
                },
                barGap: '-100%',
                grid: {
                    top: '30px',
                    height: '70%'
                },
                yAxis: {
                    axisLabel: {
                        show: false,
                    }
                }

            };
            this.ProgressOrderSettings = {
                dataOrder: {label: '报道率', order: 'desc'},
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function (params) {
                            if (params.seriesName == "百分") {
                                return params.name
                            } else {
                                return ''
                            }
                        }
                    }

                }
                // stack: {'学生': ['学院人数', '报道人数']}
            }
            return {
                WaterPercentData: {
                    columns: ['num', 'percent'],
                    rows: [{
                        num: '1',
                        percent: 0
                    }]
                },
                MapData: {
                    columns: ['位置', '人数',],
                    rows: []
                },
                CollegeProcessData: {
                    columns: ['学院', '学院人数', '报道人数', '报道率'],
                    rows: []
                },
                ProgressOrderData: {
                    columns: ['学院', '百分', '报道率'],
                    rows: []
                },
                refresh: 0
            }
        },
        mounted() {
            let that = this;
            api.welcomeDataExtend().then(response => {
                let data = response.data;
                this.WaterPercentData.rows[0].percent = data['water_percent_data']['percent']
                this.MapData.rows = data['map_data']['rows']
                this.ProgressOrderData.rows = data['process_order_data']['rows']
                this.CollegeProcessData.rows = data['college_process_data']['rows']
            })
        },
        created() {
            this.initWebSocket();
        },
        destroyed() {
            this.socket.close() //离开路由之后断开websocket连接
        },
        methods: {
            initWebSocket() { //初始化weosocket
                const wsuri = api.getWsWelcomeData()
                this.socket = new WebSocket(wsuri);
                this.socket.onmessage = this.webSocketOnMessage;
                this.socket.onopen = this.webSocketOnOpen;
                this.socket.onerror = this.webSocketOnError;
                this.socket.onclose = this.webSocketOnClose;
            },
            webSocketOnOpen() { //连接建立之后执行send方法发送数据

                console.log(22222)
                //let actions = {"test": "12345"};
                //this.webSocketOnSend(JSON.stringify(actions));
            },
            webSocketOnError() {//连接建立失败重连
//                this.initWebSocket();
            },
            webSocketOnMessage(e) { //数据接收
                const data = JSON.parse(e.data);
                this.WaterPercentData.rows[0].pent = data['water_percent_data']['percent']
                this.MapData.rows = data['map_data']['rows']
                this.ProgressOrderData.rows = data['process_order_data']['rows']
                this.CollegeProcessData.rows = data['college_process_data']['rows']
                this.refresh = this.refresh + 1;
                this.$refs.mychild.fetch();
            },
            webSocketOnClose(e) {  //关闭
            },
        }
    }
</script>

<style scoped>

</style>
