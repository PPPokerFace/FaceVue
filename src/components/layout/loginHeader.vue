<template>
    <a-row>
        <a-col :span="16">
            <nva-left v-show="visible"></nva-left>
        </a-col>
        <a-col :span="8">
            <p>{{this.$store.state.username||'未登录'}}</p>
        </a-col>
    </a-row>
</template>

<script>
    import nvaLeft from './navLeft.vue'

    export default {
        name: "loginHeader",
        data() {
            return {
                visible: false,
            }
        },
        components: {
            nvaLeft,
        },
        mounted() {
            if (document.body.clientWidth < document.body.clientHeight) {
                this.visible = true;
            }
        },

    }
</script>

<style scoped>
    p {
        text-align: center;
    }
</style>
