<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Comment;

class CommentController extends Controller
{
    public function createComment(Request $request)
    {
        try {
            // Validation
            $validatedData = $request->validate([
                'comment' => 'required|string',
                'bug_id'  => 'required|exists:bugs,id',  // Validate that the bug exists
            ]);
    
            // Auth check
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized. Please login.'
                ], 401);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json(['message' => 'Invalid user ID.'], 404);
            }

            // Create comment
            $commentData = Comment::create([
                'comment' => $validatedData['comment'], 
                'bug_id'  => $validatedData['bug_id'],   
                'user_id' => $userId,                    
            ]);
    
            return response()->json([
                'message' => 'Comment added successfully.',
                'comment' => $commentData,
                'user'    => $user
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while adding the comment.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
