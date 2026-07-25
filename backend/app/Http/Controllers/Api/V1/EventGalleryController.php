<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EventPhoto;
use Illuminate\Http\Request;

class EventGalleryController extends Controller
{
    public function index()
    {
        return response()->json(['data' => EventPhoto::orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'image' => 'required|string',
            'title' => 'required|string',
            'date' => 'nullable|string',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
        ]);
        $photo = EventPhoto::create($data);
        return response()->json($photo, 201);
    }

    public function show($id)
    {
        return response()->json(EventPhoto::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $photo = EventPhoto::findOrFail($id);
        $photo->update($request->all());
        return response()->json($photo);
    }

    public function destroy($id)
    {
        EventPhoto::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}
