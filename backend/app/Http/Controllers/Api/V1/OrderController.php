<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $q = Order::orderBy('created_at', 'desc');
        if ($request->filled('status')) $q->where('status', $request->status);
        if ($request->filled('table_id')) $q->where('table_id', $request->table_id);

        $total = $q->count();
        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 20);
        $data = $q->offset(($page - 1) * $limit)->limit($limit)->get();

        return response()->json(['data' => $data, 'total' => $total]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'table_id' => 'required|string',
            'items' => 'nullable|array',
            'subtotal' => 'required|integer',
            'total' => 'required|integer',
            'notes' => 'nullable|string',
            'order_mode' => 'string',
            'status' => 'string',
            'type' => 'string',
            'idempotency_key' => 'nullable|string|unique:orders,idempotency_key',
        ]);

        // Idempotency: tolak duplikat (frontend mengirim idempotency_key sama)
        if (!empty($data['idempotency_key'])) {
            $existing = Order::where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing) {
                return response()->json($existing, 200);
            }
        }

        $order = Order::create($data);
        return response()->json($order, 201);
    }

    public function show($id)
    {
        return response()->json(Order::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->all());
        return response()->json($order);
    }

    public function destroy($id)
    {
        Order::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }
}
