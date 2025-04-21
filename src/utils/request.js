import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router";

const developEnvironment = 'https://apifoxmock.com/m1/3128855-1224313-default';
const linkedEnvironment = 'http://localhost:8080';

const request = axios.create(
    {
        baseURL: '/api',
        timeout: 600000
    }
)

request.interceptors.request.use(
    (config) => {
        // console.log(config);
        const data = JSON.parse(localStorage.getItem('loginUser'));
        if (data && data.token) {
            config.headers.token = data.token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

request.interceptors.response.use(
    (response) => {
        console.log(response);

        return response.data
    },
    (error) => {
        console.log(error);
        if (error.response.status === 401) {
            ElMessage.error('登录已失效或未登录');
            router.push('/login');
            console.log('!');
        } else {
            ElMessage.error('服务器错误，请联系管理员处理')
        }
        return Promise.reject(error);
    }
)

export default request;