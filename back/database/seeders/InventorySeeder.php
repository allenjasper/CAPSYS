<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory;

class InventorySeeder extends Seeder
{
    public function run()
    {
        $materials = [
            ['material' => 'Wood - Oak', 'quantity' => 1500],
            ['material' => 'Wood - Pine', 'quantity' => 2000],
            ['material' => 'Wood - Mahogany', 'quantity' => 800],
            ['material' => 'Metal - Steel', 'quantity' => 500],
            ['material' => 'Metal - Aluminum', 'quantity' => 300],
            ['material' => 'Fabric - Cotton', 'quantity' => 1200],
            ['material' => 'Fabric - Leather', 'quantity' => 400],
            ['material' => 'Hardware - Screws', 'quantity' => 5000],
            ['material' => 'Hardware - Hinges', 'quantity' => 200],
            ['material' => 'Finishing - Varnish', 'quantity' => 150],
        ];

        foreach ($materials as $material) {
            Inventory::create($material);
        }
    }
}
