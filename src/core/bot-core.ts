import { Client, Message, MessageMedia, MessageTypes } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import * as conversacionCabeceraService from "../services/conversacion-cabecera.service";
import * as clienteService from "../services/cliente.service";
import * as pedidoService from "../services/pedido.service";
import * as documentoService from "../services/documento.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";
import { ESTADO_1, ESTADO_2, ESTADO_3, ESTADO_4, ESTADO_5, ESTADO_6, ESTADO_7, ESTADO_8, ESTADO_9, ESTADO_PEDIDO_CURSO, ESTADO_PEDIDO_ENTREGADO, ESTADO_PEDIDO_PENDIENTE } from "../shared/constant";
import { ConversacionCabecera } from "../models/conversacion-cabecera";
import { Cliente } from "../models/cliente";
import { Pedido } from "../models/pedido";

export class BotCore {

    public static async procesarMensaje(client: Client, message: Message){
        console.log('********************************************');
        if(isContactMessage(message.from) && (message.type === MessageTypes.TEXT || message.type === MessageTypes.LOCATION)) {
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
                if(message.type == MessageTypes.TEXT ) {
                    await this.guardarMensajeUsuario(MENSAJE, ESTADO, ID_CONVERSACION_CABECERA, TELEFONO);
                }
                
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
                                        return `${(i+1)}. Pedido #${ped.codPedido}\n${ped.direccion ? ped.direccion : 'Sin programar'}\n`
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
                                    await this.enviarMensajeUsuario(
                                        'Puedes volver a escribirnos para otra consulta. 😉🤲',
                                        client,ESTADO_1,ID_CONVERSACION_CABECERA,TELEFONO);
                                    await conversacionCabeceraService.actualizarConversacionCabecera(ID_CONVERSACION_CABECERA, {estadoFlujo: 'T'});
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
                    case ESTADO_4:
                        if(MENSAJE.match(/^\d+$/)){
                            const pedidosPendientes: Pedido[] = (await pedidoService.listarPedidosFiltro(ID_CLIENTE, ESTADO_PEDIDO_PENDIENTE)).data;
                            const pedidoSeleccionado = pedidosPendientes[parseInt(MENSAJE)-1];
                            await conversacionCabeceraService.actualizarConversacionCabecera(ID_CONVERSACION_CABECERA, {codPedido: pedidoSeleccionado.codPedido});
                            await this.enviarMensajeUsuario(
                                'Compartenos tu ubicación para programar la entrega de tu pedido 🚚🗺️'
                                ,client,ESTADO_5,ID_CONVERSACION_CABECERA,TELEFONO);
                        }else{
                            await this.enviarMensajeUsuario(
                                `Debes enviar un número de la lista.`
                                ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                        }
                        break;
                    case ESTADO_5:
                        if(message.type === 'location'){
                            const { latitude, longitude } = message.location;
                            const { direccion } = (await pedidoService.actualizarPedidoByCodPedido(conversacionCabecera.codPedido, {latitud: latitude, longitud: longitude})).data;
                            await this.enviarMensajeUsuario(`Gracias por compartir tu ubicación 🗺️, tu pedido será entregado en ${direccion}.`,
                                client,ESTADO_1,ID_CONVERSACION_CABECERA,TELEFONO);
                            await conversacionCabeceraService.actualizarConversacionCabecera(ID_CONVERSACION_CABECERA, {estadoFlujo: 'T'});
                        }else{
                            await this.enviarMensajeUsuario(
                                `Debes enviar tu ubicación desde tu teléfono 🗺️.`
                                ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                        }
                        break;
                    case ESTADO_7:
                        if(MENSAJE.match(/^\d+$/)){
                            const pedidosEntregados: Pedido[] = (await pedidoService.listarPedidosFiltro(ID_CLIENTE, ESTADO_PEDIDO_ENTREGADO)).data;
                            const pedidoSeleccionado = pedidosEntregados[parseInt(MENSAJE)-1];
                            await conversacionCabeceraService.actualizarConversacionCabecera(ID_CONVERSACION_CABECERA, {codPedido: pedidoSeleccionado.codPedido});
                            const documentos = (await documentoService.listarDocumentosPorCodPedido(pedidoSeleccionado.codPedido)).data;
                            const mensajeDocumentos: string[] = documentos.map((doc,i)=>{
                                return `${(i+1)}. Descargar ${doc.nombre}`
                            });
                            await this.enviarMensajeUsuario(
                                [
                                'Estos son tus documentos por descargar ⬇️:',
                                ...mensajeDocumentos,
                                ].join('\n')
                                ,client,ESTADO_8,ID_CONVERSACION_CABECERA,TELEFONO);
                        }else{
                            await this.enviarMensajeUsuario(
                                `Debes enviar un número de la lista.`
                                ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                        }
                        break;
                    case ESTADO_8:
                        if(MENSAJE.match(/^\d+$/)){
                            const documentos = (await documentoService.listarDocumentosPorCodPedido(conversacionCabecera.codPedido)).data;
                            const documentoSeleccionado = documentos[parseInt(MENSAJE)-1];
                            await this.enviarMensajeUsuario(
                                `Descargando ${documentoSeleccionado.nombre} 📄📥, espera unos segundos.`
                                ,client,ESTADO,ID_CONVERSACION_CABECERA,TELEFONO);
                            await this.enviarArchivoUsuario(documentoSeleccionado.rutaUrl, client, ESTADO, ID_CONVERSACION_CABECERA, TELEFONO);
                            await this.enviarMensajeUsuario(
                                    'Puedes volver a escribirnos para otra consulta. 😉🤲',
                                    client,ESTADO_1,ID_CONVERSACION_CABECERA,TELEFONO);
                            await conversacionCabeceraService.actualizarConversacionCabecera(ID_CONVERSACION_CABECERA, {estadoFlujo: 'T'});
                        }else{
                            await this.enviarMensajeUsuario(
                                `Debes enviar un número de la lista.`
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

    private static async enviarArchivoUsuario(url:string, client: Client, idEstado: number, idConversacionCabecera: number,  telefono: string){
        await client.sendMessage(`${telefono}@c.us`, await MessageMedia.fromUrl(url));
    }

    
}