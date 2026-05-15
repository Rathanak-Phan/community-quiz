<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MakerRequestController extends Controller
{
    /**
     * List all pending maker requests.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::where('maker_status', 'pending')
            ->with('role')
            ->latest()
            ->paginate($request->query('per_page', 10));

        return response()->json($users);
    }

    /**
     * Approve a maker request.
     */
    public function approve($id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Update role to quiz_maker (ID 2) and status to approved
        $user->update([
            'role_id' => 2,
            'maker_status' => 'approved'
        ]);

        return response()->json([
            'message' => "User {$user->name} has been approved as a Quiz Maker.",
            'user' => $user->load('role')
        ]);
    }

    /**
     * Reject a maker request.
     */
    public function reject($id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->update([
            'maker_status' => 'rejected'
        ]);

        return response()->json([
            'message' => "User {$user->name}'s request has been rejected.",
            'user' => $user->load('role')
        ]);
    }

    /**
     * Get the count of pending maker requests.
     */
    public function count(): JsonResponse
    {
        $count = User::where('maker_status', 'pending')->count();
        return response()->json(['count' => $count]);
    }
}
