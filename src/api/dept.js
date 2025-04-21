import request from "@/utils/request";

export const queryAllDeptapi = () => {
    return request.get('/depts');
}


export const addDeptApi = (dept) => {
    return request.post('/depts', dept)
}

export const queryByIdApi = (id) => {
    return request.get(`/depts/${id}`)
}

export const updateDeptApi = (dept) => {
    return request.put('/depts', dept)
}

export const deleteById = (id) => {
    return request.delete(`/depts?id=${id}`, id);
}