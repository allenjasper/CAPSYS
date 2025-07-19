<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'customer_id', 
        'total_price', 
        'status', 
        'checkout_date',
        'delivery_date',
        'tracking_number',
        'shipping_address',
        'notes',
        'priority_level'
    ];

    protected $casts = [
        'checkout_date' => 'datetime',
        'delivery_date' => 'datetime',
        'total_price' => 'decimal:2'
    ];

    const STATUSES = [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'in_production' => 'In Production',
        'quality_check' => 'Quality Check',
        'ready_for_shipping' => 'Ready for Shipping',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled'
    ];

    const PRIORITY_LEVELS = [
        'low' => 'Low',
        'normal' => 'Normal',
        'high' => 'High',
        'urgent' => 'Urgent'
    ];

    // An order belongs to a user (customer)
    public function user() {
        return $this->belongsTo(User::class);   
    }

    // Alternative relationship for customer_id
    public function customer() {
        return $this->belongsTo(User::class, 'customer_id');
    }

    // An order can have multiple order items
    public function items() {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute()
    {
        return self::STATUSES[$this->status] ?? 'Unknown';
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute()
    {
        return self::PRIORITY_LEVELS[$this->priority_level] ?? 'Normal';
    }

    /**
     * Calculate estimated delivery date based on production time
     */
    public function getEstimatedDeliveryAttribute()
    {
        if ($this->delivery_date) {
            return $this->delivery_date;
        }

        // Default estimation: 14 days from order date
        $estimatedDays = 14;
        
        // Adjust based on priority
        switch ($this->priority_level) {
            case 'urgent':
                $estimatedDays = 7;
                break;
            case 'high':
                $estimatedDays = 10;
                break;
            case 'low':
                $estimatedDays = 21;
                break;
        }

        return $this->created_at->addDays($estimatedDays);
    }
}