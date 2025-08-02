import { EstadoDeudaReference } from "./enums/estado-deuda-reference.enum";

export interface EstadoCuentaDto {
    identifier: string;
    descripcion: string;
    montoOriginal: number;
    descuento: number;
    mora?: number;
    montoAPagar: number;
    fechaVencimiento: string;
    estadoDeuda: EstadoDeudaReference;
}