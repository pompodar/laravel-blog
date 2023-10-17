<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;

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
        ]);

        // Create a new post
        $post = new Post;
        $post->category_id = '1';
        $post->title = $request->input('title'); 
        $post->content = $request->input('content');
        $post->tags = [];
        $post->save();

        return response()->json($post, 201); 
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
