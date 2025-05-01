<?php

namespace App\Http\Controllers;

use App\Models\Bug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;



class BugController extends Controller
{
    public function createbug(Request $request)
    {
        try {
            // Validation
            $validatedData = $request->validate([
                'title'       => 'required|string',
                'description' => 'required|string',
                'priority'    => 'required|in:Low,Medium,High',
            ]);
    
            // Auth check
            $userId = Auth::id();
            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized. Please login to report a bug.'
                ], 401);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json(['message' => 'Invalid user ID.'], 404);
            }
            
    
            // Create bug
            $bug = Bug::create([
                'title'       => $validatedData['title'],
                'description' => $validatedData['description'],
                'priority'    => $validatedData['priority'],
                'created_by'  => Auth::id(),
            ]);

       
    
            return response()->json([
                'message' => 'Bug reported successfully.',
                'bug'     => $bug,
                'user'=>$user
            ], 201);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while reporting the bug.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

}
