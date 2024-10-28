import { Client, Message } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import * as conversacionCabeceraService from "../services/conversacion-cabecera.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";

export class BotCore {

    public static async procesarMensaje(client: Client, message: Message){
        console.log('********************************************')
        if(isContactMessage(message.from)){
            const TELEFONO = extractPhoneNumber(message.from);
            const MENSAJE = message.body;

            console.log('telefono',TELEFONO);
            console.log('mensaje',MENSAJE);

            const responseConversacionCabecera = await conversacionCabeceraService.obtenerUltimaConversacionCabecera(TELEFONO);
            const conversacionCabecera = responseConversacionCabecera.data;

            const ESTADO = conversacionCabecera.ultimoEstado;

            const responseConversacion = await conversacionService.insertarConversacion({
                autor: 'U',
                idEstado: ESTADO,
                idConversacionCabecera: conversacionCabecera.idConversacionCabecera,
                mensaje: MENSAJE,
                telefono: TELEFONO
            });

        } else {
            console.log(`Ignorando mensaje recibido de ${message.from}`);
        }
    }
    
}