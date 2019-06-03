<template>
    <div style="text-align: center">
        <a-card id="components-card-demo-normal-login" title="请先登录">
            <a-form
                    id="components-form-demo-normal-login"
                    :form="form"
                    class="login-form"
                    @submit="handleSubmit"
                    :model="loginForm"
            >
                <a-form-item>
                    <a-input
                            v-decorator="[
                      'userName',
                      { rules: [{ required: true, message: 'Please input your username!' }] }
                    ]"
                            placeholder="Username"
                            v-model="loginForm.username"
                    >
                        <a-icon
                                slot="prefix"
                                type="user"
                                style="color: rgba(0,0,0,.25)">

                        </a-icon>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-input
                            v-decorator="[
                      'password',
                      { rules: [{ required: true, message: 'Please input your Password!' }] }
                    ]"
                            type="password"
                            placeholder="Password"
                            v-model="loginForm.password"
                    >
                        <a-icon
                                slot="prefix"
                                type="lock"
                                style="color: rgba(0,0,0,.25)">

                        </a-icon>
                    </a-input>
                </a-form-item>
                <a-form-item>
                    <a-button
                            type="primary"
                            class="login-form-button"
                            v-on:click="handleSubmit"
                    >
                        Log in
                    </a-button>
                    <a-button
                            type="default"
                            class="login-form-button"
                            v-on:click="handleRegister"
                    >
                        Register
                    </a-button>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script>
    import api from "@/common/api";

    export default {
        name: "login",
        data() {
            return {
                loginForm: {
                    username: '',
                    password: '',
                }
            }
        },
        beforeCreate() {
            this.form = this.$form.createForm(this);
        },
        methods: {
            handleSubmit(e) {
                // e.preventDefault();
                // this.form.validateFields((err, values) => {
                //     if (!err) {
                //         console.log('Received values of form: ', values);
                //     }
                // });
                let username = this.loginForm.username;
                let password = this.loginForm.password;
                this.$store.dispatch('login', {username, password})
                    .then((res) => {
                        api.getYearCheckInEvent().then(response => {
                            localStorage.setItem("yearcheckinevent", response.data.results[0]["id"].toString());
                        });
                        api.getStudent(this.$store.state.username).then(response => {
                            const stu_info = response.data.results[0];
                            localStorage.setItem("stu_number", stu_info["stu_number"])
                        });
                        this.$router.push('/publicInfo')

                    })
                    .catch(err => {
                        console.log(err)
                        this.$message.info('用户名或密码错误！');
                    });
                console.log('111')
            },
            handleRegister(e) {
                let username = this.loginForm.username;
                let password = this.loginForm.password;
                api.register(username, password).then(response => {
                    this.handleSubmit(null)
                })

            }
        },
    }
</script>

<style scoped>
    #components-card-demo-normal-login {
        max-width: 300px;
        margin: 0 auto;
    }

    #components-form-demo-normal-login {
        max-width: 500px;
    }

    #components-form-demo-normal-login .login-form-forgot {
        float: right;
    }

    #components-form-demo-normal-login .login-form-button {
        width: 100%;
    }
</style>
