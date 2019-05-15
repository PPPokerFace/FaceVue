<template>
    <a-row>
        <a-col :span="6">
            <nva-left v-show="visiable"></nva-left>
        </a-col>
        <a-col :span="18" style="text-align: right;padding-right: 20px">
            <a-dropdown-button>
                <a-icon type="user"/>
                {{this.$store.state.username||'未登录'}}
                <a-menu slot="overlay" @click="handleMenuClick">
                    <a-menu-item key="1" v-show="this.$store.getters.isLoggedIn">
                        <a-icon type="logout"/>
                        注销
                    </a-menu-item>
                    <a-menu-item key="2">
                        <a-icon type="info-circle"/>
                        关于FACE
                    </a-menu-item>
                </a-menu>
            </a-dropdown-button>
        </a-col>
    </a-row>
</template>

<script>
    import nvaLeft from './navLeft.vue'

    export default {
        name: "loginHeader",
        data() {
            return {
                visiable: false,
            }
        },
        components: {
            nvaLeft,
        },
        mounted() {
            if (document.body.clientWidth < document.body.clientHeight||this.$route.path=='/welcomeDataShow') {
                this.visiable = true;
            }
            else {
                this.visiable = false;
            }
        },

        methods: {
            handleMenuClick(e) {
                this.$store.dispatch('logout');
                this.$router.push('/');
                console.log('click', e);
            },
        }

    }
</script>

<style scoped>
    p {
        text-align: center;
    }
</style>
