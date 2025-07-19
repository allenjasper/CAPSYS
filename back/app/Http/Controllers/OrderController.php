<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Exports\OrderExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'user_id' => $order->user_id,
                    'customer_id' => $order->customer_id ?? $order->user_id,
                    'customer_name' => $order->user->name ?? 'N/A',
                    'customer_email' => $order->user->email ?? 'N/A',
                    'status' => $order->status,
                    'status_label' => $order->status_label,
                    'priority_level' => $order->priority_level,
                    'priority_label' => $order->priority_label,
                    'total_price' => $order->total_price,
                    'checkout_date' => $order->checkout_date,
                    'delivery_date' => $order->delivery_date,
                    'estimated_delivery' => $order->estimated_delivery,
                    'tracking_number' => $order->tracking_number,
                    'shipping_address' => $order->shipping_address,
                    'notes' => $order->notes,
                    'items_count' => $order->items->count(),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->name ?? 'N/A',
                            'qty' => $item->qty,
                            'price' => $item->price ?? $item->product->price ?? 0
                        ];
                    }),
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $orders,
            'message' => 'Orders retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:users,id',
            'total_price' => 'required|numeric|min:0',
            'priority_level' => 'nullable|in:low,normal,high,urgent',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0'
        ]);

        $user = Auth::user();
        $customerId = $validated['customer_id'] ?? $user->id;

        $order = Order::create([
            'user_id' => $customerId,
            'customer_id' => $customerId,
            'total_price' => $validated['total_price'],
            'status' => 'pending',
            'priority_level' => $validated['priority_level'] ?? 'normal',
            'shipping_address' => $validated['shipping_address'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'checkout_date' => now(),
            'tracking_number' => 'TRK-' . strtoupper(Str::random(10))
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'price' => $item['price'] ?? null
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order->load(['user', 'items.product']),
            'message' => 'Order created successfully'
        ], 201);
    }

    public function checkout(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'total_price' => 'required|numeric|min:0',
            'shipping_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'priority_level' => 'nullable|in:low,normal,high,urgent'
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'customer_id' => $user->id,
            'total_price' => $validated['total_price'],
            'status' => 'pending',
            'priority_level' => $validated['priority_level'] ?? 'normal',
            'shipping_address' => $validated['shipping_address'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'checkout_date' => now(),
            'tracking_number' => 'TRK-' . strtoupper(Str::random(10))
        ]);

        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'qty' => $item['qty']
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order->load(['user', 'items.product']),
            'message' => 'Order placed successfully'
        ]);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($id);
        
        $data = [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'customer_id' => $order->customer_id ?? $order->user_id,
            'customer_name' => $order->user->name ?? 'N/A',
            'customer_email' => $order->user->email ?? 'N/A',
            'status' => $order->status,
            'status_label' => $order->status_label,
            'priority_level' => $order->priority_level,
            'priority_label' => $order->priority_label,
            'total_price' => $order->total_price,
            'checkout_date' => $order->checkout_date,
            'delivery_date' => $order->delivery_date,
            'estimated_delivery' => $order->estimated_delivery,
            'tracking_number' => $order->tracking_number,
            'shipping_address' => $order->shipping_address,
            'notes' => $order->notes,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name ?? 'N/A',
                    'product_price' => $item->product->price ?? 0,
                    'qty' => $item->qty,
                    'price' => $item->price ?? $item->product->price ?? 0,
                    'subtotal' => ($item->price ?? $item->product->price ?? 0) * $item->qty
                ];
            }),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'message' => 'Order retrieved successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,confirmed,in_production,quality_check,ready_for_shipping,shipped,delivered,cancelled',
            'priority_level' => 'sometimes|in:low,normal,high,urgent',
            'delivery_date' => 'sometimes|date',
            'shipping_address' => 'sometimes|string',
            'notes' => 'sometimes|string'
        ]);

        $order->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $order->fresh()->load(['user', 'items.product']),
            'message' => 'Order updated successfully'
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,in_production,quality_check,ready_for_shipping,shipped,delivered,cancelled'
        ]);

        $order->update([
            'status' => $validated['status'],
            'delivery_date' => $validated['status'] === 'delivered' ? now() : $order->delivery_date
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $order->fresh(),
            'message' => 'Order status updated successfully'
        ]);
    }

    public function myOrders()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $orders = Order::where('user_id', $user->id)
            ->with(['items.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'status_label' => $order->status_label,
                    'priority_level' => $order->priority_level,
                    'priority_label' => $order->priority_label,
                    'total_price' => $order->total_price,
                    'checkout_date' => $order->checkout_date,
                    'estimated_delivery' => $order->estimated_delivery,
                    'tracking_number' => $order->tracking_number,
                    'items_count' => $order->items->count(),
                    'created_at' => $order->created_at
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $orders,
            'message' => 'Customer orders retrieved successfully'
        ]);
    }

    public function markAsComplete($id)
    {
        $order = Order::findOrFail($id);
        $order->update([
            'status' => 'delivered',
            'delivery_date' => now()
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $order->fresh(),
            'message' => 'Order marked as complete'
        ]);
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        
        // Only allow deletion of pending or cancelled orders
        if (!in_array($order->status, ['pending', 'cancelled'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete order with current status'
            ], 400);
        }

        $order->items()->delete();
        $order->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Export orders data to Excel
     */
    public function export()
    {
        return Excel::download(new OrderExport, 'orders_report_' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Track order by tracking number
     */
    public function track($trackingNumber)
    {
        $order = Order::where('tracking_number', $trackingNumber)
            ->with(['user', 'items.product'])
            ->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found with this tracking number'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $order->id,
                'tracking_number' => $order->tracking_number,
                'status' => $order->status,
                'status_label' => $order->status_label,
                'estimated_delivery' => $order->estimated_delivery,
                'delivery_date' => $order->delivery_date,
                'created_at' => $order->created_at
            ],
            'message' => 'Order tracking information retrieved successfully'
        ]);
    }

    /**
     * Get order analytics
     */
    public function analytics()
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        // Orders summary
        $totalOrders = Order::count();
        $todayOrders = Order::whereDate('created_at', $today)->count();
        $weeklyOrders = Order::where('created_at', '>=', $thisWeek)->count();
        $monthlyOrders = Order::where('created_at', '>=', $thisMonth)->count();

        // Revenue summary
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_price');
        $monthlyRevenue = Order::where('created_at', '>=', $thisMonth)
            ->where('status', '!=', 'cancelled')
            ->sum('total_price');

        // Orders by status
        $ordersByStatus = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        // Orders by priority
        $ordersByPriority = Order::selectRaw('priority_level, count(*) as count')
            ->groupBy('priority_level')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total_orders' => $totalOrders,
                    'today_orders' => $todayOrders,
                    'weekly_orders' => $weeklyOrders,
                    'monthly_orders' => $monthlyOrders,
                    'total_revenue' => $totalRevenue,
                    'monthly_revenue' => $monthlyRevenue
                ],
                'by_status' => $ordersByStatus,
                'by_priority' => $ordersByPriority
            ],
            'message' => 'Order analytics retrieved successfully'
        ]);
    }
}
