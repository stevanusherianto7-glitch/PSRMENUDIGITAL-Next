<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json(['data' => MenuItem::orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|integer',
            'image' => 'nullable|string',
            'available' => 'boolean',
            'tag' => 'nullable|string',
            'description' => 'nullable|string',
        ]);
        $item = MenuItem::create($data);
        return response()->json($item, 201);
    }

    public function show($id)
    {
        return response()->json(MenuItem::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $item = MenuItem::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        MenuItem::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    // Bulk sync dari frontend (fallback localStorage -> backend)
    public function sync(Request $request)
    {
        $items = $request->input('items', []);
        foreach ($items as $it) {
            if (!isset($it['id'])) continue;
            MenuItem::updateOrCreate(['id' => $it['id']], $it);
        }
        return response()->json(['ok' => true]);
    }
}
