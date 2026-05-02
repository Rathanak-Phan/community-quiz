<?php

namespace App\Swagger;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     required={"id","name","email"},
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Rathanak"),
 *     @OA\Property(property="email", type="string", example="user@gmail.com")
 * )
 *
 * @OA\Schema(
 *     schema="AuthResponse",
 *     type="object",
 *     @OA\Property(property="user", ref="#/components/schemas/User")
 * )
 *
 * @OA\Schema(
 *     schema="TokenResponse",
 *     type="object",
 *     @OA\Property(property="token", type="string"),
 *     @OA\Property(property="user", ref="#/components/schemas/User")
 * )
 * @OA\Schema(
 *     schema="QuizAttempt",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="quiz_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="mode", type="string", enum={"practice", "scored"}, example="scored"),
 *     @OA\Property(property="is_anonymous", type="boolean", example=false),
 *     @OA\Property(property="status", type="string", enum={"in_progress", "completed"}, example="in_progress"),
 *     @OA\Property(property="started_at", type="string", format="date-time"),
 *     @OA\Property(property="completed_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="score", type="integer", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="AttemptAnswer",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="quiz_attempt_id", type="integer", example=1),
 *     @OA\Property(property="question_id", type="integer", example=1),
 *     @OA\Property(property="selected_option_id", type="integer", nullable=true, example=1),
 *     @OA\Property(property="answer_boolean", type="boolean", nullable=true, example=true),
 *     @OA\Property(property="answer_text", type="string", nullable=true, example="Answer text")
 * )
 */
class Schemas {}
