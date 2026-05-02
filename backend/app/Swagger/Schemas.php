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
 *     schema="Quiz",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="General Knowledge"),
 *     @OA\Property(property="description", type="string", example="A quiz about everything"),
 *     @OA\Property(property="category_id", type="integer", example=1),
 *     @OA\Property(property="cover_image", type="string", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="QuestionOption",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="option_text", type="string", example="Paris"),
 *     @OA\Property(property="is_correct", type="boolean", example=true)
 * )
 *
 * @OA\Schema(
 *     schema="Question",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="question_type", type="string", enum={"multiple_choice", "true_false", "short_answer"}),
 *     @OA\Property(property="question_text", type="string", example="What is the capital of France?"),
 *     @OA\Property(property="image", type="string", nullable=true),
 *     @OA\Property(property="options", type="array", @OA\Items(ref="#/components/schemas/QuestionOption"))
 * )
 *
 * @OA\Schema(
 *     schema="QuizAttempt",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="quiz_id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="mode", type="string", enum={"practice", "scored"}, example="scored"),
 *     @OA\Property(property="is_anonymous", type="boolean", example=false),
 *     @OA\Property(property="status", type="string", enum={"in_progress", "submitted"}, example="in_progress"),
 *     @OA\Property(property="started_at", type="string", format="date-time"),
 *     @OA\Property(property="completed_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="score", type="integer", nullable=true),
 *     @OA\Property(property="max_score", type="integer", nullable=true),
 *     @OA\Property(property="grading_status", type="string", enum={"pending", "graded"})
 * )
 *
 * @OA\Schema(
 *     schema="QuizAttemptDetail",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="status", type="string", enum={"in_progress", "submitted"}),
 *     @OA\Property(property="score", type="integer", nullable=true),
 *     @OA\Property(property="max_score", type="integer", nullable=true),
 *     @OA\Property(property="grading_status", type="string", enum={"pending", "graded"}),
 *     @OA\Property(property="quiz", ref="#/components/schemas/Quiz"),
 *     @OA\Property(property="questions", type="array", @OA\Items(ref="#/components/schemas/Question")),
 *     @OA\Property(property="answers", type="array", @OA\Items(ref="#/components/schemas/AttemptAnswer")),
 *     @OA\Property(property="last_question_id", type="integer", nullable=true, example=5)
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
 *     @OA\Property(property="answer_text", type="string", nullable=true, example="Answer text"),
 *     @OA\Property(property="is_correct", type="boolean", nullable=true),
 *     @OA\Property(property="score", type="integer", example=1)
 * )
 */
class Schemas {}
