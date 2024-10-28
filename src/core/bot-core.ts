import { Client, Message } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import * as conversacionCabeceraService from "../services/conversacion-cabecera.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";
import { ESTADO_1, ESTADO_2, ESTADO_3, ESTADO_4, ESTADO_6, ESTADO_7, ESTADO_9 } from "../shared/constant";
import { ConversacionCabecera } from "../models/conversacion-cabecera";

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

                //GUARDAR SU MENSAJE ENTRANTE CON SU ULTIMO ESTADO ENCONTRADO
                await this.guardarMensajeUsuario(MENSAJE, ESTADO, ID_CONVERSACION_CABECERA, TELEFONO);

                switch (ESTADO) {
                    case ESTADO_1:
                        await this.enviarMensajeUsuario(
                            `Hola, bienvenid@ al bot de Envios Devpool, estoy aquí para ayudarte. :)`
                            ,client,ESTADO_2,ID_CONVERSACION_CABECERA,TELEFONO);

                        await this.enviarMensajeUsuario(
                            [
                            'Elije una de estas opciones:',
                            '1. Programar dirección de envío',
                            '2. Ver pedidos en curso',
                            '3. Ver pedidos entregados',
                            '4. Ver preguntas frecuentes',
                            ].join('\n')
                            ,client,ESTADO_2,ID_CONVERSACION_CABECERA,TELEFONO);
                        break;
                    case ESTADO_2:
                        if(['1','2','3','4'].includes(MENSAJE)){
                            if(['1','2','3'].includes(MENSAJE) && !conversacionCabecera.idCliente){
                                await this.enviarMensajeUsuario(
                                    `Debes ingresar tu Documento de Identidad`
                                    ,client,ESTADO_9,ID_CONVERSACION_CABECERA,TELEFONO);
                                return;
                            }
                            switch(MENSAJE){
                                case '1':
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Estos son tus pedidos pendientes:',
                                        '1. Pedido #20654',
                                        '2. Pedido #20655',
                                        ].join('\n')
                                        ,client,ESTADO_4,ID_CONVERSACION_CABECERA,TELEFONO);
                                    break;
                                case '2':
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Estos son tus pedidos curso:',
                                        '1. Pedido #3030',
                                        '2. Pedido #4040',
                                        ].join('\n')
                                        ,client,ESTADO_6,ID_CONVERSACION_CABECERA,TELEFONO);
                                    break;
                                case '3':
                                    await this.enviarMensajeUsuario(
                                        [
                                        'Estos son tus pedidos entregado:',
                                        '1. Pedido #5050',
                                        '2. Pedido #6060',
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
                                ,client,ESTADO_2,ID_CONVERSACION_CABECERA,TELEFONO);
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