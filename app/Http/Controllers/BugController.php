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
            if ($bug->assigned_to !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only update bugs assigned to you.'], 403);
            }

            $validatedData = $request->validate([
                'status' => 'required|in:in_progress,fixed'
            ]);

            $bug->update($validatedData);
            return response()->json(['message' => 'Bug updated successfully', 'bug' => $bug]);
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

            $user = Auth::user();

            // Admin can see all bugs and comments
            if ($user->role === 'admin') {
                return response()->json(['bug' => $bug]);
            }

            // Developer can only see assigned bugs and their own comments
            if ($user->role === 'developer') {
                if ($bug->assigned_to !== $user->id) {
                    return response()->json(['message' => 'Unauthorized. This bug is not assigned to you.'], 403);
                }

                // Filter comments to show only developer's own comments
                $bug->comments = $bug->comments->filter(function($comment) use ($user) {
                    return $comment->user_id === $user->id;
                });

                return response()->json(['bug' => $bug]);
            }

            return response()->json(['message' => 'Unauthorized.'], 403);
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
                      ->with(['creator', 'assignee', 'comments.user'])
                      ->orderBy('created_at', 'desc')
                      ->get();
            
            return response()->json(['bugs' => $bugs]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bugs', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin specific methods
    public function adminGetBugs()
    {
        try {
            $bugs = Bug::with(['creator', 'assignee'])
                      ->orderBy('created_at', 'desc')
                      ->get();
            
            return response()->json(['bugs' => $bugs]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bugs', 'error' => $e->getMessage()], 500);
        }
    }

    public function adminCreateBug(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string',
                'description' => 'required|string',
                'priority' => 'required|in:Low,Medium,High',
                'status' => 'required|in:open,assigned,in_progress,fixed,reopened,closed',
                'assigned_to' => 'required|exists:users,id'
            ]);

            $bug = Bug::create([
                'title' => $validatedData['title'],
                'description' => $validatedData['description'],
                'priority' => $validatedData['priority'],
                'status' => $validatedData['status'],
                'assigned_to' => $validatedData['assigned_to'],
                'created_by' => Auth::id()
            ]);

            $bug->load(['creator', 'assignee']);

            return response()->json([
                'message' => 'Bug created successfully',
                'bug' => $bug
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function adminUpdateBug(Request $request, $id)
    {
        try {
            $bug = Bug::findOrFail($id);
            
            $validatedData = $request->validate([
                'title' => 'sometimes|required|string',
                'description' => 'sometimes|required|string',
                'priority' => 'sometimes|required|in:Low,Medium,High',
                'status' => 'sometimes|required|in:open,assigned,in_progress,fixed,reopened,closed',
                'assigned_to' => 'sometimes|required|exists:users,id'
            ]);

            $bug->update($validatedData);
            $bug->load(['creator', 'assignee']);

            return response()->json([
                'message' => 'Bug updated successfully',
                'bug' => $bug
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function adminDeleteBug($id)
    {
        try {
            $bug = Bug::findOrFail($id);
            $bug->delete();
            
            return response()->json(['message' => 'Bug deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function adminGetBug($id)
    {
        try {
            $bug = Bug::with(['creator', 'assignee'])->findOrFail($id);
            return response()->json(['bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bug', 'error' => $e->getMessage()], 500);
        }
    }

    // Tester specific methods
    public function getTesterBug($id)
    {
        try {
            $bug = Bug::with(['creator', 'assignee', 'comments.user'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->created_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only view your own bugs.'], 403);
            }

            return response()->json(['bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function getTesterBugComments($id)
    {
        try {
            $bug = Bug::with(['comments.user'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->created_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only view comments on your own bugs.'], 403);
            }

            return response()->json(['comments' => $bug->comments]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching comments', 'error' => $e->getMessage()], 500);
        }
    }

    // Developer specific methods
    public function getDeveloperBug($id)
    {
        try {
            $bug = Bug::with(['creator', 'assignee'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->assigned_to !== $user->id) {
                return response()->json(['message' => 'Unauthorized. This bug is not assigned to you.'], 403);
            }

            return response()->json(['bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function getDeveloperBugComments($id)
    {
        try {
            $bug = Bug::with(['comments.user'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->assigned_to !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only view comments on bugs assigned to you.'], 403);
            }

            return response()->json(['comments' => $bug->comments]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching comments', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateBugStatus($id, Request $request)
    {
        try {
            $bug = Bug::find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->assigned_to !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only update status of bugs assigned to you.'], 403);
            }

            $validatedData = $request->validate([
                'status' => 'required|in:in_progress,fixed'
            ]);

            $bug->update($validatedData);
            return response()->json(['message' => 'Status updated successfully', 'bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating status', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin specific methods
    public function adminGetBugComments($id)
    {
        try {
            $bug = Bug::with(['comments.user'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            return response()->json(['comments' => $bug->comments]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching comments', 'error' => $e->getMessage()], 500);
        }
    }

    // New admin dashboard methods
    public function adminGetDashboardCounts()
    {
        try {
            $totalBugs = Bug::count();
            $openBugs = Bug::where('status', 'open')->count();
            $inProgressBugs = Bug::where('status', 'in_progress')->count();
            $fixedBugs = Bug::where('status', 'fixed')->count();
            $totalUsers = User::count();
            $totalDevelopers = User::where('role', 'developer')->count();
            $totalTesters = User::where('role', 'tester')->count();

            return response()->json([
                'total_bugs' => $totalBugs,
                'open_bugs' => $openBugs,
                'in_progress_bugs' => $inProgressBugs,
                'fixed_bugs' => $fixedBugs,
                'total_users' => $totalUsers,
                'total_developers' => $totalDevelopers,
                'total_testers' => $totalTesters
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching dashboard counts', 'error' => $e->getMessage()], 500);
        }
    }

    public function adminGetBugsByStatus()
    {
        try {
            $bugsByStatus = Bug::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->get();

            return response()->json(['bugs_by_status' => $bugsByStatus]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bugs by status', 'error' => $e->getMessage()], 500);
        }
    }

    public function adminGetBugsByPriority()
    {
        try {
            $bugsByPriority = Bug::selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->get();

            return response()->json(['bugs_by_priority' => $bugsByPriority]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bugs by priority', 'error' => $e->getMessage()], 500);
        }
    }

    // New tester-specific methods
    public function testerUpdateBug(Request $request, $id)
    {
        try {
            $bug = Bug::find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->created_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only update your own bugs.'], 403);
            }

            $validatedData = $request->validate([
                'title' => 'required|string',
                'description' => 'required|string',
                'priority' => 'required|in:Low,Medium,High',
                'status' => 'required|in:open,in_progress,fixed,closed'
            ]);

            $bug->update($validatedData);
            return response()->json(['message' => 'Bug updated successfully', 'bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function testerViewBug($id)
    {
        try {
            $bug = Bug::with(['creator', 'assignee', 'comments.user'])->find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->created_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only view your own bugs.'], 403);
            }

            return response()->json(['bug' => $bug]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching bug', 'error' => $e->getMessage()], 500);
        }
    }

    public function testerDeleteBug($id)
    {
        try {
            $bug = Bug::find($id);
            if (!$bug) {
                return response()->json(['message' => 'Bug not found'], 404);
            }

            $user = Auth::user();
            if ($bug->created_by !== $user->id) {
                return response()->json(['message' => 'Unauthorized. You can only delete your own bugs.'], 403);
            }

            $bug->delete();
            return response()->json(['message' => 'Bug deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting bug', 'error' => $e->getMessage()], 500);
        }
    }

}
