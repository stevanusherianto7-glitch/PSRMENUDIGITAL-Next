/**
 * ⚠️ DILARANG KERAS UNTUK MENGUBAH ATAU MEMODIFIKASI FILE INI TANPA IZIN SENIOR ARCHITECT.
 * FILE INI BERISI SELURUH OPERASI CRUD ORDER & TRANSAKSI LANGSUNG KE SUPABASE.
 * KESALAHAN MODIFIKASI DAPAT MENYEBABKAN PESANAN TIDAK MASUK ATAU DATA HILANG. ⚠️
 *
 * v2.0 — Direct Supabase (menggantikan Edge Function + KV Store)
 * Alasan migrasi:
 *   - Edge Function menyimpan order di kv_store (bukan tabel relasional)
 *   - Sering gagal / cold start lambat → pesanan hilang
 *   - Tidak bisa query efisien (filter, sort, pagination)
 *   - Supabase Realtime tidak bisa subscribe ke kv_store
 */

import { apiFetch, isBackendConfigured } from "../lib/api";
import type {
  Order,
  CartItem,
  OrderType,
  OrderMode,
  OrderStatus,
  Transaction,
  PaginatedResponse,
} from "./types";

// ─── ORDER ID GENERATOR ─────────────────────────────────────────────────────
function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/**
 * Fetch orders, optionally filter by status and/or tableId.
 */
/**
 * DTO Adapter: Maps snake_case database columns to camelCase properties.
 * This guarantees frontend compatibility even if duplicate database columns are dropped!
 */
export function mapOrder(o: unknown): Order {
  if (!o) return o as unknown as Order;
  const obj = o as Record<string, unknown>;
  const mapped = {
    ...obj,
    tableId: (obj.table_id || obj.tableId || "") as string,
    orderMode: (obj.order_mode || obj.orderMode || obj.mode || "dine-in") as OrderMode,
  };
  delete (mapped as Record<string, unknown>).table_id;
  delete (mapped as Record<string, unknown>).order_mode;
  return mapped as unknown as Order;
}

export async function fetchOrders(status?: string, tableId?: string): Promise<Order[]> {
  if (isBackendConfigured()) {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (tableId) qs.set('table_id', tableId);
    const res = await apiFetch<{ data: any[] }>('GET', `/api/v1/orders?${qs.toString()}`);
    if (res.ok) {
      const arr = Array.isArray(res.data) ? res.data : (res.data as { data: any[] }).data ?? [];
      return (arr as unknown[]).map(mapOrder);
    }
  }
  // Fallback localStorage
  try {
    const raw = localStorage.getItem('local_orders');
    let list: any[] = raw ? JSON.parse(raw) : [];
    if (status) list = list.filter((o) => (o.status || 'pending') === status);
    if (tableId) list = list.filter((o) => (o.tableId || o.table_id) === tableId);
    return list.map(mapOrder);
  } catch {
    return [];
  }
}

/**
 * Fetch paginated orders for Admin/Kasir modules.
 */
