<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrderExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Order::with(['user', 'items.product'])->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Order ID',
            'Customer Name',
            'Customer Email',
            'Status',
            'Priority',
            'Total Price',
            'Items Count',
            'Order Date',
            'Estimated Delivery',
            'Actual Delivery',
            'Tracking Number',
            'Shipping Address',
            'Notes',
            'Created At'
        ];
    }

    /**
     * @param mixed $order
     * @return array
     */
    public function map($order): array
    {
        return [
            $order->id,
            $order->user->name ?? 'N/A',
            $order->user->email ?? 'N/A',
            $order->status_label,
            $order->priority_label,
            '$' . number_format($order->total_price, 2),
            $order->items->count(),
            $order->checkout_date ? $order->checkout_date->format('Y-m-d H:i:s') : $order->created_at->format('Y-m-d H:i:s'),
            $order->estimated_delivery->format('Y-m-d'),
            $order->delivery_date ? $order->delivery_date->format('Y-m-d') : 'Pending',
            $order->tracking_number ?? 'N/A',
            $order->shipping_address ?? 'N/A',
            $order->notes ?? 'N/A',
            $order->created_at->format('Y-m-d H:i:s')
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}