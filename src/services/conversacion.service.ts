import { InsertarConversacionRequest } from "../payloads/requests/insertar-conversacion.request";
import createAxios from "../shared/axios.config";
import { BASE_URL_API } from "../shared/constant";

const axios = createAxios(`${BASE_URL_API}/conversaciones`);

export const insertarConversacion = async (request: InsertarConversacionRequest)=> {
    return (await axios.post('/',request)).data;
}