import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { JadwalShift } from '../../app/components/JadwalShift';
import { apiFetch, isBackendConfigured } from '../../lib/api';

// Mock Laravel HTTP client
jest.mock('../../lib/api', () => {
  const mockImpl = jest.fn();
  return {
    apiFetch: mockImpl,
    isBackendConfigured: () => true,
    __setMock: (fn: any) => mockImpl.mockImplementation(fn),
  };
});

describe('SDM Shift Schedule - Robustness & Offline Fallback Simulations', () => {
  const mockApiFetch: any = (apiFetch as any);

  const setResponse = (resp: any) => {
    (apiFetch as any).mockImplementation(() => Promise.resolve(resp));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should fallback to hardcoded mock employee schedule data when backend connection is offline or fails', async () => {
    // Backend returns error (offline/timeout) -> repository falls back to local seed
    setResponse({ ok: false, status: 500, data: { error: { code: '57P01', message: 'Database connection failed / timeout' } } });

    render(<JadwalShift dateRange={undefined} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Budi Santoso/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Siti Aminah/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Agus Setiawan/i)[0]).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Kasir/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Waiter/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Chef/i)[0]).toBeInTheDocument();
  });

  it('should load and render employee schedule data successfully when backend connection is active', async () => {
    const mockDbData = [
      { id: '10', employee_name: 'Antg Staff 1', role: 'Kasir', schedule: ['P', 'P', 'M', 'M', 'O', 'P', 'P'] },
      { id: '11', employee_name: 'Antg Staff 2', role: 'Waiter', schedule: ['M', 'M', 'O', 'P', 'P', 'M', 'M'] },
    ];

    setResponse({ ok: true, status: 200, data: { data: mockDbData } });

    render(<JadwalShift dateRange={undefined} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Antg Staff 1/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Antg Staff 2/i)[0]).toBeInTheDocument();
    });

    expect(screen.queryByText(/Budi Santoso/i)).toBeNull();
  });
});
