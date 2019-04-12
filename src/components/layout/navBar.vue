<template>
    <a-menu
            @click="handleClick"
            style="width: 230px"
            :defaultSelectedKeys="['1']"
            :openKeys.sync="openKeys"
            mode="inline"
    >
        <a-sub-menu key="sub1" @titleClick="titleClick">
            <span slot="title"><a-icon type="mail"/><span>迎 新 系 统</span></span>
            <a-menu-item-group key="g1">
                <template slot="title">
                    <a-icon type="picture"/>
                    <span> 文件操作</span>
                </template>
                <a-menu-item key="1">上传图片文件</a-menu-item>
                <a-menu-item key="2">查看图片</a-menu-item>
            </a-menu-item-group>
            <a-menu-item-group key="g2">
                <template slot="title">
                    <a-icon type="setting"/>
                    <span> 迎新设置</span>
                </template>
                <a-menu-item key="3">开启本年度迎新</a-menu-item>
                <a-menu-item key="4">迎新数据</a-menu-item>
            </a-menu-item-group>
            <a-menu-item-group key="g3">
                <template slot="title">
                    <a-icon type="setting"/>
                    <span> 迎新签到</span>
                </template>
                <a-menu-item key="5">签到</a-menu-item>
                <a-menu-item key="6">迎新数据展示</a-menu-item>
            </a-menu-item-group>
        </a-sub-menu>
        <a-sub-menu key="sub2" @titleClick="titleClick">
            <span slot="title"><a-icon type="appstore"/><span>其他</span></span>
            <a-menu-item key="1">Option 1</a-menu-item>
            <a-menu-item key="2">Option 2</a-menu-item>
            <a-sub-menu key="sub3" title="Submenu">
                <a-menu-item key="1">Option 1</a-menu-item>
                <a-menu-item key="2">Option 2</a-menu-item>
            </a-sub-menu>
        </a-sub-menu>
    </a-menu>
</template>

<script>
    export default {
        name: "navBar",
        data() {
            return {
                current: ['mail'],
                openKeys: ['sub1'],
            }
        },
        methods: {
            handleClick(e) {
                switch (e.keyPath[1]) {
                    case 'sub1':
                        switch (e.keyPath[0]) {
                            case '1':
                                this.$router.push('/uploadImg');
                                break;
                            case '2':
                                break;
                            case '3':
                                this.$router.push('/startWelcome');
                                break;
                            case '4':
                                this.$router.push('/welcomeData');
                                break;

                        }
                }
                console.log('click', e)
            },
            titleClick(e) {
                console.log('titleClick', e)
            },
        },
        watch: {
            openKeys(val) {
                console.log('openKeys', val)
            },
        },
    }
</script>

<style scoped>

</style>
