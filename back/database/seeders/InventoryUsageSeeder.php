<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryUsage;
use Carbon\Carbon;

class InventoryUsageSeeder extends Seeder
{
    public function run()
    {
        $materials = ['Wood', 'Glue', 'Nails', 'Paint'];

        foreach ($materials as $material) {
            for ($i = 0; $i < 30; $i++) {
                InventoryUsage::create([
                    'material' => $material,
                    'quantity' => rand(5, 25),
                    'date' => Carbon::now()->subDays(30 - $i)->toDateString(),
                ]);
            }
        }
    }
}
