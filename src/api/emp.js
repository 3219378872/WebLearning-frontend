import request from "../utils/request";

export const queryByParams = async (queryParams) => {
    return await request.get(`/emps?name=${queryParams.value.name}&gender=${queryParams.value.gender}&begin=${queryParams.value.begin}&end=${queryParams.value.end}&page=${queryParams.value.page}&pageSize=${queryParams.value.pageSize}`);
}

export const saveEmpApi = (emp) => {
    return request.post('/emps', emp);
}
export const updateEmpApi = (emp) => {
    return request.put('/emps', emp);
}

export const queryEmpByIdApi = (id) => {
    return request.get(`/emps/${id}`);
}

export const deleteEmpApi = (ids) => {
    return request.delete(`/emps?ids=${ids}`);
}