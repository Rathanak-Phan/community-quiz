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
    public function index(): JsonResponse
    {
        $users = $this->userService->getAllUsers();
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
}
