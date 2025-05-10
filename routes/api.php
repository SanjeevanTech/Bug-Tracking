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
    Route::get('/bugs', [BugController::class, 'getAllBugs']); // Admin gets all bugs
    Route::get('/admin/bug/{id}', [BugController::class, 'getBug']); // Admin bug detail view
});

Route::middleware(['auth:sanctum', 'role:tester'])->group(function () {
    Route::get('/tester/bugs', [BugController::class, 'getTesterBugs']); // Tester gets only their bugs
    Route::post('/bugcreate', [BugController::class, 'createbug']);
    Route::delete('/bugDelete/{id}', [BugController::class, 'deleteBug']);
    Route::put('/tester/bugs/{id}', [BugController::class, 'updateBug']);
    Route::get('/tester/bug/{id}', [BugController::class, 'getBug']);
});

Route::middleware(['auth:sanctum', 'role:developer,admin'])->group(function () {
    Route::post('/commentcreate', [CommentController::class, 'createComment']);
    Route::put('/commentedit/{id}', [CommentController::class, 'updateComment']);
    Route::delete('/commentdelete/{id}', [CommentController::class, 'deleteComment']);
});

Route::middleware(['auth:sanctum', 'role:developer,admin'])->group(function () {
    Route::get('/assignedbugs', [BugController::class, 'assignedBugs']); // list view
    Route::get('/developer/bug/{id}', [BugController::class, 'getBug']); // Developer bug detail view
});





