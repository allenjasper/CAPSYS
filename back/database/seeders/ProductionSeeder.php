<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Production;
use App\Models\Product;
use Carbon\Carbon;

class ProductionSeeder extends Seeder
{
    public function run()
    {
        $products = Product::all();
        
        if ($products->isEmpty()) {
            return; // No products to create production records for
        }

        $productions = [];
        
        // Create production records for the last 30 days
        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays($i)->toDateString();
            
            foreach ($products->random(rand(2, $products->count())) as $product) {
                $productions[] = [
                    'product_id' => $product->id,
                    'date' => $date,
                    'output_qty' => rand(10, 100),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        Production::insert($productions);
    }
}
