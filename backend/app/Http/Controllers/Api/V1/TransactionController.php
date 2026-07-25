<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $q = Transaction::orderBy('created_at', 'desc');
        if ($request->filled('from')) $q->where('created_at', '>=', $request->from);
        if ($request->filled('to')) $q->where('created_at', '<=', $request->to);
        $total = $q->count();
        $page = (int) $request->input('page', 1);
        $limit = (int) $request->input('limit', 50);
        $data = $q->offset(($page - 1) * $limit)->limit($limit)->get();
        return response()->json(['data' => $data, 'total' => $total]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'table_id' => 'nullable|string',
            'items' => 'nullable|array',
            'subtotal' => 'required|integer',
            'tax' => 'integer',
            'total' => 'required|integer',
            'method' => 'string',
        ]);
        $tx = Transaction::create($data);
        return response()->json($tx, 201);
    }
}
