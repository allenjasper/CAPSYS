<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'date',
        'output',
        'output_qty',
        'status',
        'stage',
        'planned_quantity',
        'actual_quantity',
        'start_time',
        'end_time',
        'worker_assigned',
        'machine_used',
        'material_consumption',
        'quality_score',
        'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'output' => 'integer',
        'output_qty' => 'integer',
        'planned_quantity' => 'integer',
        'actual_quantity' => 'integer',
        'quality_score' => 'decimal:2',
        'material_consumption' => 'json'
    ];

    const STATUSES = [
        'planned' => 'Planned',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
        'paused' => 'Paused',
        'cancelled' => 'Cancelled'
    ];

    const STAGES = [
        'material_prep' => 'Material Preparation',
        'cutting' => 'Cutting',
        'assembly' => 'Assembly',
        'finishing' => 'Finishing',
        'quality_control' => 'Quality Control',
        'packaging' => 'Packaging'
    ];

    // A production record belongs to a product
    public function product() {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calculate production efficiency percentage
     */
    public function getEfficiencyAttribute()
    {
        if (!$this->planned_quantity || $this->planned_quantity == 0) {
            return 0;
        }
        return round(($this->actual_quantity / $this->planned_quantity) * 100, 2);
    }

    /**
     * Calculate production duration in hours
     */
    public function getDurationHoursAttribute()
    {
        if (!$this->start_time || !$this->end_time) {
            return 0;
        }
        return $this->start_time->diffInHours($this->end_time);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    /**
     * Get stage label
     */
    public function getStageLabelAttribute()
    {
        return self::STAGES[$this->stage] ?? 'Unknown';
    }
}
