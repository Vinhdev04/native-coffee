/**
 * @file constants.ts
 * @desc Các hằng số, enum và cấu hình trạng thái của module Orders.
 */

import { Clock, CheckCircle, XCircle } from "lucide-react-native";

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  READY = "READY",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
  CANCEL = "CANCEL",
}

export const PENDING_STATUSES = [
  OrderStatus.PENDING,
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.READY,
  OrderStatus.DRAFT,
];

export const DONE_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.DONE,
];

export const CANCEL_STATUSES = [
  OrderStatus.CANCELLED,
  OrderStatus.CANCEL,
];

export const getStatusConfig = (t: (key: string) => string) => ({
  [OrderStatus.DRAFT]: {
    label: t("status_draft") || "Nháp",
    color: "#6B7280",
    bg: "#F3F4F6",
    Icon: Clock,
  },
  [OrderStatus.PENDING]: {
    label: t("pending") || "Đang chờ",
    color: "#D97706",
    bg: "#FEF3C7",
    Icon: Clock,
  },
  [OrderStatus.PENDING_PAYMENT]: {
    label: t("status_pending_payment") || "Chờ thanh toán",
    color: "#D97706",
    bg: "#FEF3C7",
    Icon: Clock,
  },
  [OrderStatus.PAID]: {
    label: t("status_paid") || "Đã thanh toán",
    color: "#059669",
    bg: "#D1FAE5",
    Icon: CheckCircle,
  },
  [OrderStatus.READY]: {
    label: t("status_ready") || "Sẵn sàng",
    color: "#2563EB",
    bg: "#DBEAFE",
    Icon: CheckCircle,
  },
  [OrderStatus.DONE]: {
    label: t("done") || "Hoàn thành",
    color: "#059669",
    bg: "#D1FAE5",
    Icon: CheckCircle,
  },
  [OrderStatus.CANCELLED]: {
    label: t("status_cancelled") || "Đã hủy",
    color: "#DC2626",
    bg: "#FEE2E2",
    Icon: XCircle,
  },
  [OrderStatus.CANCEL]: {
    label: t("status_cancelled") || "Đã hủy",
    color: "#DC2626",
    bg: "#FEE2E2",
    Icon: XCircle,
  },
});

export const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  SUCCESS: { label: "Thành công", color: "#065F46", bg: "#D1FAE5" },
  PAID: { label: "Đã thanh toán", color: "#065F46", bg: "#D1FAE5" },
  COMPLETED: { label: "Hoàn thành", color: "#065F46", bg: "#D1FAE5" },
  PENDING: { label: "Đang xử lý", color: "#92400E", bg: "#FEF3C7" },
  PROCESSING: { label: "Đang xử lý", color: "#92400E", bg: "#FEF3C7" },
  FAILED: { label: "Thất bại", color: "#991B1B", bg: "#FEE2E2" },
  CANCELLED: { label: "Đã hủy", color: "#6B7280", bg: "#F3F4F6" },
};
