<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class CustomResetPassword extends Notification
{
    use Queueable;

    public $url;
    public $code;

    /**
     * Create a new notification instance.
     */
    public function __construct($url, $code = null)
    {
        $this->url = $url;
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mailMessage = (new MailMessage)
            ->subject(Lang::get('Reset Your QuizSphere Password'))
            ->greeting('Hello!')
            ->line(Lang::get('You are receiving this email because we received a password reset request for your account.'));

        if ($this->code) {
            $mailMessage->line(Lang::get('Your 6-digit verification code is:'))
                ->line('**' . $this->code . '**');
        }

        return $mailMessage
            ->action(Lang::get('Reset Password'), $this->url)
            ->line(Lang::get('This password reset link and code will expire in :count minutes.', ['count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]))
            ->line(Lang::get('If you did not request a password reset, no further action is required.'))
            ->salutation('Safe Quizzing,' . PHP_EOL . 'The QuizSphere Team');
    }
}
