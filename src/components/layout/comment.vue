<template>
    <div>
        <a-textarea
                placeholder="输入你的评论"
                :rows="3"
                v-model="new_text"
                :style="{marginBottom:'10px'}"
                v-decorator="[
                          'title',
                          {rules: [{ required: true, message: 'Please input your note!' }]}
                        ]"
        />
        <a-button type="primary" @click="handleClick" block>评论</a-button>

        <a-list
                class="comment-list"
                :header="`${data.length} replies`"
                itemLayout="horizontal"
                :dataSource="data"
        >
            <a-list-item slot="renderItem" slot-scope="item, index">
                <a-comment :author="item.student_info.name" :style="{paddingBottom:'0px'}">
                    <p slot="content" style="word-break: break-all">{{item.text}}</p>
                </a-comment>
            </a-list-item>
        </a-list>
    </div>
</template>

<script>
    import api from "../../common/api";

    export default {
        name: "comment",
        data() {
            return {
                currentValue: 0,
                data: [],
                new_text: "",
            }
        },
        props: {
            select_postcard_id: {
                default: 0,
            }
        },
        mounted() {
            this.currentValue = this.select_postcard_id;
            console.log(this.select_postcard_id);
            api.commentList(this.currentValue).then(response => {
                this.data = response.data.results;
            })

        },
        watch: {
            select_postcard_id: {
                handler(value, oldvalue) {
                    this.currentValue = this.select_postcard_id;
                    console.log(this.currentValue)
                    api.commentList(this.currentValue).then(response => {
                        this.data = response.data.results;
                    })
                },
                immediate: true,
            },
        },
        methods: {
            handleClick() {
                api.addComment(this.currentValue, this.new_text).then(response => {
                    api.commentList(this.currentValue).then(response => {
                        this.data = response.data.results;
                        this.new_text = ''
                    })
                })
            }
        }

    }
</script>

<style scoped>

</style>
