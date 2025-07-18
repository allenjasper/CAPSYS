<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(Order::with('items.product')->get());
    }

    public function checkout(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $order = Order::create(['user_id' => $user->id, 'status' => 'pending']);

        foreach ($request->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
            ]);
        }

        return response()->json(['message' => 'Order placed']);
    }

    public function myOrders()
    {
        $user = Auth::user();
        return response()->json(Order::where('user_id', $user->id)->with('items.product')->get());
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();
        return response()->json(['message' => 'Updated']);
    }

    public function show($id)
    {
        $order = Order::with('items.product')->findOrFail($id);
        return response()->json($order);
    }

    public function markAsComplete($id)
    {
        $order = Order::findOrFail($id);
        $order->status = 'completed';
        $order->save();
        return response()->json(['message' => 'Order marked as complete']);
    }
}
