import { Client, Message } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import * as conversacionCabeceraService from "../services/conversacion-cabecera.service";
import * as clienteService from "../services/cliente.service";
import * as pedidoService from "../services/pedido.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";
import { ESTADO_1, ESTADO_2, ESTADO_3, ESTADO_4, ESTADO_5, ESTADO_6, ESTADO_7, ESTADO_9, ESTADO_PEDIDO_CURSO, ESTADO_PEDIDO_ENTREGADO, ESTADO_PEDIDO_PENDIENTE } from "../shared/constant";
import { ConversacionCabecera } from "../models/conversacion-cabecera";
import { Cliente } from "../models/cliente";
import { Pedido } from "../models/pedido";

export class BotCore {

    public static async procesarMensaje(client: Client, message: Message){
        console.log('********************************************');
        if(isContactMessage(message.from)){
            try {
                const TELEFONO = extractPhoneNumber(message.from);
                const MENSAJE = message.body;

                console.log('telefono',TELEFONO);
                console.log('mensaje',MENSAJE);

                //OBTENGO STATUS ACTUAL DEL NUMERO QUE ME ESCRIBE
                const responseConversacionCabecera = await conversacionCabeceraService.obtenerUltimaConversacionCabecera(TELEFONO);
                const conversacionCabecera: ConversacionCabecera = responseConversacionCabecera.data;

                const ESTADO = conversacionCabecera.ultimoEstado;
                const ID_CONVERSACION_CABECERA = conversacionCabecera.idConversacionCabecera;
                const ID_CLIENTE = conversacionCabecera.idCliente;

                //GUARDAR SU MENSAJE ENTRANTE CON SU ULTIMO ESTADO ENCONTRADO
                await this.guardarMensajeUsuario(MENSAJE, ESTADO, ID_CONVERSACION_CABECERA, TELEFONO);

                switch (ESTADO) {
                    case ESTADO_1:
                        await this.enviarMensajeUsuario(
                            `Hola 😁, bienvenid@ al bot de Envios Devpool 🚚, estoy aquí para ayudarte. 😉🤲`
                            ,client,ESTADO_2,ID_CONVERSACION_CABECERA,TELEFONO);

                        await this.enviarMensajeUsuario(
                            [
                            'Elije una de estas opciones ⬇️:',
                            '1. 🗺️ Ver pedidos pendientes de entrega',
                            '2. 🚚 Ver pedidos en curso',
                            '3. ✅ Ver pedidos entregados',
                            '4. ❔ Ver preguntas frecuentes',
                            ].join('\n')
                            ,client,ESTADO_2,ID_CONVERSACION_CABECERA,TELEFONO);
                        break;
                    case ESTADO_2:
                        if(['1','2','3','4'].includes(MENSAJE)){
                            if(['1','2','3'].includes(MENSAJE) && !ID_CLIENTE){
                                await this.enviarMensajeUsuario(
                                    `Para estas ver opciones, por tu segurtidad debes ingresar tu Documento de Identidad 🪪`
                                    ,client,ESTADO_9,ID_CONVERSACION_CABECERA,TELEFONO);
                                return;
                            }
                            switch(MENSAJE){
                                case '1':
                                    const pedidosPendientes: Pedido[] = (await pedidoService.listarPedidosFiltro(ID_CLIENTE, ESTADO_PEDIDO_PENDIENTE)).data;
                                    const mensajePedidosPendientes: string[] = pedidosPendientes.map((ped,i)=>{
                                        return `${(i+1)}. Pedido #${ped.codPedido}`
                                    });
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Estos son tus pedidos pendientes ⬇️:',
                                        ...mensajePedidosPendientes
                                        ].join('\n')
                                        ,client,ESTADO_4,ID_CONVERSACION_CABECERA,TELEFONO);
                                    break;
                                case '2':
                                    const pedidosCurso: Pedido[] = (await pedidoService.listarPedidosFiltro(ID_CLIENTE, ESTADO_PEDIDO_CURSO)).data;
                                    const mensajePedidosCurso: string[] = pedidosCurso.map((ped,i)=>{
                                        return `${(i+1)}. Pedido #${ped.codPedido}`
                                    });
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Estos son tus pedidos curso ⬇️:',
                                        ...mensajePedidosCurso,
                                        ].join('\n')
                                        ,client,ESTADO_6,ID_CONVERSACION_CABECERA,TELEFONO);
                                    break;
                                case '3':
                                    const pedidosEntregados: Pedido[] = (await pedidoService.listarPedidosFiltro(ID_CLIENTE, ESTADO_PEDIDO_ENTREGADO)).data;
                                    const mensajePedidosEntregados: string[] = pedidosEntregados.map((ped,i)=>{
                                        return `${(i+1)}. Pedido #${ped.codPedido}`
                                    });
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Estos son tus pedidos entregado ⬇️:',
                                        ...mensajePedidosEntregados,
                                        ].join('\n')
                                        ,client,ESTADO_7,ID_CONVERSACION_CABECERA,TELEFONO);
                                    break;
                                case '4':
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Elige una pregunta:',
                                        '1. Tiendas Cercanas',
                                        '2. Horarios de servicio',
                                        '3. Telefono de asesores',
                                        '4. Metodos de pago',
                                        ].join('\n')
                                        ,client,ESTADO_3,ID_CONVERSACION_CABECERA,TELEFONO);
                                    break;
                            }
                        } else{
                            await this.enviarMensajeUsuario(
                                `Debes enviar una opción correcta.`
                                ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                        }
                        break;
                    case ESTADO_9:
                        const cliente: Cliente = (await clienteService.obtenerClientePorNumeroDocumento(MENSAJE)).data;
                        if(cliente){
                            await clienteService.actualizarTelefonoCliente(cliente.idCliente, TELEFONO);
                            await this.enviarMensajeUsuario(
                                `Bienvenido ${cliente.nombres.toUpperCase()} ${cliente.apellidoPaterno.toUpperCase()} 😁, ya hemos vinculado este numero a tu documento. Puedes volver a iniciar la conversación. 🤲`
                                ,client,ESTADO_1,ID_CONVERSACION_CABECERA,TELEFONO);
                        } else {
                            await this.enviarMensajeUsuario(
                                `⚠️ Debes enviar un documento existente.`
                                ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                        }
                        break;
                    default:
                        await this.enviarMensajeUsuario(
                            `Ahora estas en el estado: ${ESTADO}`
                            ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                        break;
                }
            } catch (error) {
                console.error('Ha ocurrio un error general',error.message);
            }
        } else {
            console.log(`Ignorando mensaje recibido de ${message.from}`);
        }
    }

    private static async guardarMensajeUsuario(mensaje: string, idEstado: number, idConversacionCabecera: number, telefono: string){
        await conversacionService.insertarConversacion({
            autor: 'U',
            idEstado: idEstado,
            idConversacionCabecera: idConversacionCabecera,
            mensaje: mensaje,
            telefono: telefono
        });
    }

    private static async enviarMensajeUsuario(mensaje: string, client: Client, idEstado: number, idConversacionCabecera: number,  telefono: string){
        await client.sendMessage(`${telefono}@c.us`, mensaje);
        await conversacionService.insertarConversacion({
            autor: 'B',
            idEstado: idEstado,
            idConversacionCabecera: idConversacionCabecera,
            mensaje: mensaje,
            telefono: telefono
        });
    }
    
}