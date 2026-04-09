<?php

namespace App\Http\Controllers;

use App\Models\Community;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $communities = Community::with('creator:id,name,email')->get();

        return response()->json($communities);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'visibility' => 'required|in:public,private',
            'cover_image' => 'nullable|mimes:jpg,jpeg,png|max:2048'
        ]);

        $path = null;

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')
                ->store('communities', 'public');
        }

        $community = Community::create([
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
            'created_by' => auth()->id(),
            'cover_image' => $path
        ]);

        // Attach owner (IMPORTANT)
        $community->users()->attach(auth()->id(), [
            'role' => 'owner',
            'status' => 'approved'
        ]);

        return response()->json($community, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Community $community)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Community $community)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Community $community)
    {
        $this->authorize('update', $community);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => 'required|in:public,private',
            'cover_image' => 'nullable|mimes:jpg,jpeg,png|max:2048'
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
            'visibility' => $request->visibility,
        ];

        // Handle image
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image')
                ->store('communities', 'public');
        }

        $community->update($data);

        return response()->json([
            'message' => 'Community updated successfully',
            'data' => $community
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Community $community)
    {
        $this->authorize('delete', $community);

        $community->delete();

        return response()->json([
            'message' => 'Community deleted successfully'
        ]);
    }
}