export async function fetchPaginatedOrders(
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<PaginatedResponse<Order>> {
  if (isBackendConfigured()) {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    if (status) qs.set('status', status);
    const res = await apiFetch<{ data: any[]; total: number }>('GET', `/api/v1/orders?${qs.toString()}`);
    if (res.ok) {
      const arr = Array.isArray(res.data) ? res.data : (res.data as { data: any[] }).data ?? [];
      return {
        data: arr.map(mapOrder),
        total: (res.data as any).total || arr.length,
        page,
        limit,
      };
    }
  }
  // Fallback localStorage
  try {
    const raw = localStorage.getItem('local_orders');
    let list: any[] = raw ? JSON.parse(raw) : [];
    if (status) list = list.filter((o) => (o.status || 'pending') === status);
    const start = (page - 1) * limit;
    return {
      data: list.slice(start, start + limit).map(mapOrder),
      total: list.length,
      page,
      limit,
    };
  } catch {
    return { data: [], total: 0, page, limit };
  }
}

/**
 * Create a new order.
 * Mendukung idempotencyKey untuk mencegah insert duplikat di database (server-side dedup).
 */
export async function createOrder(payload: {
  tableId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  notes?: string;
  orderMode: OrderMode;
  type: OrderType;
  idempotencyKey?: string;
}): Promise<Order> {
  const order: Record<string, any> = {
    id: generateOrderId(),
    table_id: payload.tableId,
    tableId: payload.tableId,
    items: payload.items.map((c) => ({
      id: c.id,
      name: c.name,
      price: c.price,
      qty: c.qty,
      category: c.category,
    })),
    subtotal: payload.subtotal,
    total: payload.total,
    notes: payload.notes || "",
    order_mode: payload.orderMode,
    orderMode: payload.orderMode,
    status: "pending" as OrderStatus,
    type: payload.type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (payload.idempotencyKey) order.idempotency_key = payload.idempotencyKey;

  if (isBackendConfigured()) {
    const res = await apiFetch<Order>('POST', '/api/v1/orders', order);
    if (res.ok) return mapOrder(res.data);
    // fall through ke localStorage bila backend gagal
  }
  // Fallback localStorage
  try {
    const raw = localStorage.getItem('local_orders');
    const list: any[] = raw ? JSON.parse(raw) : [];
    list.push(order);
    localStorage.setItem('local_orders', JSON.stringify(list));
  } catch { /* ignore */ }
  return mapOrder(order);
}

/**
 * Update an existing order (e.g., change status).
 */
export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order> {
  const { id: _omit, created_at: _omit2, ...safePatch } = patch as Record<string, unknown>;
  const body = { ...safePatch, updated_at: new Date().toISOString() };

  if (isBackendConfigured()) {
    const res = await apiFetch<Order>('PUT', `/api/v1/orders/${id}`, body);
    if (res.ok) return mapOrder(res.data);
    // fall through ke localStorage bila backend gagal
  }
  // Fallback localStorage
  try {
    const raw = localStorage.getItem('local_orders');
    const list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((o) => o.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...body };
      localStorage.setItem('local_orders', JSON.stringify(list));
      return mapOrder(list[idx]);
    }
  } catch { /* ignore */ }
  return mapOrder({ id, ...body } as unknown as Order);
}

/**
 * Delete an order by ID.
 */
export async function deleteOrder(id: string): Promise<void> {
  if (isBackendConfigured()) {
    const res = await apiFetch('DELETE', `/api/v1/orders/${id}`);
    if (res.ok) return;
  }
  // Fallback localStorage
  try {
    const raw = localStorage.getItem('local_orders');
    const list: any[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem('local_orders', JSON.stringify(list.filter((o) => o.id !== id)));
  } catch { /* ignore */ }
}

/**
 * Calculate the processing duration of an order in minutes.
 * If the order is served, it uses the duration between created_at and served_at.
 * If the order is active, it uses the duration from created_at to now.
 */
export function getOrderDuration(order: Order): number {
  if (!order.created_at) return 0;
  
  const parseUtcDate = (dateStr?: string) => {
    if (!dateStr) return new Date();
    const cleanStr = dateStr.includes("Z") || dateStr.includes("+") 
      ? dateStr 
      : `${dateStr.replace(" ", "T")}Z`;
    return new Date(cleanStr);
  };

  const start = parseUtcDate(order.created_at).getTime();
  const end = order.served_at 
    ? parseUtcDate(order.served_at).getTime()
    : order.status === "served"
      ? parseUtcDate(order.updated_at).getTime()
      : Date.now();
  
  const diffMinutes = Math.floor((end - start) / 60000);
  return Math.max(0, diffMinutes);
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────

/**
 * Fetch paginated transactions with optional date range filter.
 */
export async function fetchTransactions(
  page: number = 1,
  limit: number = 50,
  dateRange?: { from?: Date; to?: Date }
): Promise<PaginatedResponse<Transaction>> {
  if (isBackendConfigured()) {
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(limit));
    if (dateRange?.from) qs.set('from', dateRange.from.toISOString());
    if (dateRange?.to) qs.set('to', dateRange.to.toISOString());
    const res = await apiFetch<{ data: Transaction[]; total: number }>('GET', `/api/v1/transactions?${qs.toString()}`);
    if (res.ok) {
      const arr = Array.isArray(res.data) ? res.data : (res.data as { data: Transaction[] }).data ?? [];
      return { data: arr, total: (res.data as any).total || arr.length, page, limit };
    }
  }
  // Fallback localStorage
  try {
    const raw = localStorage.getItem('local_transactions');
    const list: Transaction[] = raw ? JSON.parse(raw) : [];
    return { data: list.slice((page - 1) * limit, page * limit), total: list.length, page, limit };
  } catch {
    return { data: [], total: 0, page, limit };
  }
}
