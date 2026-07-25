<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

/**
 * Auth stub (Sanctum). Di produksi ganti ke Socialite Google OAuth owner.
 * Login sederhana via email+password untuk keperluan dev/integrasi frontend.
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = $user->createToken('pos-device')->plainTextToken;
        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['ok' => true]);
    }

    /**
     * Redirect ke Google OAuth (Socialite).
     */
    public function redirectToGoogle(Request $request)
    {
        $redirect = $request->input('redirect', env('FRONTEND_URL', 'http://localhost:5173'));
        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => base64_encode($redirect)])
            ->redirect();
    }

    /**
     * Callback Google OAuth: auto-create user bila email belum ada, lalu issue Sanctum token.
     */
    public function handleGoogleCallback(Request $request)
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        if (empty($googleUser->getEmail()) || !$googleUser->getEmailVerified()) {
            return response()->json(['message' => 'Google email tidak tersedia/terverifikasi'], 422);
        }

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?? $googleUser->getEmail(),
                'password' => bcrypt(Str::random(32)),
                'role' => 'owner',
            ]
        );

        $token = $user->createToken('pos-device')->plainTextToken;
        $redirect = $request->input('state')
            ? base64_decode($request->input('state'))
            : (env('FRONTEND_URL', 'http://localhost:5173') . '/owner/login');

        // Frontend membaca token dari query string lalu simpan ke localStorage
        return redirect($redirect . (str_contains($redirect, '?') ? '&' : '?') . 'token=' . $token);
    }
}
