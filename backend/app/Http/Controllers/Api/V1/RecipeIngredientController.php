<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BahanResep;
use Illuminate\Http\Request;

class RecipeIngredientController extends Controller
{
    public function index()
    {
        return response()->json(['data' => BahanResep::orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'unit' => 'nullable|string',
        ]);
        $row = BahanResep::create($data);
        return response()->json($row, 201);
    }

    public function show($id)
    {
        return response()->json(BahanResep::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $row = BahanResep::findOrFail($id);
        $row->update($request->only(['name', 'price', 'unit']));
        return response()->json($row);
    }

    public function destroy($id)
    {
        BahanResep::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}
