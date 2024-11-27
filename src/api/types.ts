// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Json = Record<string, any>
type IsoDate = string // ISO date string

export interface BaseRecord {
  id: string
  created: IsoDate
  updated: IsoDate
}

export interface Product extends BaseRecord {
  title: string
  description?: string
  price: number
  in_stock?: boolean
  attributes?: Json
}

export interface ProductWithQuantity extends Product {
  quantity: number
}

export interface QuoteItem {
  product_name: string
  quantity: number
  price: number
  subtotal: number // quantity * price
}

export interface Quote extends BaseRecord {
  customer_info: Json
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  items: QuoteItem[]
  subtotal: number // sum of all item.subtotal
  total_tax: number
  total: number // subtotal + total_tax
  valid_until?: IsoDate
  description?: string
}
export type QuoteStatus = Quote['status']

const DATE_FIELDS = ['created', 'updated', 'valid_until'] as const
const NUMBER_FIELDS = ['subtotal', 'total', 'total_tax'] as const

type DateField = (typeof DATE_FIELDS)[number]
type NumberField = (typeof NUMBER_FIELDS)[number]
export type SortableField = 'status' | DateField | NumberField
export type FilterableField = SortableField // we can sort and filter by the same fields for now

export const isNumberField = (field: string): field is NumberField => NUMBER_FIELDS.includes(field as NumberField)
export const isDateField = (field: string): field is DateField => DATE_FIELDS.includes(field as DateField)
