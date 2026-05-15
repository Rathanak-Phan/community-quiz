<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @mixin \Laravel\Sanctum\HasApiTokens
 * 
 *
 *
 *
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array $abilities = ['*'])
 *
 * @property-read \Laravel\Sanctum\NewAccessToken $currentAccessToken
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, \Illuminate\Auth\MustVerifyEmail;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'maker_status',
        'avatar',
        'headline',
        'bio',
        'location',
        'website',
        'github_handle',
        'twitter_handle',
        'linkedin_handle'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function communities()
    {
        return $this->belongsToMany(Community::class, 'community_members')
            ->withPivot('status', 'role')
            ->withTimestamps();
    }
    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'created_by');
    }
    public function isAdmin(): bool
    {
        return $this->role?->name === 'admin';
    }

    public function isQuizMaker(): bool
    {
        return $this->role?->name === 'quiz_maker';
    }

    public function isUser(): bool
    {
        return $this->role?->name === 'user';
    }

    public function getAvatarAttribute($value)
    {
        if (!$value) return null;
        if (str_starts_with($value, 'http')) return $value;
        return url('storage/' . $value);
    }
    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->generateOTP();
        $this->notify(new \App\Notifications\CustomVerifyEmail);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->generateOTP();
        $frontendUrl = config('app.frontend_url', 'https://quizsphere.store');
        $url = $frontendUrl . '/reset-password?token=' . $token . '&email=' . $this->getEmailForPasswordReset();
        $this->notify(new \App\Notifications\CustomResetPassword($url, $this->otp_code));
    }

    /**
     * Generate a new OTP code.
     */
    public function generateOTP()
    {
        $this->otp_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->otp_expires_at = now()->addMinutes(10);
        $this->save();
        return $this->otp_code;
    }

    /**
     * Verify the provided OTP code.
     */
    public function verifyOTP($code, $clear = true)
    {
        if ($this->otp_code === $code && $this->otp_expires_at && $this->otp_expires_at->isFuture()) {
            if ($clear) {
                $this->otp_code = null;
                $this->otp_expires_at = null;
                $this->save();
            }
            return true;
        }
        return false;
    }
}
