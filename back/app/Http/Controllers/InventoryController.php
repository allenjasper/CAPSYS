<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Exports\InventoryExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class InventoryController extends Controller
{
    public function index()
    {
        $inventories = Inventory::all()->map(function ($item) {
            return [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'material' => $item->material,
                'stock' => $item->stock,
                'quantity' => $item->quantity,
                'reorder_point' => $item->reorder_point,
                'daily_usage_avg' => $item->daily_usage_avg,
                'unit_cost' => $item->unit_cost,
                'supplier' => $item->supplier,
                'lead_time_days' => $item->lead_time_days,
                'needs_reorder' => $item->needsReorder(),
                'days_until_stockout' => $item->daysUntilStockout(),
                'recommended_order_qty' => $item->recommendedOrderQuantity(),
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $inventories,
            'message' => 'Inventory data retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'required|string|unique:inventories',
            'name' => 'required|string',
            'material' => 'required|string',
            'stock' => 'required|integer|min:0',
            'quantity' => 'nullable|integer|min:0',
            'reorder_point' => 'required|integer|min:0',
            'daily_usage_avg' => 'required|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'supplier' => 'nullable|string',
            'lead_time_days' => 'required|integer|min:1'
        ]);

        $inventory = Inventory::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $inventory,
            'message' => 'Inventory item created successfully'
        ], 201);
    }

    public function show($id)
    {
        $inventory = Inventory::findOrFail($id);
        
        $data = [
            'id' => $inventory->id,
            'sku' => $inventory->sku,
            'name' => $inventory->name,
            'material' => $inventory->material,
            'stock' => $inventory->stock,
            'quantity' => $inventory->quantity,
            'reorder_point' => $inventory->reorder_point,
            'daily_usage_avg' => $inventory->daily_usage_avg,
            'unit_cost' => $inventory->unit_cost,
            'supplier' => $inventory->supplier,
            'lead_time_days' => $inventory->lead_time_days,
            'needs_reorder' => $inventory->needsReorder(),
            'days_until_stockout' => $inventory->daysUntilStockout(),
            'recommended_order_qty' => $inventory->recommendedOrderQuantity(),
            'created_at' => $inventory->created_at,
            'updated_at' => $inventory->updated_at
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'message' => 'Inventory item retrieved successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);
        
        $validated = $request->validate([
            'sku' => 'sometimes|string|unique:inventories,sku,' . $id,
            'name' => 'sometimes|string',
            'material' => 'sometimes|string',
            'stock' => 'sometimes|integer|min:0',
            'quantity' => 'sometimes|integer|min:0',
            'reorder_point' => 'sometimes|integer|min:0',
            'daily_usage_avg' => 'sometimes|numeric|min:0',
            'unit_cost' => 'sometimes|numeric|min:0',
            'supplier' => 'sometimes|string',
            'lead_time_days' => 'sometimes|integer|min:1'
        ]);

        $inventory->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $inventory->fresh(),
            'message' => 'Inventory item updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Inventory item deleted successfully'
        ]);
    }

    /**
     * Get inventory forecast based on MRP logic
     */
    public function forecast()
    {
        $inventories = Inventory::all();
        $forecast = [];

        foreach ($inventories as $item) {
            $daysUntilStockout = $item->daysUntilStockout();
            $needsReorder = $item->needsReorder();
            
            // Calculate forecast for next 30 days
            $forecastData = [];
            for ($day = 1; $day <= 30; $day++) {
                $projectedStock = max(0, $item->stock - ($item->daily_usage_avg * $day));
                $forecastData[] = [
                    'day' => $day,
                    'date' => Carbon::now()->addDays($day)->format('Y-m-d'),
                    'projected_stock' => round($projectedStock, 2)
                ];
            }

            $forecast[] = [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'current_stock' => $item->stock,
                'daily_usage_avg' => $item->daily_usage_avg,
                'reorder_point' => $item->reorder_point,
                'needs_reorder' => $needsReorder,
                'days_until_stockout' => $daysUntilStockout,
                'recommended_order_qty' => $item->recommendedOrderQuantity(),
                'forecast_30_days' => $forecastData
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $forecast,
            'message' => 'Inventory forecast generated successfully'
        ]);
    }

    /**
     * Export inventory data to Excel
     */
    public function export()
    {
        return Excel::download(new InventoryExport, 'inventory_report_' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Get items that need reordering
     */
    public function reorderAlerts()
    {
        $itemsNeedingReorder = Inventory::all()->filter(function ($item) {
            return $item->needsReorder();
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => $itemsNeedingReorder,
            'message' => 'Reorder alerts retrieved successfully',
            'count' => $itemsNeedingReorder->count()
        ]);
    }
}
