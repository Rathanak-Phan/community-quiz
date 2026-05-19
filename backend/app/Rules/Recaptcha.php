<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class Recaptcha implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value)) {
            $fail('The reCAPTCHA verification is required.');
            return;
        }

        $secret = config('services.recaptcha.secret');

        if (empty($secret)) {
            // Fallback if not configured in services.php but exists in env
            $secret = env('SECRET_KEY');
        }

        if (empty($secret)) {
            \Log::warning('reCAPTCHA Secret Key is missing. Skipping validation.');
            return;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $value,
                'remoteip' => request()->ip(),
            ]);

            if (!$response->successful() || !$response->json('success')) {
                \Log::warning('reCAPTCHA validation failed', [
                    'response' => $response->json(),
                    'token' => substr($value, 0, 15) . '...'
                ]);
                $fail('The reCAPTCHA verification failed. Please try again.');
            }
        } catch (\Exception $e) {
            \Log::error('reCAPTCHA Validation Error: ' . $e->getMessage());
            $fail('The reCAPTCHA verification service is currently unavailable. Please try again.');
        }
    }
}
