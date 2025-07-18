<?php

namespace App\Http\Controllers;

use App\Models\Production;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function index()
    {
        return response()->json(Production::with('product')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required',
            'date' => 'required|date',
            'output_qty' => 'required|integer',
        ]);

        return Production::create($validated);
    }

    public function show($id)
    {
        return response()->json(Production::with('product')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $production = Production::findOrFail($id);
        $production->update($request->all());
        return response()->json(['message' => 'Updated']);
    }

    public function destroy($id)
    {
        Production::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
