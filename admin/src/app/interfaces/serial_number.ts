import { Product } from "./product";

export interface SerialNumber {
  serial: string;                    // Número de serie como cadena
  product_id: Product;                // ID del producto como cadena (ObjectId en MongoDB)
  status?: 'available' | 'sold';     // Estado del número de serie (opcional)
  created_at: Date;                  // Fecha de creación
  updated_at: Date;                  // Fecha de actualización
}
