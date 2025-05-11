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
            $comment = Comment::create([
                'comment' => $validatedData['comment'], 
                'bug_id'  => $validatedData['bug_id'],   
                'user_id' => $userId,                    
            ]);

            // Load the user relationship
            $comment->load('user');
    
            return response()->json([
                'message' => 'Comment added successfully.',
                'comment' => $comment
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

    public function updateComment(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'comment' => 'required|string',
            ]);

            $comment = Comment::find($id);

            if (!$comment) {
                return response()->json(['message' => 'Comment not found.'], 404);
            }

            if (Auth::id() !== $comment->user_id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }

            $comment->comment = $validatedData['comment'];
            $comment->save();

            return response()->json([
                'message' => 'Comment updated successfully.',
                'comment' => $comment
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the comment.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function deleteComment($id)
    {
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found.'], 404);
        }

        if (Auth::id() !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully.']);
    }

    public function adminDeleteComment($id)
    {
        try {
            $comment = Comment::find($id);
            
            if (!$comment) {
                return response()->json(['message' => 'Comment not found.'], 404);
            }

            // Admin can delete any comment
            $comment->delete();
            
            return response()->json(['message' => 'Comment deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting comment', 'error' => $e->getMessage()], 500);
        }
    }
}
