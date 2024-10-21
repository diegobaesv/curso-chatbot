import { Client, Message } from "whatsapp-web.js";

export class BotCore {

    public static async procesarMensaje(client: Client, message: Message){
        console.log('*** PROCESO INICIADO****');
        console.log(message.body);
        console.log('*** PROCESO TERMINADO****');
    }

    
}