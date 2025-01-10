import { Customer } from "./customer";
import { Catalogs } from "./catalogs";

export interface Invoice {
  customer_id: Customer;             // ID del cliente
  total_amount: number;            // Monto total de la factura
  items: Item[];                   // Lista de artículos en la factura
  invoice_number: string;          // Número de la factura
  uuid: string;                    // UUID de la factura (CFDI)
  rfc: string;                     // RFC del cliente
  issue_date?: Date;               // Fecha de emisión
  xml_file?: string;               // Archivo XML de la factura
  pdf_file?: string;               // Archivo PDF de la factura
  original_chain?: string;         // Cadena original para validar la factura
  digital_stamp?: string;          // Sello digital de la factura
  is_canceled?: boolean;           // Estado de la factura (cancelada o no)
  invoice_type?: string;           // Tipo de factura (Ingreso, Egreso, etc.)
  series?: string;                 // Serie de la factura
  folio?: string;                  // Folio de la factura
  issue_place?: string;            // Lugar de emisión
  payment_method?: Catalogs;         // Método de pago
  currency?: Catalogs;               // Moneda (ej: MXN)
  payment_conditions?: string;     // Condiciones de pago
  payment_form?: Catalogs;           // Forma de pago (01 - Efectivo)
  cfdi_usage?: string;             // Uso de CFDI (ej: P01 - Pagos)
  confirmation_code?: Catalogs;      // Código de confirmación, si aplica
  export_status?: string;          // Exportación (01 - No aplica)
  created_at?: Date;               // Fecha de creación del registro
  updated_at?: Date;               // Fecha de última actualización
}

export interface Item {
  product_id: string;       // ID del producto
  quantity: number;         // Cantidad de productos
  description: string;      // Descripción del producto
  unit_price: number;       // Precio por unidad
  total: number;            // Importe total
}
