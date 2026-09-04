<?php

use Illuminate\Support\Facades\Route;

// require __DIR__.'/auth.php';

Route::get('/login', function () {
    return view('app');
})->name('login');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');