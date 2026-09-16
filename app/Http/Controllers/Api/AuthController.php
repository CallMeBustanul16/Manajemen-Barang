<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;

class AuthController extends Controller
{
    // Bagian Login
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Auth::guard('web')->attempt($request->only('email', 'password'))) {
            return response()->json([
                'errors' => ['email' => ['Email atau Password salah!']]
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User dengan email seperti ini tidak ditemukan'
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' =>false,
                'message' => 'Password kamu salah'
            ], 401);
        }

        Auth::guard('web')->login($user);

        // $user = Auth::user();

        $token = $user->createToken('auth_token')->plainTextToken; //Bisa di upgrade ke tingkat lebih tinggi

        return response()->json([
            'message' => 'Kamu telah berhasil login ke dalam akun!',
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Bagian Logout
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Login berhasil!']);
        }
        return response()->json(['message' => 'Sesi tidak ada yang aktif'], 401);
    }

    // Bagian untuk ambil User yang masih fresh
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}