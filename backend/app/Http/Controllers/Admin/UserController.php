<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users",
     *     tags={"Admin User Management"},
     *     summary="Get all users",
     *     operationId="adminUserIndex",
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Users retrieved successfully"
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $users = $this->userService->getAllUsers(
            $request->query('per_page', 15),
            $request->query('search'),
            $request->query('role_id')
        );
        return response()->json($users);
    }

    /**
     * @OA\Put(
     *     path="/api/admin/users/{id}/role",
     *     tags={"Admin User Management"},
     *     summary="Update user role",
     *     operationId="adminUserUpdateRole",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="User ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"role_id"},
     *             @OA\Property(property="role_id", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="User role updated successfully"
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="User not found"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateRole(UpdateUserRoleRequest $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $updatedUser = $this->userService->updateUserRole($user, $request->role_id);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => $updatedUser
        ]);
    }
    /**
     * @OA\Delete(
     *     path="/api/admin/users/{id}",
     *     tags={"Admin User Management"},
     *     summary="Delete a user",
     *     operationId="adminUserDestroy",
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="User deleted successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="User not found")
     * )
     */
    public function destroy($id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete yourself'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/users",
     *     tags={"Admin User Management"},
     *     summary="Create a new user",
     *     operationId="adminUserStore",
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","role_id"},
     *             @OA\Property(property="name", type="string", example="New User"),
     *             @OA\Property(property="email", type="string", format="email", example="newuser@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="role_id", type="integer", example=3)
     *         )
     *     ),
     *     @OA\Response(response=201, description="User created successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(\Illuminate\Http\Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = $this->userService->createUser($validated);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('role')
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/users/stats",
     *     tags={"Admin User Management"},
     *     summary="Get user statistics",
     *     operationId="adminUserStats",
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Stats retrieved successfully")
     * )
     */
    public function stats(): JsonResponse
    {
        return response()->json($this->userService->getUserStats());
    }
}
