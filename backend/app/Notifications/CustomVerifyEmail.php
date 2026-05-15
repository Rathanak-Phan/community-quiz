<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailNotification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;

class CustomVerifyEmail extends VerifyEmailNotification
{
    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject(Lang::get('Welcome to QuizSphere! Please Verify Your Email'))
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line(Lang::get('Thank you for joining QuizSphere, the ultimate community-based quiz platform.'))
            ->line(Lang::get('To get started and unlock all features, please verify your email address.'))
            ->line(Lang::get('Your 6-digit verification code is:'))
            ->line('**' . $notifiable->otp_code . '**')
            ->action(Lang::get('Verify Email Address'), $verificationUrl)
            ->line(Lang::get('This link and code will expire in 60 minutes.'))
            ->line(Lang::get('If you did not create an account, no further action is required.'))
            ->salutation('Happy Quizzing,' . PHP_EOL . 'The QuizSphere Team');
    }
}
