<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;

class CommentController extends Controller
{
    public function store(Request $request, $post)
    {
        // Validate the request data
        $request->validate([
            'content' => 'required',
        ]);

        // Create a new comment
        $comment = new Comment;
        $comment->user_id = auth()->user()->id; // Assuming you have user authentication
        $comment->post_id = $post;
        $comment->parent_comment_id = $request->input('parent_comment_id'); // Set the parent comment ID
        $comment->content = $request->input('content');
        $comment->save();

        return response()->json($comment, 201); 
    }

}
