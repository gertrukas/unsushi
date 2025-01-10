import { Address } from "./address";

export interface Customer {
  _id?: string;                       // Identificador único (opcional)
  name: string;                       // Nombre del cliente
  rfc: string;                        // RFC del cliente
  phone: string;                      // Teléfono del cliente
  email: string;                      // Correo electrónico del cliente
  address: Address;                  // Objeto de dirección
  payment_method?: string;            // Método de pago (opcional)
  payment_terms?: string;             // Términos de pago (opcional)
  credit_limit?: number;              // Límite de crédito (opcional)
  balance?: number;                   // Saldo (opcional)
  additional_notes?: string;          // Notas adicionales (opcional)
  billing_history?: any[];            // Historial de facturación (opcional)
  created_at?: string;                // Fecha de creación (opcional)
  updated_at?: string;                // Fecha de actualización (opcional)
  active?: boolean;                   // Estado activo (opcional)
  delete?: boolean;                   // Estado de eliminación (opcional)
}
