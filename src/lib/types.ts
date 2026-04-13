import type {
  Admin,
  Client,
  PaymentMethod,
  Product,
  Sale,
  SaleItem,
  Seller,
  Transaction,
} from '@prisma/client'

export type AdminSummary = Pick<Admin, 'id' | 'nombre'>

export type ClientFormData = Pick<Client, 'cedula' | 'nombre' | 'telefono' | 'correo'>

export type SellerFormData = Pick<Seller, 'nombre'>

export type ProductFormData = Pick<Product, 'nombre' | 'precio' | 'precio_minimo'>

export type PaymentMethodFormData = Pick<PaymentMethod, 'nombre'>

export type SaleFormItem = {
  nombre: string
  cantidad: number
  precio_unitario: number
}

export type SalePaymentInput = {
  metodoPagoId: string
  valor: number | ''
}

export type CreateSaleInput = ClientFormData & {
  items: SaleFormItem[]
  pagos: SalePaymentInput[]
  observaciones: string
  vendedor_nombre: string
  fecha_venta: string
  pagado: boolean
}

export type HistoricalSale = Sale & {
  client: Client | null
  fecha_venta?: Date | null
  pagado?: boolean | null
  items: Array<
    SaleItem & {
      product: Product | null
    }
  >
  transactions: Array<
    Transaction & {
      paymentMethod: PaymentMethod | null
    }
  >
}
