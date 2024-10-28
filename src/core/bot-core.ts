import { Client, Message } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import * as conversacionCabeceraService from "../services/conversacion-cabecera.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";

export class BotCore {

    public static async procesarMensaje(client: Client, message: Message){
        console.log('********************************************')
        if(isContactMessage(message.from)){
            const telefono = extractPhoneNumber(message.from);
            const mensaje = message.body;

            console.log('telefono',telefono);
            console.log('mensaje',mensaje);

            const responseConversacionCabecera = await conversacionCabeceraService.obtenerUltimaConversacionCabecera(telefono);
            const conversacionCabecera = responseConversacionCabecera.data;

            const responseConversacion = await conversacionService.insertarConversacion({
                autor: 'U',
                idEstado: 1,
                idConversacionCabecera: conversacionCabecera.id_conversacion_cabecera,
                mensaje: mensaje,
                telefono: telefono
            });



        } else {
            console.log(`Ignorando mensaje recibido de ${message.from}`);
        }
    }
    
}