import { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { BotCore } from "./core/bot-core";

const client: Client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
        defaultViewport: null
    },
    authStrategy: new LocalAuth()
});

client.on('qr', (qr: any)=>{
    qrcode.generate(qr,{small:true});
});

client.on('authenticated',()=>{
    console.log('Se ha autenticado correctamente!');
});

client.on('auth_failure',()=>{
    console.log('Hubo un error al autenticarse');
});

client.on('ready',()=>{
    console.log('El Bot esta listo y escuchando!');
});

client.on('message',(message: Message)=>{
    BotCore.procesarMensaje(client,message);
});

client.initialize();