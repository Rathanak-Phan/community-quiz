<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Auth\Events\Registered;

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

        try {
            // Explicitly send verification email
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            \Log::error('Email Verification Error: ' . $e->getMessage());
            // We still return success for registration but note the error in logs
        }

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'user' => $user->load('role')
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
            'password' => 'required|string|min:8',
            'recaptcha_token' => ['required', new \App\Rules\Recaptcha()]
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();

        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            return response()->json([
                'message' => 'Your email address is not verified. Please check your inbox.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
        }

        $request->session()->regenerate();

        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'user' => $user->load('role'),
            'token' => $token
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

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your email address is not verified.',
                'requires_verification' => true,
                'email' => $user->email
            ], 403);
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
            'user' => $request->user()->load('role')
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/profile",
     *     tags={"Auth"},
     *     summary="Update the authenticated user profile",
     *     operationId="authUpdateProfile",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", maxLength=255),
     *             @OA\Property(property="headline", type="string", maxLength=255, nullable=true),
     *             @OA\Property(property="bio", type="string", nullable=true),
     *             @OA\Property(property="location", type="string", maxLength=255, nullable=true),
     *             @OA\Property(property="website", type="string", format="url", nullable=true),
     *             @OA\Property(property="github_handle", type="string", nullable=true),
     *             @OA\Property(property="twitter_handle", type="string", nullable=true),
     *             @OA\Property(property="linkedin_handle", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Profile updated successfully"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'headline' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'github_handle' => 'nullable|string|max:255',
            'twitter_handle' => 'nullable|string|max:255',
            'linkedin_handle' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('role')
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/profile/avatar",
     *     tags={"Auth"},
     *     summary="Update the authenticated user avatar",
     *     operationId="authUpdateAvatar",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="avatar", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Avatar updated successfully")
     * )
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path; // Store relative path
            $user->save();
        }

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar' => $user->avatar
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

