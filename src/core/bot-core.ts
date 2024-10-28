import { Client, Message } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import * as conversacionCabeceraService from "../services/conversacion-cabecera.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";

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
                const conversacionCabecera = responseConversacionCabecera.data;

                const ESTADO = conversacionCabecera.ultimoEstado;
                const ID_CONVERSACION_CABECERA = conversacionCabecera.idConversacionCabecera;

                //GUARDAR SU MENSAJE ENTRANTE CON SU ULTIMO ESTADO ENCONTRADO
                await this.guardarMensajeUsuario(MENSAJE, ESTADO, ID_CONVERSACION_CABECERA, TELEFONO);

                switch (ESTADO) {
                    case 1:
                        await this.enviarMensajeUsuario(
                            `Hola, bienvenid@ al bot de Envios Devpool, estoy aquí para ayudarte. :)`
                            ,client,2,ID_CONVERSACION_CABECERA,TELEFONO);

                        await this.enviarMensajeUsuario(
                            `Elije una de estas opciones:\n
                            1. Programar dirección de envío\n
                            2. Ver pedidos en curso\n
                            3. Ver pedidos entregados\n
                            4. Ver preguntas frecuentes`
                            ,client,2,ID_CONVERSACION_CABECERA,TELEFONO);
                        break;
                    case 2:
                        await this.enviarMensajeUsuario(
                            `ahojra estas en el estado 2`
                            ,client,3,ID_CONVERSACION_CABECERA,TELEFONO);
                        break;
                    case 3:
                        await this.enviarMensajeUsuario(
                            `ahojra estas en el estado 3`
                            ,client,4,ID_CONVERSACION_CABECERA,TELEFONO);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error('Ha ocurrio un error general',error);
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
            autor: 'U',
            idEstado: idEstado,
            idConversacionCabecera: idConversacionCabecera,
            mensaje: mensaje,
            telefono: telefono
        });
    }
    
}