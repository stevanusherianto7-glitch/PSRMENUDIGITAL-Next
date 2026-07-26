<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Asset::orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'category' => 'nullable|string',
            'quantity' => 'integer',
            'condition' => 'nullable|string',
        ]);
        $row = Asset::create($data);
        return response()->json($row, 201);
    }

    public function show($id)
    {
        return response()->json(Asset::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $row = Asset::findOrFail($id);
        $row->update($request->only(['name', 'category', 'quantity', 'condition']));
        return response()->json($row);
    }

    public function destroy($id)
    {
        Asset::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}
