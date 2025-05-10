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

            // Load the creator relationship with role
            $bug->load(['creator' => function($query) {
                $query->select('id', 'name', 'role');
            }]);
       
            return response()->json([
                'message' => 'Bug reported successfully.',
                'bug'     => $bug,
                'user'    => $user
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
        try {
            $bug = Bug::find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            
            // Only check creator permission if user is not admin
            if ($user->role !== 'admin' && Auth::id() !== $bug->created_by) {
                return response()->json(['message' => 'Unauthorized. You can only update your own bugs.'], 403);
            }

            $validatedData = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'priority' => 'sometimes|required|in:Low,Medium,High',
                'status' => 'sometimes|required|in:open,assigned,in_progress,fixed,reopened,closed',
                'assigned_to' => 'sometimes|nullable|exists:users,id'
            ]);

            // If assigning a developer, ensure status is 'assigned'
            if (isset($validatedData['assigned_to']) && $validatedData['assigned_to']) {
                $validatedData['status'] = 'assigned';
            }
            // If unassigning, ensure status is 'open'
            else if (isset($validatedData['assigned_to']) && !$validatedData['assigned_to']) {
                $validatedData['status'] = 'open';
            }

            $bug->update($validatedData);
            $bug->load(['creator', 'assignee']);

            return response()->json([
                'message' => 'Bug updated successfully',
                'bug' => $bug
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating bug', 'error' => $e->getMessage()], 500);
        }
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
            $bugs = Bug::where('assigned_to', $user->id)
                      ->with(['creator' => function($query) {
                          $query->select('id', 'name', 'role');
                      }, 'assignee' => function($query) {
                          $query->select('id', 'name', 'role');
                      }])
                      ->get();
        } elseif ($user->role === 'admin') {
            $bugs = Bug::with(['creator' => function($query) {
                $query->select('id', 'name', 'role');
            }, 'assignee' => function($query) {
                $query->select('id', 'name', 'role');
            }])->get(); // Admin sees all
        } else {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(['bugs' => $bugs]);
    }

    // View specific bug by ID if assigned
    public function viewBug($id)
    {
        $bug = Bug::with(['creator' => function($query) {
            $query->select('id', 'name', 'role');
        }])->find($id);

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

    public function getAssignedBugs()
    {
        try {
            $bugs = Bug::with(['creator', 'assignee'])->get();
            return response()->json(['bugs' => $bugs]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bugs', 'error' => $e->getMessage()], 500);
        }
    }

    public function getBug($id)
    {
        try {
            $bug = Bug::with(['creator', 'assignee', 'comments.user'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }
            return response()->json(['bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bug', 'error' => $e->getMessage()], 500);
        }
    }

    // Get all bugs (for admin)
    public function getAllBugs()
    {
        try {
            $bugs = Bug::with(['creator' => function($query) {
                $query->select('id', 'name', 'role');
            }])->get();
            
            return response()->json(['bugs' => $bugs]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching bugs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get tester's own bugs
    public function getTesterBugs()
    {
        try {
            $user = Auth::user();
            
            $bugs = Bug::where('created_by', $user->id)
                ->with(['creator' => function($query) {
                    $query->select('id', 'name', 'role');
                }, 'assignee' => function($query) {
                    $query->select('id', 'name', 'role');
                }])
                ->get();
            
            return response()->json(['bugs' => $bugs]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching bugs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
