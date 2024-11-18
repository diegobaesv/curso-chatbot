import createAxios from "../shared/axios.config";
import { BASE_URL_API } from "../shared/constant";

const axios = createAxios(`${BASE_URL_API}/documentos`);

export const listarDocumentosPorCodPedido = async (codPedido: string) => {
    return (await axios.get(`/pedido/${codPedido}`)).data;
}