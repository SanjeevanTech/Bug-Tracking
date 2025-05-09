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

     if (!$user) {
        return response()->json([
            'message' => 'User not found.'
        ], 404);
    }

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Invalid email or password.'
        ], 401);
    }

    
    $user->tokens()->delete();

    
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'token'   => $token,
        'user'    => $user
    ]);
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

    public function getDetails(){
        $userId = Auth::id();
        if (!$userId) {
            return response()->json([
                'message' => 'Unauthorized. Please login to report a bug.'
            ], 401);
        }

        $users = User::select('name', 'email')->get();

        return response()->json([
            'message' => 'User details retrieved successfully',
            'users' => $users
        ], 200);
    }

   public function updateUser(Request $request, $id){
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        
        $validatedData = $request->validate([
            'name'  => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
        ], [
            'email.unique'    => 'This email is already used by another user. Please use a different one.',
        ]);


        $user->update($validatedData);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user
        ], 200);
   }

   public function deleteUser($id){
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.'], 200);
    }

    




}
