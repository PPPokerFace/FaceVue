<template>
    <a-table :columns="columns" :dataSource="data" bordered>
        <template slot="name" slot-scope="text">
            <a href="javascript:;">{{text}}</a>
        </template>
        <template slot="title" slot-scope="currentPageData">
            Header
        </template>
        <template slot="footer" slot-scope="currentPageData">
            Footer
        </template>
    </a-table>
</template>

<script>
    import api from "@/common/api";

    const columns = [{
            title: 'time',
            dataIndex: 'time',
            sorter: true,
            width: '20%',
            scopedSlots: {customRender: 'time'},
        }, {
            title: 'student',
            dataIndex: 'student',
            width: '20%',
        },
        ]
    ;
    export default {
        name: "welcomeData",
        mounted() {
            this.getList();
        },
        data() {
            return {
                data: [],
                pagination: {},
                loading: false,
                columns,
            }
        },
        methods: {
            getList() {
                api.welcomeDataList().then((request) => {
                    this.data = request.data.results;
                })
            }
        }


    }
</script>

<style scoped>

</style>
