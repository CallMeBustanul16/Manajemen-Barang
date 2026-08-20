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
    // Bagian Register
    public function register(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Selamat! Registrasi Anda telah berhasil!🥳',
            'user' => $user
        ], 201);
    }

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

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'errors' => ['email' => ['Email atau Password salah!']]
            ], 401);
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

        Auth::login($user);

        // $user = Auth::user();

        $token = $user->createToken('auth_token')->plainTextToken; //Bisa di upgrade ke tingkat lebih tinggi

        return response()->json([
            'message' => 'Kamu telah berhasil login ke dalam akun!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token
        ]);
    }

    // Bagian Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'succes' => true,
            'message' => "Kamu berhasil Logout dari akunmu!"
        ]);
    }

    // Bagian LupaPassword
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Link untuk mereset password telah dikirim ke email Kamu'
            ]);
        }

        return response()->json([
            'errors' => ['email' => ['Link untuk reset telah gagal dikirim! Harap coba lagi!']]
        ], 500);
    }

    // Bagian ResetPassword
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Passwordmu berhasil di reset!'
            ]);
        }

        return response()->json([
            'errors' => ['email' => ['Gagal untuk mereset passwordmu!']]
        ], 500);
    }

    // Bagian untuk ambil User yang masih fresh
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}