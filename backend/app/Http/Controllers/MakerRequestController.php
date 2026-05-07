<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MakerRequestController extends Controller
{
    /**
     * Apply to become a quiz maker.
     */
    public function apply(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role_id == 2 || $user->role_id == 1) {
            return response()->json([
                'message' => 'You are already a Quiz Maker or Admin.'
            ], 400);
        }

        if ($user->maker_status === 'pending') {
            return response()->json([
                'message' => 'Your application is already pending review.'
            ], 400);
        }

        if ($user->maker_status === 'approved') {
            return response()->json([
                'message' => 'Your application has already been approved.'
            ], 400);
        }

        $user->update(['maker_status' => 'pending']);

        return response()->json([
            'message' => 'Your application has been submitted successfully and is awaiting admin approval.',
            'user' => $user
        ]);
    }

    /**
     * Get current user's maker status.
     */
    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'maker_status' => $request->user()->maker_status,
            'role' => $request->user()->role?->name
        ]);
    }
}
