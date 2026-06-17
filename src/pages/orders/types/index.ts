/**
 * @file types.ts
 * @desc Khai báo các interface và type cho module Orders.
 */

export type PaymentMethod = "CASH" | "VNPAY" | null;

export interface OrderItem {
  id?: number | string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
  attributes?: { name: string; price: number }[];
}

export interface OrderDetails {
  id: number | string;
  orderCode?: string;
  branchId?: number;
  shiftSessionId?: number;
  customerName?: string;
  customerPhone?: string | null;
  tableId?: number | null;
  tableName?: string | null;
  subtotalAmount?: string | number;
  discountAmount?: string | number;
  taxAmount?: string | number;
  totalAmount?: string | number;
  orderStatus?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createTime?: string;
  createdAt?: string;
  cashierName?: string;
  totalItemQty?: number;
  itemCount?: number;
  items?: any[];
  orderItems?: any[];
  cashReceived?: number | null;
  cashChange?: number | null;
  vatAmount?: number;
  taxType?: string;
  vatType?: string;
  vatRate?: number;
  taxRate?: number;
  grandTotal?: number;
  total?: number;
  subTotal?: number;
  totalPrice?: number;
  totalDiscount?: number;
}

export interface PaymentRecord {
  id: number | string;
  status: string;
  amount: string | number;
  provider?: string;
  method?: string;
  createTime?: string;
  createdAt?: string;
}
