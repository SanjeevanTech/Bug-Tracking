<?php


namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function register(Request $request){
        $validator = Validator::make(
            $request->all(),
            [
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'role'     => 'required|in:admin,developer,tester',
                'password' => 'required|string|min:6',
            ],
            //  Custom messages
            [
                'email.unique'    => 'This email is already used. Please use a different one.',
                'password.min'    => 'Password must be at least 6 characters long.',
                'role.in'         => 'Role must be one of: admin, developer, or tester.',
            ]
        );
    

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'role'     => $request->role,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    public function login(Request $request){
        try {
            $validator = Validator::make(
                $request->all(),
                [
                    'email'    => 'required|email',
                    'password' => 'required|string|min:6',
                ],
                [
                    'email.required'    => 'Email is required.',
                    'email.email'       => 'Please enter a valid email.',
                    'password.required' => 'Password is required.',
                    'password.min'      => 'Password must be at least 6 characters.',
                ]
            );

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors'  => $validator->errors()
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid email or password.'
                ], 401);
            }

            // Delete existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token'   => $token,
                'user'    => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during login',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request){
        $user = $request->user();  
    
        if (!$user) {
            return response()->json([
                'message' => 'Not authenticated.'  
            ], 401);
        }

        $user->currentAccessToken()->delete();    
    
        return response()->json([
            'message' => 'Successfully logged out.'
        ]);
    }

public function getDetails(Request $request)
{
    $user = $request->user(); // Gets authenticated user
    
    if (!$user) {
        return response()->json([
            'message' => 'Unauthorized. Please login to report a bug.'
        ], 401);
    }

    return response()->json([
        'message' => 'User details retrieved successfully',
        'user' => $user->only(['id', 'name', 'email', 'role']) // Explicitly select fields
    ], 200);
}

   public function updateUser(Request $request, $id){
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // Validate the request data
        $validatedData = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'required_with:current_password|string|min:6',
            'new_password_confirmation' => 'required_if:new_password,!=,null|same:new_password'
        ], [
            'email.unique'    => 'This email is already used by another user. Please use a different one.',
            'current_password.required_with' => 'Current password is required when updating password.',
            'new_password.required_with' => 'New password is required when updating password.',
            'new_password.min' => 'New password must be at least 6 characters long.',
            'new_password_confirmation.required_if' => 'Please confirm your new password.',
            'new_password_confirmation.same' => 'New password confirmation does not match.'
        ]);

        // If password update is requested
        if ($request->has('current_password') && $request->has('new_password')) {
            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.'
                ], 422);
            }

            // Update password
            $user->password = Hash::make($request->new_password);
        }

        // Update other fields if provided
        if ($request->has('name')) {
            $user->name = $validatedData['name'];
        }
        if ($request->has('email')) {
            $user->email = $validatedData['email'];
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->only(['id', 'name', 'email', 'role'])
        ], 200);
   }

   public function deleteUser($id){
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            // Unassign all bugs assigned to this user
            \App\Models\Bug::where('assigned_to', $id)->update(['assigned_to' => null, 'status' => 'open']);

            // Delete the user
            $user->delete();

            return response()->json(['message' => 'User deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllUsers()
    {
        try {
            // Get all users except the current user
            $users = User::where('id', '!=', Auth::id())
                        ->select('id', 'name', 'email', 'role')
                        ->get();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Users retrieved successfully',
                'users' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
