import createAxios from "../shared/axios.config";
import { BASE_URL_API } from "../shared/constant";

const axios = createAxios(`${BASE_URL_API}/pedidos`);


export const listarPedidosFiltro = async (idCliente: number, estado: string) => {
    return (await axios.get(`/filtro?idCliente=${idCliente}&estado=${estado}`)).data;
}

export const actualizarPedidoByCodPedido = async (codPedido: string, data: any) => {
    return (await axios.put(`/cod-pedido/${codPedido}`, data)).data;
}