<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of system activity logs.
     */
    public function index(Request $request)
    {
        $query = ActivityLog::with('user:id,name,email,role_id')
            ->latest();

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Search in description, action or user name/email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                  ->orWhere('action', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', '%' . $search . '%')
                         ->orWhere('email', 'like', '%' . $search . '%');
                  });
            });
        }

        $perPage = $request->input('per_page', 15);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * Clear all activity logs (Admin only).
     */
    public function clear()
    {
        ActivityLog::truncate();
        ActivityLog::log('logs_cleared', 'All platform audit logs were cleared.');
        return response()->json(['message' => 'All activity logs cleared successfully.']);
    }
}
