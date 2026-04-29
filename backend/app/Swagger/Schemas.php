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
 */
class Schemas {}
