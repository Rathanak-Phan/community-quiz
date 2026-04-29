<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    // =============================
    // REGISTER (SPA - COOKIE)
    // =============================
    /**
     * @OA\Post(
     *     path="/api/register",
     *     tags={"Auth"},
     *     summary="Register a new user",
     *     operationId="authRegister",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", maxLength=255, example="Rathanak"),
     *             @OA\Property(property="email", type="string", format="email", example="user@gmail.com"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8, example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", minLength=8, example="password123")
     *         )
     *     ),
     *     @OA\Response(response=201, description="User registered successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());

        Auth::login($user);

        return response()->json([
            'user' => $user
        ], 201);
    }

    // =============================
    // LOGIN (SPA - COOKIE)
    // =============================
    /**
     * @OA\Post(
     *     path="/api/login",
     *     tags={"Auth"},
     *     summary="Log in with email and password",
     *     operationId="authLogin",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="user@gmail.com"),
     *             @OA\Property(property="password", type="string", format="password", minLength=8, example="password123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Logged in successfully"),
     *     @OA\Response(response=401, description="Invalid credentials"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => Auth::user()
        ]);
    }

    // =============================
    // LOGIN TOKEN (POSTMAN)
    // =============================
    /**
     * @OA\Post(
     *     path="/api/login-token",
     *     tags={"Auth"},
     *     summary="Log in and create a Sanctum token",
     *     operationId="authLoginToken",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="user@gmail.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Token created successfully"),
     *     @OA\Response(response=401, description="Invalid credentials"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function loginToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('postman-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    // =============================
    // LOGOUT (SPA - COOKIE)
    // =============================
    /**
     * @OA\Post(
     *     path="/api/logout",
     *     tags={"Auth"},
     *     summary="Log out the authenticated user",
     *     operationId="authLogout",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Logged out successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    // =============================
    // LOGOUT TOKEN (POSTMAN)
    // =============================
    public function logoutToken(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Token logged out'
        ]);
    }

    // =============================
    // PROFILE (BOTH WORK)
    // =============================
    /**
     * @OA\Get(
     *     path="/api/profile",
     *     tags={"Auth"},
     *     summary="Get the authenticated user profile",
     *     operationId="authProfile",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Authenticated user profile"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function profile(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/test",
     *     tags={"Auth"},
     *     summary="Test endpoint",
     *     operationId="authTest",
     *     @OA\Response(response=200, description="OK"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function test()
    {
        return response()->json([
            'message' => 'Swagger working'
        ]);
    }
}

