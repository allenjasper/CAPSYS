<?php

namespace App\Exports;

use App\Models\Production;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProductionExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Production::with('product')->get();
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Product Name',
            'Date',
            'Status',
            'Stage',
            'Planned Quantity',
            'Actual Quantity',
            'Output',
            'Efficiency %',
            'Start Time',
            'End Time',
            'Duration (Hours)',
            'Worker Assigned',
            'Machine Used',
            'Quality Score',
            'Notes',
            'Created At'
        ];
    }

    /**
     * @param mixed $production
     * @return array
     */
    public function map($production): array
    {
        return [
            $production->id,
            $production->product->name ?? 'N/A',
            $production->date->format('Y-m-d'),
            $production->status_label,
            $production->stage_label,
            $production->planned_quantity,
            $production->actual_quantity,
            $production->output,
            $production->efficiency . '%',
            $production->start_time ? $production->start_time->format('Y-m-d H:i:s') : 'N/A',
            $production->end_time ? $production->end_time->format('Y-m-d H:i:s') : 'N/A',
            $production->duration_hours,
            $production->worker_assigned,
            $production->machine_used,
            $production->quality_score,
            $production->notes,
            $production->created_at->format('Y-m-d H:i:s')
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