<template>
    <div id="app">
        <a-layout id="components-layout-demo-responsive">
            <a-layout-sider theme="light" width="229px" v-show="visible">
                <h1 style="text-align: center;font-size:40px;color: #2593fc;">F&nbsp&nbspA&nbsp&nbspC&nbsp&nbspE</h1>
                <nav-bar></nav-bar>
            </a-layout-sider>
            <a-layout>
                <a-layout-header :style="{ background: '#fff', padding: 0 }">
                    <login-header></login-header>
                </a-layout-header>

                <a-layout-content :style="{ margin: '24px 16px 0' }">
                    <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
                        <router-view></router-view>
                    </div>
                </a-layout-content>
                <a-layout-footer style="textAlign: center">
                    ©FACE 2019
                </a-layout-footer>
            </a-layout>
        </a-layout>
    </div>
</template>

<script>
    //import HelloWorld from './components/HelloWorld.vue'
    //import YoloWebCam from './components/YoloWebCamHTTP'            // eslint-disable-line

    // 自己的组件
    import login from './components/layout/login.vue'
    import loginHeader from './components/layout/loginHeader.vue'
    import navLeft from './components/layout/navLeft.vue'
    import navBar from './components/layout/navBar.vue'

    export default {
        name: 'app',
        data() {
            return {
                visible: true,
            }
        },
        components: {
            //YoloWebCam,                                 // eslint-disable-line
            // 自己的组件
            loginHeader,
            navBar,
        },
        methods: {
            onCollapse(collapsed, type) {
                console.log(collapsed, type);
            },
            onBreakpoint(broken) {
                console.log(broken);
            },
            nvaCilck(e) {
                switch (e.key) {
                    case "1":
                        this.$router.push("/uploadImg");
                        break;
                }
            }
        },
        mounted() {
            if (document.body.clientWidth < document.body.clientHeight
                || this.$route.path == '/welcomeDataShow'
                || this.$route.path == '/monitor') {
                this.visible = false;
            } else {
                this.visible = true;
            }
        },
    }
</script>

<style scoped>
    #components-layout-demo-responsive .logo {
        height: 32px;
        background: white;
        margin: 16px;
        background-size: 100% 100%;
    }

    #app {
        height: 100%;
    }

    #components-layout-demo-responsive {
        min-height: 100%;
    }

    a {
        color: #d0d0d8;
        text-decoration: none;
        width: auto;
    }

    .router-link-active {
        color: white;
    }
</style>
