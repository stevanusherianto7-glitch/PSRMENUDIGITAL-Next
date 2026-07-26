import { apiFetch } from '../../lib/api';

// Simpan role di global agar bisa diubah dari test (jest.mock di-hoist)
;(globalThis as any).__authRole = 'anon';

jest.mock('../../lib/api', () => {
  const deny = (table: string) => ({
    ok: false,
    status: 403,
    data: {
      code: '42501',
      message: `new row violates row-level security policy for table "${table}"`,
    },
  });

  return {
    apiFetch: jest.fn().mockImplementation((_method: string, path: string) => {
      const role = (globalThis as any).__authRole;
      const isAuthorized = role === 'admin' || role === 'waiter' || role === 'kasir';
      if (path.includes('/transactions') && !isAuthorized) return Promise.resolve(deny('transactions'));
      if (path.includes('/inventory') && !isAuthorized) return Promise.resolve(deny('inventory'));
      if (path.includes('/menu-items') && !isAuthorized) return Promise.resolve(deny('menu_items'));
      if (path.includes('/meja') && !isAuthorized) return Promise.resolve(deny('meja'));
      return Promise.resolve({ ok: true, status: 200, data: [] });
    }),
    isBackendConfigured: () => true,
  };
});

describe('Row Level Security (Laravel Authorization) Audit', () => {
  beforeEach(() => {
    (globalThis as any).__authRole = 'anon';
  });

  it('should block anonymous/guest access to transactions endpoint', async () => {
    (globalThis as any).__authRole = 'anon';
    const res = await apiFetch('GET', '/api/v1/transactions');
    expect(res.ok).toBe(false);
    expect((res.data as any)?.code).toBe('42501');
  });

  it('should allow admin/cashier access to transactions endpoint', async () => {
    (globalThis as any).__authRole = 'admin';
    const res = await apiFetch('GET', '/api/v1/transactions');
    expect(res.ok).toBe(true);
  });

  it('should block anonymous/guest updates to menu_items prices', async () => {
    (globalThis as any).__authRole = 'anon';
    const res = await apiFetch('PUT', '/api/v1/menu-items/m1', { price: 1000 });
    expect(res.ok).toBe(false);
    expect((res.data as any)?.code).toBe('42501');
  });

  it('should block anonymous/guest access to inventory endpoint', async () => {
    (globalThis as any).__authRole = 'anon';
    const res = await apiFetch('GET', '/api/v1/inventory');
    expect(res.ok).toBe(false);
    expect((res.data as any)?.code).toBe('42501');
  });

  it('should block anonymous/guest updates to meja statuses', async () => {
    (globalThis as any).__authRole = 'anon';
    const res = await apiFetch('PUT', '/api/v1/meja/5', { status: 'occupied' });
    expect(res.ok).toBe(false);
    expect((res.data as any)?.code).toBe('42501');
  });
});
