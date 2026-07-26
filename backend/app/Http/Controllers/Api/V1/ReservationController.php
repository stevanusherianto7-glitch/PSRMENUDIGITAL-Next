<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Reservation::orderBy('created_at','desc')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'date' => 'nullable|string',
            'party' => 'nullable|integer',
            'status' => 'string',
            'note' => 'nullable|string',
        ]);
        $row = Reservation::create($data);
        return response()->json($row, 201);
    }

    public function show($id)
    {
        return response()->json(Reservation::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $row = Reservation::findOrFail($id);
        $row->update($request->only(['name','date','party','status','note']));
        return response()->json($row);
    }

    public function destroy($id)
    {
        Reservation::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}
