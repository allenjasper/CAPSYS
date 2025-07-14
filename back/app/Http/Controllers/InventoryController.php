<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(Inventory::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'material' => 'required|string',
            'quantity' => 'required|integer',
        ]);

        return Inventory::create($validated);
    }

    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);
        $inventory->update($request->all());
        return response()->json(['message' => 'Updated']);
    }

    public function destroy($id)
    {
        Inventory::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
