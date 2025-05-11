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
    Route::get('/admin/bugs', [BugController::class, 'adminGetBugs']);
    Route::post('/admin/bug', [BugController::class, 'adminCreateBug']);
    Route::put('/admin/bug/{id}', [BugController::class, 'adminUpdateBug']);
    Route::delete('/admin/bug/{id}', [BugController::class, 'adminDeleteBug']);
    Route::get('/admin/bug/{id}', [BugController::class, 'adminGetBug']);
    Route::get('/admin/bug/{id}/comments', [BugController::class, 'adminGetBugComments']);
    Route::delete('/admin/comment/{id}', [CommentController::class, 'adminDeleteComment']);
    
    // New admin dashboard count endpoints
    Route::get('/admin/dashboard/counts', [BugController::class, 'adminGetDashboardCounts']);
    Route::get('/admin/dashboard/bugs-by-status', [BugController::class, 'adminGetBugsByStatus']);
    Route::get('/admin/dashboard/bugs-by-priority', [BugController::class, 'adminGetBugsByPriority']);
});

Route::middleware(['auth:sanctum', 'role:tester'])->group(function () {
    Route::get('/tester/bugs', [BugController::class, 'getTesterBugs']);
    Route::post('/tester/bug', [BugController::class, 'createbug']);
    Route::delete('/tester/bug/{id}', [BugController::class, 'deleteBug']);
    Route::put('/tester/bug/{id}', [BugController::class, 'testerUpdateBug']);
    Route::get('/tester/bug/{id}', [BugController::class, 'getTesterBug']);
    Route::get('/tester/bug/{id}/comments', [BugController::class, 'getTesterBugComments']);
    
    Route::get('/tester/bug/{id}/view', [BugController::class, 'testerViewBug']);
    Route::delete('/tester/bug/{id}/delete', [BugController::class, 'testerDeleteBug']);
});

Route::middleware(['auth:sanctum', 'role:developer'])->group(function () {
    Route::get('/assignedbugs', [BugController::class, 'assignedBugs']);
    Route::get('/developer/bug/{id}', [BugController::class, 'getBug']);
    Route::put('/bugedit/{id}', [BugController::class, 'updateBug']);
    Route::get('/developer/bugs', [BugController::class, 'assignedBugs']);
    Route::get('/developer/bug/{id}/comments', [BugController::class, 'getDeveloperBugComments']);
    Route::put('/developer/bug/{id}/status', [BugController::class, 'updateBugStatus']);
});

Route::middleware(['auth:sanctum', 'role:developer,admin,tester'])->group(function () {
    Route::post('/commentcreate', [CommentController::class, 'createComment']);
    Route::put('/commentedit/{id}', [CommentController::class, 'updateComment']);
    Route::delete('/commentdelete/{id}', [CommentController::class, 'deleteComment']);
});





