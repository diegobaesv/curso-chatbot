import axios from "axios";

const createAxios = (url: string)=>{
    const instance = axios.create({
        baseURL: url
    });

    instance.interceptors.request.use((request)=>{
        console.log(`==> ${request.method.toUpperCase()} ${request.baseURL}${request.url} ${request.data ? JSON.stringify(request.data) : ''}`);
        return request;
    });

    instance.interceptors.response.use((response)=>{
        console.log(`<== ${response.status} ${response.data ? JSON.stringify(response.data) : '{NO BODY}'}`);
        return response;
    });

    return instance;

}

export default createAxios;