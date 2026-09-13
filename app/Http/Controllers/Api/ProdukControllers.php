<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use App\Models\StokTransaksi;
use App\Http\Resources\ProdukResource;
use App\Http\Requests\MemintaProduk;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProdukControllers extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $produk = Produk::with(['kategori', 'pemasok'])->get();
        return response()->json([
            'success' => true,
            'data' => ProdukResource::collection($produk),
            'message' => 'Data produk berhasil diambil'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MemintaProduk $request): JsonResponse
    {
        $produk = Produk::create($request->validated());
        return response()->json([
            'success' => true,
            'data' => new ProdukResource($produk->load(['kategori', 'pemasok'])),
            'message' => 'Data produk berhasil disimpan'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Produk $produk): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ProdukResource($produk->load(['kategori', 'pemasok'])),
            'message' => 'Data produk berhasil diambil'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MemintaProduk $request, Produk $produk): JsonResponse
    {
        $produk->update($request->validated());
        return response()->json([
            'success' => true,
            'data' => new ProdukResource($produk->load(['kategori', 'pemasok'])),
            'message' => 'Data produk berhasil diperbarui'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produk $produk): JsonResponse
    {
        $produk->delete();
        return response()->json([
            'success' => true,
            'message' => 'Data produk berhasil dihapus'
        ]);
    }

        /**
     * GET /api/produk/{id}/history
     * Riwayat transaksi untuk produk tertentu
     */
    public function history($id)
    {
        $produk = Produk::with(['kategori'])->find($id);

        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        $history = StokTransaksi::with(['user', 'batch'])
            ->where('produk_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'produk' => $produk,
                'history' => $history,
            ]
        ]);
    }
}
