<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::middleware("auth:sanctum")->group(function () {
    Route::get("/logout", [AuthController::class, "logout"]);
});

Route::controller(AuthController::class)->group(function () {
    Route::post("/register", "register");
    Route::post("/login", "login");

});

Route::controller(ProductController::class)->group(function () {
    Route::get("products/list", "list");

});


