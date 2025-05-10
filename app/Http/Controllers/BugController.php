<?php

namespace App\Http\Controllers;

use App\Models\Bug;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Validator;



class BugController extends Controller
{
    public function createbug(Request $request){
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

    public function updateBug(Request $request, $id)
    {
        $bug = Bug::find($id);
        $user = Auth::user();

        if (!$bug) {
            return response()->json(['message' => 'Bug not found.'], 404);
        }

        // Base validation rules
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string',
            'description' => 'sometimes|string',
            'priority' => 'sometimes|in:Low,Medium,High',
            'status' => 'sometimes|in:open,assigned,in_progress,fixed,reopened,closed',
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();

        // Remove assigned_to if not admin
        if ($user->role !== 'admin' && isset($validatedData['assigned_to'])) {
            unset($validatedData['assigned_to']);
        }

        // Role-based access control
        switch ($user->role) {
            case 'admin':
                // Admin can update all fields
                $bug->update($validatedData);
                break;

            case 'developer':
                // Developer can only update status
                if (count($validatedData) > 1 || !isset($validatedData['status'])) {
                    return response()->json([
                        'message' => 'Developers can only update bug status.'
                    ], 403);
                }
                $bug->update(['status' => $validatedData['status']]);
                break;

            case 'tester':
                // Tester can only update their own bugs (except assigned_to and status)
                if ($bug->created_by !== $user->id) {
                    return response()->json([
                        'message' => 'You can only update bugs you created.'
                    ], 403);
                }
                
                // Remove status if tester tries to set it
                unset($validatedData['status']);
                
                if (empty($validatedData)) {
                    return response()->json([
                        'message' => 'No valid fields to update.'
                    ], 400);
                }
                
                $bug->update($validatedData);
                break;

            default:
                return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'message' => 'Bug updated successfully.',
            'bug' => $bug->load('creator', 'assignee')
        ], 200);
    }


    public function deleteBug($id)
    {
        $bug = Bug::find($id);

        if (!$bug) {
            return response()->json(['message' => 'Bug not found.'], 404);
        }

        // Only the user who created the bug can delete it
        if (Auth::id() !== $bug->created_by) {
            return response()->json(['message' => 'Unauthorized. You can only delete your own bugs.'], 403);
        }

        $bug->delete();

        return response()->json([
            'message' => 'Bug deleted successfully.'
        ], 200);
    }

    // List of bugs assigned to logged-in developer
    public function assignedBugs()
    {
        $user = Auth::user();

        if ($user->role === 'developer') {
            $bugs = Bug::where('assigned_to', $user->id)->get();
        } elseif ($user->role === 'admin') {
            $bugs = Bug::all(); // Admin sees all
        } else {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(['bugs' => $bugs]);
    }

// View specific bug by ID if assigned
    public function viewBug($id)
    {
        $bug = Bug::find($id);

        if (!$bug) {
            return response()->json(['message' => 'Bug not found.'], 404);
        }

        $user = Auth::user();

        // Allow only assigned developer or admin to view
        if ($user->role === 'developer' && $bug->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized. This bug is not assigned to you.'], 403);
        }

        return response()->json(['bug' => $bug]);
    }

    public function getBugsReportedByUser($userId)
    {
        $bugs = Bug::where('reported_by', $userId)
                    ->with(['assignedTo', 'reportedBy'])
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json($bugs);
    }

}
