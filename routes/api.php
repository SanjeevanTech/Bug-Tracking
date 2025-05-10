<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\BugController;
use App\Http\Controllers\CommentController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/getDetails', [UserController::class, 'getDetails']);
    Route::put('/edit/{id}', [UserController::class, 'updateUser']);
    Route::put('/bugedit/{id}', [BugController::class, 'updateBug']);
    
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'getAllUsers']);
    Route::delete('/delete/{id}', [UserController::class, 'deleteUser']);
});

Route::middleware(['auth:sanctum', 'role:tester,admin'])->group(function () {
    Route::post('/bugcreate', [BugController::class, 'createbug']);
    Route::delete('/bugDelete/{id}', [BugController::class, 'deleteBug']);
    
});

Route::middleware(['auth:sanctum', 'role:developer,admin'])->group(function () {
    Route::post('/commentcreate', [CommentController::class, 'createComment']);
    Route::put('/commentedit/{id}', [CommentController::class, 'updateComment']);
    Route::delete('/commentdelete/{id}', [CommentController::class, 'deleteComment']);
    
});

Route::middleware(['auth:sanctum', 'role:developer,admin'])->group(function () {
    Route::get('/assignedbugs', [BugController::class, 'assignedBugs']); // list view
    Route::get('/bug/{id}', [BugController::class, 'viewBug']); // detail view
});

Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

Route::get('/bugs/reported-by/{userId}', [BugController::class, 'getBugsReportedByUser']);





