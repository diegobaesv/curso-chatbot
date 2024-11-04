import createAxios from "../shared/axios.config";
import { BASE_URL_API } from "../shared/constant";

const axios = createAxios(`${BASE_URL_API}/clientes`);

export const obtenerClientePorNumeroDocumento = async (numeroDocumento: string) => {
    return (await axios.get(`/numero-documento/${numeroDocumento}`)).data;
}

export const actualizarTelefonoCliente = async (idCliente: number, telefono: string) => {
    return (await axios.put(`/actualizar-telefono`,{idCliente,telefono})).data;
}
