<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductsTableSeeder extends Seeder
{
    public function run()
    {
        Product::insert([
            [
                'name' => 'Ipon Challenge 2025',
                'description' => '',
                'price' => 259.00,
                'stock' => 5,
                'image' => 'storage/products/Ipon.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'REUSABLE | FOR DREAM HOUSE | WOODEN ALKANSYA WITH IPON CHALLENGE 2024',
                'description' => '', 
                'price' => 289.00,
                'stock' => 3,
                'image' => '',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'REUSABLE | KEEP SAVING| WOODEN ALKANSYA WITH IPON CHALLENGE 2024',
                'description' => '',
                'price' => 3199.00,
                'stock' => 10,
                'image' => '',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}