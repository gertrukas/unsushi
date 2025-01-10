export interface Address {
  _id: string;
  street: string;             // Calle
  external_number: string;    // Número externo
  internal_number?: string;    // Número interno (opcional)
  neighborhood?: string;       // Barrio (opcional)
  city?: string;               // Ciudad (opcional)
  state?: string;              // Estado (opcional)
  postal_code?: string;        // Código postal (opcional)
  country?: string;            // País (opcional)
  created_at?: string;         // Fecha de creación (opcional)
  updated_at?: string;         // Fecha de actualización (opcional)
}
