<?php

namespace App\Exports;

use App\Models\Inventory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Inventory::all();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'SKU',
            'Name',
            'Material',
            'Current Stock',
            'Reorder Point',
            'Daily Usage Avg',
            'Unit Cost',
            'Supplier',
            'Lead Time (Days)',
            'Needs Reorder',
            'Days Until Stockout',
            'Recommended Order Qty',
            'Created At',
            'Updated At'
        ];
    }

    /**
     * @param mixed $inventory
     * @return array
     */
    public function map($inventory): array
    {
        return [
            $inventory->id,
            $inventory->sku,
            $inventory->name,
            $inventory->material,
            $inventory->stock,
            $inventory->reorder_point,
            $inventory->daily_usage_avg,
            $inventory->unit_cost,
            $inventory->supplier,
            $inventory->lead_time_days,
            $inventory->needsReorder() ? 'Yes' : 'No',
            $inventory->daysUntilStockout(),
            $inventory->recommendedOrderQuantity(),
            $inventory->created_at->format('Y-m-d H:i:s'),
            $inventory->updated_at->format('Y-m-d H:i:s')
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