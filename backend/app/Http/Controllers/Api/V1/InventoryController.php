<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Inventory::orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'qty' => 'integer',
            'unit' => 'nullable|string',
            'exp_date' => 'nullable|date',
            'category' => 'nullable|string',
            'method' => 'nullable|string',
            'stock' => 'integer',
            'min_stock' => 'integer',
        ]);
        $row = Inventory::create($data);
        return response()->json($row, 201);
    }

    public function show($id)
    {
        return response()->json(Inventory::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $row = Inventory::findOrFail($id);
        $row->update($request->only(['name','qty','unit','exp_date','category','method','stock','min_stock']));
        return response()->json($row);
    }

    public function destroy($id)
    {
        Inventory::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // Log perubahan stok
    public function log(Request $request)
    {
        $data = $request->validate([
            'inventory_id' => 'required|integer',
            'change' => 'required|integer',
            'note' => 'nullable|string',
        ]);
        $log = \App\Models\InventoryLog::create($data);
        return response()->json($log, 201);
    }

    public function logs()
    {
        return response()->json(['data' => \App\Models\InventoryLog::orderBy('created_at','desc')->get()]);
    }
}
