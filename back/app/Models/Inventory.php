<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'sku',
        'name', 
        'material',
        'stock',
        'quantity',
        'reorder_point',
        'daily_usage_avg',
        'unit_cost',
        'supplier',
        'lead_time_days'
    ];

    protected $casts = [
        'stock' => 'integer',
        'quantity' => 'integer',
        'reorder_point' => 'integer',
        'daily_usage_avg' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'lead_time_days' => 'integer'
    ];

    /**
     * Check if item needs reordering based on MRP logic
     */
    public function needsReorder()
    {
        return $this->stock <= $this->reorder_point;
    }

    /**
     * Calculate days until stockout based on current usage
     */
    public function daysUntilStockout()
    {
        if ($this->daily_usage_avg <= 0) {
            return null;
        }
        return round($this->stock / $this->daily_usage_avg);
    }

    /**
     * Calculate recommended order quantity based on lead time and usage
     */
    public function recommendedOrderQuantity()
    {
        $safetyStock = $this->daily_usage_avg * 7; // 1 week safety stock
        $leadTimeUsage = $this->daily_usage_avg * $this->lead_time_days;
        return $leadTimeUsage + $safetyStock - $this->stock;
    }
}
