<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TransactionItem;
use Illuminate\Http\Request;

class TransactionItemController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'transaction_id' => 'required|integer',
            'name' => 'required|string',
            'price' => 'required|numeric',
            'qty' => 'integer',
        ]);
        $row = TransactionItem::create($data);
        return response()->json($row, 201);
    }
}
