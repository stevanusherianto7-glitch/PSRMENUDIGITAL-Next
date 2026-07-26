<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JadwalShift;
use App\Models\Attendance;
use Illuminate\Http\Request;

/**
 * Karyawan + Jadwal Shift (satu tabel jadwal_shift).
 * Attendances dipisah di /api/v1/attendances.
 */
class JadwalShiftController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => JadwalShift::orderBy('employee_name')->get()
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_name' => 'required|string',
            'role' => 'required|string|in:waiter,kitchen,manager,owner,admin',
            'schedule' => 'nullable|array',
        ]);
        $row = JadwalShift::create($data);
        return response()->json($row, 201);
    }

    public function show($id)
    {
        return response()->json(JadwalShift::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $row = JadwalShift::findOrFail($id);
        $row->update($request->only(['employee_name', 'role', 'schedule']));
        return response()->json($row);
    }

    public function destroy($id)
    {
        JadwalShift::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // Attendances
    public function indexAttendances()
    {
        return response()->json([
            'data' => Attendance::orderBy('clock_in', 'desc')->get()
        ]);
    }

    public function storeAttendance(Request $request)
    {
        $data = $request->validate([
            'employee_name' => 'required|string',
            'role' => 'nullable|string',
            'clock_in' => 'nullable|date',
            'clock_out' => 'nullable|date',
        ]);
        $row = Attendance::create($data);
        return response()->json($row, 201);
    }
}
