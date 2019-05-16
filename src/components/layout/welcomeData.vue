<template>
    <a-table :columns="columns"
             :rowKey="data => data.id"
             :dataSource="data"
             :pagination="pagination"
             :loading="loading"
             @change="handleTableChange"
    >
        <template slot="time" slot-scope="time">
            {{time}}
        </template>
    </a-table>
</template>

<script>
    import api from "@/common/api";

    const columns = [{
            title: '时间',
            dataIndex: 'time',
            sorter: true,
            width: '20%',
            scopedSlots: {customRender: 'time'},
        }, {
            title: '学生',
            dataIndex: 'student_info.name',
            width: '20%',
        },
        ]
    ;
    export default {
        name: "welcomeData",
        mounted() {
            this.fetch();
        },
        data() {
            return {
                data: [],
                pagination: {},
                loading: false,
                columns,
            }
        },
        prpos: {
            refresh: {
                default: 0
            }
        },
        methods: {
            handleTableChange(pagination, filters, sorter) {
                console.log(pagination);
                const pager = {...this.pagination};
                pager.current = pagination.current;
                this.pagination = pager;
                this.fetch({
                    results: pagination.pageSize,
                    page: pagination.current,
                    sortField: sorter.field,
                    sortOrder: sorter.order,
                    ...filters,
                });
            },
            fetch(params = {}) {
                console.log('params:', params);
                this.loading = true
                api.welcomeDataList(params.sortOrder, params.page).then((response) => {
                    const pagination = {...this.pagination};
                    // Read total count from server
                    pagination.total = response.data.count;
                    this.loading = false;
                    this.data = response.data.results;
                    this.pagination = pagination;
                });
            },

            getList() {
                api.welcomeDataList().then((request) => {
                    this.data = request.data.results;
                })
            }
        },
        watch: {
            refresh: {
                handler(value, oldvalue) {
                    this.refresh = this.refresh - 1;
                    this.fetch();
                },
                immediate: true,
            }
        }


    }
</script>

<style scoped>

</style>
