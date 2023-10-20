<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use Image; // Import the Intervention Image class

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get the page number from the request, default to 1 if not specified
        $page = $request->input('page', 1);
        // Define the number of posts per page
        $perPage = 1; // Change this number as needed

        // Query the database and paginate the results
        $posts = Post::with('authors', 'comments')->paginate($perPage, ['*'], 'page', $page);

        return response()->json($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'title' => 'required',
            'content' => 'required',
            'thumbnail' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // Adjust validation rules as needed
        ]);

        // Create a new post
        $post = new Post;
        $post->category_id = 1;
        $post->title = $request->input('title');
        $post->content = $request->input('content');

        $fileName = time() . '.' . $request->thumbnail->extension();
        $request->thumbnail->move(public_path('uploads'), $fileName);

        // Check if the image dimensions are larger than 320x240 pixels before resizing
        $image = Image::make(public_path('uploads/' . $fileName));
        if ($image->width() > 320 || $image->height() > 240) {
            $image->resize(320, 240, function ($constraint) {
                $constraint->aspectRatio();
            });
        }
        $image->save(public_path('uploads/' . $fileName));

        $post->thumbnail = '/uploads/' . $fileName; // Store the image path in your database
        $post->tags = [];
        $post->save();

        return response()->json($post, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Implementation for displaying an individual post
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Implementation for updating an individual post
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Implementation for deleting an individual post
    }
}
