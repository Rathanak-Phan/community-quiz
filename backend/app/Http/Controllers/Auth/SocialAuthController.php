<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * List of supported providers.
     */
    protected $supportedProviders = ['google', 'github'];

    /**
     * @OA\Get(
     *     path="/api/auth/{provider}/redirect",
     *     tags={"Social Auth"},
     *     summary="Redirect to OAuth provider",
     *     description="Initiates the OAuth flow for the specified provider.",
     *     @OA\Parameter(
     *         name="provider",
     *         in="path",
     *         required=true,
     *         description="OAuth provider name (google, github)",
     *         @OA\Schema(type="string", enum={"google", "github"})
     *     ),
     *     @OA\Response(response=302, description="Redirect to provider")
     * )
     */
    public function redirect(string $provider)
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return response()->json(['error' => 'Unsupported provider'], 422);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * @OA\Get(
     *     path="/api/auth/{provider}/callback",
     *     tags={"Social Auth"},
     *     summary="Handle OAuth provider callback",
     *     @OA\Parameter(
     *         name="provider",
     *         in="path",
     *         required=true,
     *         description="OAuth provider name",
     *         @OA\Schema(type="string", enum={"google", "github"})
     *     ),
     *     @OA\Response(response=302, description="Redirect to frontend with token")
     * )
     */
    public function callback(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return $this->redirectWithError('unsupported_provider');
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $user = $this->handleUser($socialUser, $provider);

            // Generate Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend
            $frontendUrl = config('app.frontend_url', 'https://quizsphere.store');
            return redirect()->away("{$frontendUrl}/social-login?token={$token}");

        } catch (Exception $e) {
            \Log::error("Social Auth Error ($provider): " . $e->getMessage());
            return $this->redirectWithError('social_auth_failed');
        }
    }

    /**
     * Find or create user based on social data.
     *
     * @param object $socialUser
     * @param string $provider
     * @return User
     */
    protected function handleUser($socialUser, string $provider): User
    {
        $email = $socialUser->getEmail();

        // Handle cases where email might be null (e.g., GitHub)
        if (!$email) {
            $email = $socialUser->getId() . "@{$provider}.com";
        }

        return User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Social User',
                'password' => Hash::make(Str::random(24)),
                'role_id' => 3, // Default: User
                'email_verified_at' => now(),
            ]
        );
    }

    /**
     * Helper to redirect back to frontend with an error.
     *
     * @param string $error
     * @return RedirectResponse
     */
    protected function redirectWithError(string $error): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'https://quizsphere.store');
        return redirect()->away("{$frontendUrl}/login?error={$error}");
    }
}
