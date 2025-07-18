<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Inventory;
use App\Models\Production;
use App\Models\InventoryUsage;
use Illuminate\Http\Request;
use App\Models\OrderItem;

class ReportController extends Controller
{
    public function index()
    {
        // Orders, Inventory, Production
        $orders = Order::with('items')->get();
        $inventory = Inventory::all();
        $production = Production::with('product')->get();

        // Stock Prediction (Production Forecast)
        $productionForecast = Production::all()
            ->groupBy('product_id')
            ->map(function ($records) {
                return round($records->sortByDesc('date')->take(3)->avg('output_qty'), 2);
            });

        // Inventory Usage Prediction (Assuming you track material usage in a table `inventory_usages`)
        $materialForecast = [];
        if (class_exists(InventoryUsage::class)) {
            $materialForecast = InventoryUsage::all()
                ->groupBy('material')
                ->map(function ($entries) {
                    return round($entries->sortByDesc('date')->take(3)->avg('quantity'), 2);
                });
        }

        return response()->json([
            'orders' => $orders,
            'inventory' => $inventory,
            'production' => $production,
            'production_forecast' => $productionForecast,
            'material_forecast' => $materialForecast,
        ]);
    }

    public function stockPrediction()
    {
        // Simple stock prediction based on recent production and orders
        $production = Production::all()
            ->groupBy('product_id')
            ->map(function ($records) {
                return round($records->sortByDesc('date')->take(3)->avg('output_qty'), 2);
            });

        $orders = OrderItem::with('product')
            ->get()
            ->groupBy('product_id')
            ->map(function ($items) {
                return $items->sum('qty');
            });

        $prediction = [];
        foreach ($production as $productId => $avgProduction) {
            $totalOrdered = $orders->get($productId, 0);
            $prediction[$productId] = [
                'avg_production' => $avgProduction,
                'total_ordered' => $totalOrdered,
                'predicted_stock' => max(0, $avgProduction - $totalOrdered)
            ];
        }

        return response()->json($prediction);
    }
}
