<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Upload proxy ke Cloudinary (server-side). Frontend TIDAK pegang secret.
 * Butuh package cloudinary-labs/cloudinary-laravel + CLOUDINARY_URL di .env.
 * Fallback: simpan ke storage lokal bila Cloudinary tidak terkonfigurasi (dev).
 */
class UploadController extends Controller
{
    private function handle(Request $request, string $folder): \Illuminate\Http\JsonResponse
    {
        $request->validate(['image' => 'required|file|image|max:5120']);
        $file = $request->file('image');
        $name = $request->input('name') ?: $request->input('title') ?: 'upload';
        $slug = Str::slug(pathinfo($name, PATHINFO_FILENAME));

        if (config('cloudinary.cloud_url') || env('CLOUDINARY_URL')) {
            try {
                $uploaded = cloudinary()->upload($file->getRealPath(), [
                    'folder' => $folder,
                    'public_id' => $folder . '/' . $slug . '_' . Str::random(6),
                ]);
                $publicId = $uploaded->getPublicId();
                $url = $uploaded->getSecurePath();
                return response()->json(['public_id' => $publicId, 'url' => $url]);
            } catch (\Throwable $e) {
                // fall through ke local
            }
        }

        // Fallback lokal (dev tanpa Cloudinary)
        $publicId = $folder . '/' . $slug . '_' . Str::random(6);
        $path = $file->storeAs($folder, basename($publicId), 'public');
        $url = Storage::disk('public')->url($path);
        return response()->json(['public_id' => $publicId, 'url' => $url]);
    }

    public function menu(Request $request)
    {
        return $this->handle($request, 'menu');
    }

    public function event(Request $request)
    {
        return $this->handle($request, 'events');
    }
}
