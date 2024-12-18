import createAxios from "../shared/axios.config";
import { BASE_URL_API } from "../shared/constant";

const axios = createAxios(`${BASE_URL_API}/conversacion-cabeceras`);


export const obtenerUltimaConversacionCabecera = async (telefono: string) => {
    return (await axios.get(`/ultima/${telefono}`)).data;
}

export const actualizarConversacionCabecera = async (id: number, data: any) => {
    return (await axios.put(`/${id}`, data)).data;
}