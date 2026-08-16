<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Pemasok;
use App\Http\Resources\PemasokResource;
use App\Http\Requests\MemintaPemasok;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PemasokControllers extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $pemasok = Pemasok::withCount('produk')->get();
        return response()->json([
            'success' => true,
            'data' => PemasokResource::collection($pemasok),
            'message' => 'Data pemasok berhasil diambil'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MemintaPemasok $request): JsonResponse
    {
        $pemasok = Pemasok::create($request->validated());
        return response()->json([
            'success' => true,
            'data' => new PemasokResource($pemasok),
            'message' => 'Data pemasok berhasil disimpan'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Pemasok $pemasok): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new PemasokResource($pemasok->load('produk')),
            'message' => 'Data pemasok berhasil diambil'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MemintaPemasok $request, Pemasok $pemasok): JsonResponse
    {
        $pemasok->update($request->validated());
        return response()->json([
            'success' => true,
            'data' => new PemasokResource($pemasok),
            'message' => 'Data pemasok berhasil diperbarui'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pemasok $pemasok): JsonResponse
    {
        $pemasok->delete();
        return response()->json([
            'success' => true,
            'message' => 'Data pemasok berhasil dihapus'
        ]);
    }
}
