import request from "../utils/request";

export const loginApi = (user) => {
    return request.post('/login', user);
}