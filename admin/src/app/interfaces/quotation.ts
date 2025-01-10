import { Product } from "./product";
import { IUserModel } from "../_fake/services/user-service";
import { Customer } from "./customer";


export interface Quotation {
  _id: string;
  customer_id: Customer;         // ID del proveedor (referencia a Supplier)
  order_number: string;        // Número de orden
  items: Item[];               // Lista de artículos (ver interfaz Item abajo)
  total_amount: number;        // Monto total de la orden
  created_by: IUserModel;          // ID del usuario que crea la orden
  order_date?: Date;           // Fecha de creación de la orden (opcional)
  due_date?: Date;             // Fecha de vencimiento de la orden (opcional)
  status: 'pending' | 'paid' | 'cancelled'; // Estado de la orden
  notes?: string;              // Notas adicionales (opcional)
  created_at: Date;            // Fecha de creación (sería establecido automáticamente)
  updated_at: Date;            // Fecha de última actualización (sería establecido automáticamente)
  discount?: number;
  pdf_file?: string;
  mark?: string;
  model?: string;
  series?: string;
  engine?: string;
  active: boolean;             // Estado de actividad
  delete: boolean;             // Indicador de eliminación
}

// Interfaz para representar cada artículo en la orden
export interface Item {
  product_id: Product;             // ID del artículo
  quantity: number;              // Cantidad del artículo
  observation: string;
  delivery_time: string;
  quantity_tmp: number;          // Cantidad del artículo temporal
  price: number;               // Precio por unidad del artículo
  total: number;               // Total para ese artículo (cantidad * precio)
}
