import { Client, Message } from "whatsapp-web.js";
import * as conversacionService from "../services/conversacion.service";
import { extractPhoneNumber, isContactMessage } from "../shared/util";

export class BotCore {

    public static async procesarMensaje(client: Client, message: Message){
        console.log('********************************************')
        if(isContactMessage(message.from)){
            console.log('message.body',message.body);
            console.log('message.from',message.from);
            
            const response = await conversacionService.insertarConversacion({
                autor: 'U',
                idEstado: 1,
                idConversacionCabecera: 1,
                mensaje: message.body,
                telefono: extractPhoneNumber(message.from)
            });
        } else {
            console.log(`Ignorando mensaje recibido de ${message.from}`)
        }
    }
    
}