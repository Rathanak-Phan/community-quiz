<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteSettingController extends Controller
{
    public function index()
    {
        return response()->json(SiteSetting::all()->pluck('value', 'key'));
    }

    public function update(Request $request)
    {
        $settings = $request->all();

        foreach ($settings as $key => $value) {
            // Skip keys that aren't strings or files
            if (!is_string($key)) continue;

            if ($request->hasFile($key)) {
                $path = $request->file($key)->store('settings', 'public');
                $value = $path;
                
                // Delete old file if exists
                $oldSetting = SiteSetting::where('key', $key)->first();
                if ($oldSetting && $oldSetting->value) {
                    Storage::disk('public')->delete($oldSetting->value);
                }
            }

            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
