<?php

namespace App\Swagger;

/**
 * @OA\Info(
 *     title="Community Quiz API",
 *     version="1.0.0",
 *     description="Community-Based Quiz Management System API"
 * )
 *
 * @OA\Server(
 *     url="http://127.0.0.1:8000",
 *     description="Local Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="apiKey",
 *     in="header",
 *     name="Authorization",
 *     description="Enter: Bearer {token}"
 * )
 */
class OpenApi {}
