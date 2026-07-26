<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Meja;
use Illuminate\Http\Request;

/**
 * Meja (status occupied). Dipakai useSupabaseStatus untuk ping koneksi.
 */
class MejaController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Meja::orderBy('label')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => 'required|string|unique:meja,label',
            'occupied' => 'boolean',
        ]);
        $row = Meja::create($data);
        return response()->json($row, 201);
    }

    public function update(Request $request, $id)
    {
        $row = Meja::findOrFail($id);
        $row->update($request->only(['label', 'occupied']));
        return response()->json($row);
    }

    public function destroy($id)
    {
        Meja::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // Bulk seed meja dari frontend (SEED_TABLES)
    public function seed(Request $request)
    {
        $rows = $request->input('rows', []);
        foreach ($rows as $r) {
            Meja::updateOrCreate(
                ['id' => $r['id']],
                [
                    'label' => $r['label'] ?? $r['id'],
                    'occupied' => $r['occupied'] ?? false,
                    'seat' => $r['seat'] ?? null,
                    'status' => $r['status'] ?? null,
                ]
            );
        }
        return response()->json(['ok' => true, 'count' => count($rows)]);
    }
}
