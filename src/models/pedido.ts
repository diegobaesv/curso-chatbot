export interface Pedido {
    idPedido: number;
    idCliente: number;
    codPedido: string;
    direccion: string;
    latitud: string;
    longitud: string;
    estado: string;
    fechaEmision: string;
    fechaCurso: string;
    fechaEntrega: string;
    estadoAuditoria: string;
    fechaCreacionAuditoria: string;
}