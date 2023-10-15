<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController; 

 
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
 
Route::resource('users', UserController::class);

Route::resource('posts', PostController::class);

Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->middleware('auth');

Route::post('/posts/new-post', [PostController::class, 'store'])->middleware('auth');

