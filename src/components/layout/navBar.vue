<template>
    <a-menu
            @click="handleClick"
            style="width: 230px"
            :defaultSelectedKeys="['/uploadImg']"
            :openKeys.sync="openKeys"
            mode="inline"
            :selectedKeys="current"
    >
        <a-sub-menu key="sub1" @titleClick="titleClick">
            <span slot="title"><a-icon type="mail"/><span>迎 新 系 统</span></span>
            <a-menu-item-group key="g1">
                <template slot="title">
                    <a-icon type="picture"/>
                    <span> 文件操作</span>
                </template>
                <a-menu-item key="/uploadImg">上传图片文件</a-menu-item>
                <a-menu-item key="/myImage">查看图片</a-menu-item>
            </a-menu-item-group>
            <a-menu-item-group key="g2">
                <template slot="title">
                    <a-icon type="smile"/>
                    <span> 迎新签到</span>
                </template>
                <a-menu-item key="/face">签到</a-menu-item>
                <a-menu-item key="/welcomeData">迎新数据</a-menu-item>
                <a-menu-item key="/welcomeDataShow">迎新数据展示</a-menu-item>
            </a-menu-item-group>
        </a-sub-menu>
        <a-sub-menu key="sub2" @titleClick="titleClick">
            <span slot="title"><a-icon type="appstore"/><span>新生信息</span></span>
            <a-menu-item key="/myInformation">我的信息</a-menu-item>
            <a-menu-item key="/publicInfo">公告</a-menu-item>
            <a-sub-menu key="sub3" title="新生讨论">
                <a-menu-item key="/allPostCard">所有帖子</a-menu-item>
                <a-menu-item key="/myPostCard">我的帖子</a-menu-item>
            </a-sub-menu>
        </a-sub-menu>
        <a-sub-menu key="sub3" @titleClick="titleClick">
            <span slot="title"><a-icon type="appstore"/><span>测试功能区</span></span>
            <a-menu-item key="/objectDetection">模型性能估计</a-menu-item>
            <a-menu-item key="/gps">GPS定位</a-menu-item>
            <a-menu-item key="/monitor">【测试】监控</a-menu-item>
            <a-menu-item key="/webSocketWebCam">推流</a-menu-item>
        </a-sub-menu>

    </a-menu>
</template>

<script>
    export default {
        name: "navBar",
        data() {
            return {
                openKeys: ['sub1'],
            }
        },
        computed: {
            current() {
                return [this.$route.path];
            }
        },
        methods: {
            handleClick(e) {
                switch (e.key) {
                    case '/uploadImg':
                        this.$router.push('/uploadImg');
                        break;
                    case '/myImage':
                        this.$router.push('/myImage');
                        break;
                    case '/face':
                        this.$router.push('/face');
                        break;
                    case '/welcomeData':
                        this.$router.push('/welcomeData');
                        break;
                    case '/welcomeDataShow':
                        if (document.body.clientWidth > document.body.clientHeight)
                            this.$router.push('/welcomeDataShow');
                        else
                            this.$router.push('/welcomeDataShowPhone')

                        break;
                    case '/myInformation':
                        this.$router.push('/myInformation');
                        break;
                    case '/publicInfo':
                        this.$router.push('/publicInfo');
                        break;
                    case '/allPostCard':
                        this.$router.push('/allPostCard');
                        break;
                    case '/myPostCard':
                        this.$router.push('/myPostCard');
                        break;
                    case '/objectDetection':
                        this.$router.push('/objectDetection');
                        break;
                    case '/gps':
                        this.$router.push('/gps');
                        break;
                    case '/adminInfo':
                        this.$router.push('/adminInfo');
                        break;
                    case '/monitor':
                        this.$router.push('/monitor');
                        break;
                    case '/webSocketWebCam':
                        this.$router.push('/webSocketWebCam');
                        break;
                }

            },
            titleClick(e) {
                console.log('titleClick', e)
            }
            ,
        },
        watch: {
            openKeys(val) {
                console.log('openKeys', val)
            }
            ,
        }
        ,
    }
</script>

<style scoped>

</style>
