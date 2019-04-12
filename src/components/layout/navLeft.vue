<template>
    <div>
        <div style="padding-top: 6px;padding-left: 10px">
            <a-icon type="bars" style="font-size: 30px" v-on:click="showDrawer"/>
        </div>
        <a-drawer
                title="F A C E"
                placement="left"
                :closable="false"
                @close="onClose"
                :visible="visible"
        >
            <div>
                <nav-bar></nav-bar>
            </div>
        </a-drawer>
    </div>
</template>
<script>
    import navBar from './navBar.vue'

    export default {
        name: "nvaLeft",
        data() {
            return {
                visible: false,
            }
        },
        components: {
            //Antdesign
            // 自己的组件
            navBar,
        },
        methods: {
            showDrawer() {
                this.visible = true
            },
            onClose() {
                this.visible = false
            },
        },
    }
</script>
