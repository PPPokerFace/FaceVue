<template>
    <a-list
            :grid="{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }"
            :dataSource="data"
    >
        <a-list-item slot="renderItem" slot-scope="item, index">
            <a-card :title="item.title">{{item.text}}</a-card>
        </a-list-item>
    </a-list>
</template>

<script>
    import api from "../../common/api";
    const data=[];
    export default {
        name: "publicInfo",
        data() {
            return {
                data,
            }
        },
        mounted() {
            this.update_info();
        },
        methods: {
            update_info() {
                api.publicInfoList().then(response => {
                    this.data = response.data.results;
                })
            }
        }
    }
</script>

<style scoped>

</style>
