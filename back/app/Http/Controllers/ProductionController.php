<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Exports\ProductionExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{
    public function index()
    {
        $productions = Production::with('product')
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($production) {
                return [
                    'id' => $production->id,
                    'product_id' => $production->product_id,
                    'product_name' => $production->product->name ?? 'N/A',
                    'date' => $production->date,
                    'status' => $production->status,
                    'status_label' => $production->status_label,
                    'stage' => $production->stage,
                    'stage_label' => $production->stage_label,
                    'planned_quantity' => $production->planned_quantity,
                    'actual_quantity' => $production->actual_quantity,
                    'output' => $production->output,
                    'output_qty' => $production->output_qty,
                    'efficiency' => $production->efficiency,
                    'start_time' => $production->start_time,
                    'end_time' => $production->end_time,
                    'duration_hours' => $production->duration_hours,
                    'worker_assigned' => $production->worker_assigned,
                    'machine_used' => $production->machine_used,
                    'quality_score' => $production->quality_score,
                    'notes' => $production->notes,
                    'created_at' => $production->created_at,
                    'updated_at' => $production->updated_at
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $productions,
            'message' => 'Production data retrieved successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'date' => 'required|date',
            'status' => 'required|in:planned,in_progress,completed,paused,cancelled',
            'stage' => 'required|in:material_prep,cutting,assembly,finishing,quality_control,packaging',
            'planned_quantity' => 'required|integer|min:1',
            'actual_quantity' => 'nullable|integer|min:0',
            'output' => 'nullable|integer|min:0',
            'output_qty' => 'nullable|integer|min:0',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after:start_time',
            'worker_assigned' => 'nullable|string',
            'machine_used' => 'nullable|string',
            'material_consumption' => 'nullable|array',
            'quality_score' => 'nullable|numeric|min:0|max:10',
            'notes' => 'nullable|string'
        ]);

        $production = Production::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $production->load('product'),
            'message' => 'Production record created successfully'
        ], 201);
    }

    public function show($id)
    {
        $production = Production::with('product')->findOrFail($id);
        
        $data = [
            'id' => $production->id,
            'product_id' => $production->product_id,
            'product_name' => $production->product->name ?? 'N/A',
            'date' => $production->date,
            'status' => $production->status,
            'status_label' => $production->status_label,
            'stage' => $production->stage,
            'stage_label' => $production->stage_label,
            'planned_quantity' => $production->planned_quantity,
            'actual_quantity' => $production->actual_quantity,
            'output' => $production->output,
            'output_qty' => $production->output_qty,
            'efficiency' => $production->efficiency,
            'start_time' => $production->start_time,
            'end_time' => $production->end_time,
            'duration_hours' => $production->duration_hours,
            'worker_assigned' => $production->worker_assigned,
            'machine_used' => $production->machine_used,
            'material_consumption' => $production->material_consumption,
            'quality_score' => $production->quality_score,
            'notes' => $production->notes,
            'created_at' => $production->created_at,
            'updated_at' => $production->updated_at
        ];

        return response()->json([
            'status' => 'success',
            'data' => $data,
            'message' => 'Production record retrieved successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $production = Production::findOrFail($id);
        
        $validated = $request->validate([
            'product_id' => 'sometimes|exists:products,id',
            'date' => 'sometimes|date',
            'status' => 'sometimes|in:planned,in_progress,completed,paused,cancelled',
            'stage' => 'sometimes|in:material_prep,cutting,assembly,finishing,quality_control,packaging',
            'planned_quantity' => 'sometimes|integer|min:1',
            'actual_quantity' => 'sometimes|integer|min:0',
            'output' => 'sometimes|integer|min:0',
            'output_qty' => 'sometimes|integer|min:0',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'worker_assigned' => 'sometimes|string',
            'machine_used' => 'sometimes|string',
            'material_consumption' => 'sometimes|array',
            'quality_score' => 'sometimes|numeric|min:0|max:10',
            'notes' => 'sometimes|string'
        ]);

        $production->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $production->fresh()->load('product'),
            'message' => 'Production record updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $production = Production::findOrFail($id);
        $production->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Production record deleted successfully'
        ]);
    }

    /**
     * Export production data to Excel
     */
    public function export()
    {
        return Excel::download(new ProductionExport, 'production_report_' . date('Y-m-d') . '.xlsx');
    }

    /**
     * Get production dashboard analytics
     */
    public function dashboard()
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        // Today's production
        $todayProduction = Production::whereDate('date', $today)->get();
        
        // Weekly production
        $weeklyProduction = Production::where('date', '>=', $thisWeek)->get();
        
        // Monthly production
        $monthlyProduction = Production::where('date', '>=', $thisMonth)->get();

        // Production by status
        $productionByStatus = Production::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Production by stage
        $productionByStage = Production::select('stage', DB::raw('count(*) as count'))
            ->groupBy('stage')
            ->get();

        // Average efficiency
        $avgEfficiency = Production::whereNotNull('planned_quantity')
            ->whereNotNull('actual_quantity')
            ->where('planned_quantity', '>', 0)
            ->get()
            ->avg('efficiency');

        // Top performing products
        $topProducts = Production::select('product_id', DB::raw('sum(actual_quantity) as total_output'))
            ->with('product')
            ->groupBy('product_id')
            ->orderBy('total_output', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'today' => [
                    'total_records' => $todayProduction->count(),
                    'total_output' => $todayProduction->sum('actual_quantity'),
                    'avg_efficiency' => $todayProduction->avg('efficiency')
                ],
                'weekly' => [
                    'total_records' => $weeklyProduction->count(),
                    'total_output' => $weeklyProduction->sum('actual_quantity'),
                    'avg_efficiency' => $weeklyProduction->avg('efficiency')
                ],
                'monthly' => [
                    'total_records' => $monthlyProduction->count(),
                    'total_output' => $monthlyProduction->sum('actual_quantity'),
                    'avg_efficiency' => $monthlyProduction->avg('efficiency')
                ],
                'by_status' => $productionByStatus,
                'by_stage' => $productionByStage,
                'overall_avg_efficiency' => round($avgEfficiency, 2),
                'top_products' => $topProducts
            ],
            'message' => 'Production dashboard data retrieved successfully'
        ]);
    }

    /**
     * Get production performance analytics
     */
    public function analytics(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30));
        $endDate = $request->input('end_date', Carbon::now());

        $productions = Production::whereBetween('date', [$startDate, $endDate])
            ->with('product')
            ->get();

        // Daily production trends
        $dailyTrends = $productions->groupBy(function ($item) {
            return $item->date->format('Y-m-d');
        })->map(function ($dayProductions) {
            return [
                'total_planned' => $dayProductions->sum('planned_quantity'),
                'total_actual' => $dayProductions->sum('actual_quantity'),
                'avg_efficiency' => $dayProductions->avg('efficiency'),
                'avg_quality' => $dayProductions->avg('quality_score')
            ];
        });

        // Efficiency trends
        $efficiencyTrend = $productions->where('efficiency', '>', 0)->avg('efficiency');
        
        // Quality trends
        $qualityTrend = $productions->whereNotNull('quality_score')->avg('quality_score');

        // Resource utilization
        $workerUtilization = $productions->whereNotNull('worker_assigned')
            ->groupBy('worker_assigned')
            ->map(function ($workerProductions) {
                return [
                    'total_hours' => $workerProductions->sum('duration_hours'),
                    'total_output' => $workerProductions->sum('actual_quantity'),
                    'avg_efficiency' => $workerProductions->avg('efficiency')
                ];
            });

        $machineUtilization = $productions->whereNotNull('machine_used')
            ->groupBy('machine_used')
            ->map(function ($machineProductions) {
                return [
                    'total_hours' => $machineProductions->sum('duration_hours'),
                    'total_output' => $machineProductions->sum('actual_quantity'),
                    'avg_efficiency' => $machineProductions->avg('efficiency')
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'total_records' => $productions->count()
                ],
                'daily_trends' => $dailyTrends,
                'overall_metrics' => [
                    'avg_efficiency' => round($efficiencyTrend, 2),
                    'avg_quality' => round($qualityTrend, 2),
                    'total_output' => $productions->sum('actual_quantity'),
                    'total_planned' => $productions->sum('planned_quantity')
                ],
                'resource_utilization' => [
                    'workers' => $workerUtilization,
                    'machines' => $machineUtilization
                ]
            ],
            'message' => 'Production analytics retrieved successfully'
        ]);
    }
}
