<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Http\Resources\KategoriResource;
use App\Http\Requests\MemintaKategori;
use App\Http\Resources\KategoriDetailResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KategoriControllers extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $kategori = Kategori::withCount('produk')->get();
        return response()->json([
            'success' => true,
            'data' => KategoriResource::collection($kategori),
            'message' => 'Data kategori berhasil diambil'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MemintaKategori $request): JsonResponse
    {
        $kategori = Kategori::create($request->validated());
        return response()->json([
            'success' => true,
            'data' => new KategoriDetailResource($kategori),
            'message' => 'Data kategori berhasil disimpan'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Kategori $kategori): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new KategoriDetailResource($kategori->load('produk')),
            'message' => 'Data kategori berhasil diambil'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MemintaKategori $request, Kategori $kategori): JsonResponse
    {
        $kategori->update($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => new KategoriDetailResource($kategori),
            'message' => 'Data kategori berhasil diperbarui'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kategori $kategori): JsonResponse
    {
        $kategori->delete();
        return response()->json([
            'success' => true,
            'message' => 'Data kategori berhasil dihapus'
        ]);
    }
}
