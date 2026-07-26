<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Order;
use Illuminate\Http\Request;

/**
 * Metrics dashboard (penjualan, rata-rata, dll).
 * Frontend DashboardModule memakai supabase.from('transactions').select('total').
 */
class DashboardController extends Controller
{
    public function metrics(Request $request)
    {
        $from = $request->input('from');
        $to = $request->input('to');

        $txQ = Transaction::query();
        if ($from) $txQ->where('created_at', '>=', $from);
        if ($to) $txQ->where('created_at', '<=', $to);

        $totalRevenue = (float) $txQ->sum('total');
        $txCount = (int) $txQ->count();
        $avgOrder = $txCount > 0 ? ($totalRevenue / $txCount) : 0;

        $orderQ = Order::query();
        if ($from) $orderQ->where('created_at', '>=', $from);
        if ($to) $orderQ->where('created_at', '<=', $to);
        $orderCount = (int) $orderQ->count();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'transaction_count' => $txCount,
            'avg_order_value' => round($avgOrder, 2),
            'order_count' => $orderCount,
        ]);
    }
}
