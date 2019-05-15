<template>
    <div>
        <a-drawer
                placement="right"
                :closable="false"
                @close="onClose"
                :visible="commen_visible"
        >
            <comment :select_postcard_id="select_postcard_id" :delete_able="delete_able"></comment>
        </a-drawer>


        <a-modal
                title="新帖子"
                :visible="visible"
                @ok="handleOk"
                :confirmLoading="confirmLoading"
                @cancel="handleCancel"
        >
            <a-form>
                <a-form-item>
                    <a-input
                            v-decorator="[
                          'title',
                          {rules: [{ required: true, message: 'Please input your note!' }]}
                        ]"
                            placeholder="标题"
                            v-model="new_title"
                    />
                </a-form-item>
                <a-form-item>
                    <a-textarea
                            v-decorator="[
                      'text',
                      {rules: [{ required: true, message: 'Please input your note!' }]}
                    ]"
                            placeholder="内容"
                            v-model="new_text"
                            :rows="4"
                    >

                    </a-textarea>
                </a-form-item>
            </a-form>
        </a-modal>


        <a-list
                class="demo-loadmore-list"
                :loading="loading"
                itemLayout="horizontal"
                :dataSource="data"
        >
            <div v-if="showLoadingMore" slot="loadMore"
                 :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }">
                <a-spin v-if="loadingMore"/>
                <a-button v-else @click="onLoadMore">loading more</a-button>
                <a-button type="primary" @click="showModal" style="margin-left: 10px">添加</a-button>
            </div>
            <a-list-item slot="renderItem" slot-scope="item, index" @click="handleClickPostCard(item.id)"
                         :rowKey="item.id">
                <a-list-item-meta
                        :description="item.text"
                >
                    <a slot="title">{{item.title}}</a>
                </a-list-item-meta>
                <div>{{item.student_info.name}}</div>
            </a-list-item>
        </a-list>
    </div>
</template>

<script>
    import api from "../../common/api";
    import AFormItem from "ant-design-vue/es/form/FormItem";
    import Comment from './comment.vue'

    export default {
        name: "myPostCard",
        components: {
            AFormItem,
            Comment,
        },
        data() {
            return {
                loading: true,
                loadingMore: false,
                showLoadingMore: true,
                data: [],
                page: 1,

                ModalText: 'Content of the modal',
                visible: false,
                confirmLoading: false,
                new_title: '',
                new_text: '',
                select_postcard_id: undefined,

                commen_visible: false
            }
        },
        mounted() {
            this.getData((res) => {
                this.loading = false;
                this.data = res
            })
        },
        methods: {
            getData(callback) {
                api.myPostCardList(this.page).then(response => {
                    callback(response.data.results)
                    this.page++;
                })
            },
            onLoadMore() {
                this.loadingMore = true;
                this.getData((res) => {
                    this.data = this.data.concat(res);
                    this.loadingMore = false;
                    this.$nextTick(() => {
                        window.dispatchEvent(new Event('resize'))
                    })
                })
            },
            showModal() {
                this.visible = true
            },
            handleOk(e) {
                this.ModalText = 'The modal will be closed after two seconds';
                this.confirmLoading = true;
                api.addPostCard(this.new_title, this.new_text).then((response) => {
                    this.visible = false;
                    this.confirmLoading = false;
                    this.page = 1;
                    this.new_text = '';
                    this.new_title = '';
                    this.getData((res) => {
                        this.loading = false;
                        this.data = res;
                        // console.log(res);
                        // console.log(this.data)
                    });
                }, 2000);
            },
            handleCancel(e) {
                console.log('Clicked cancel button');
                this.visible = false
            },
            handleClickPostCard(id) {
                this.commen_visible = true;
                this.select_postcard_id = id;
                this.delete_able = true;
            },
            onClose() {
                this.commen_visible = false;
            },
        }

    }
</script>

<style scoped>
    .demo-loadmore-list {
        min-height: 350px;
    }
    .ant-form-item {
        margin-bottom: 10px;
    }
</style>
