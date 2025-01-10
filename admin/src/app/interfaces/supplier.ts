import { Address } from "./address";

export interface Supplier {
  _id: string;                       // Identificador único (opcional)
  name: string;                       // Nombre del proveedor
  rfc: string;                        // RFC del proveedor
  phone: string;                      // Teléfono del proveedor
  email: string;                      // Correo electrónico del proveedor
  address: Address;                  // Objeto de dirección
  payment_method?: string;            // Método de pago (opcional)
  payment_terms?: string;             // Términos de pago (opcional)
  credit_granted?: number;            // Crédito otorgado (opcional)
  balance?: number;                   // Saldo (opcional)
  additional_notes?: string;          // Notas adicionales (opcional)
  purchase_history?: any[];           // Historial de compras (opcional)
  created_at?: string;                // Fecha de creación (opcional)
  updated_at?: string;                // Fecha de actualización (opcional)
  active?: boolean;                   // Estado activo (opcional)
  delete?: boolean;                   // Estado de eliminación (opcional)
}
