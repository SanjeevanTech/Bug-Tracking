<?php

use Illuminate\Http\Request;
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
    Route::post('/bugcreate', [BugController::class, 'createbug']);
    Route::post('/commentcreate', [CommentController::class, 'createComment']);
    
});




