<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\KamtibmasController;
use App\Http\Controllers\Api\LinmasController;
use App\Http\Controllers\Api\PanicController;
use App\Http\Controllers\Api\RondaController;
use App\Http\Controllers\Api\RumahKosongController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('ronda')->group(function () {
        Route::get('/jadwal', [RondaController::class, 'index']);
        Route::post('/jadwal', [RondaController::class, 'store'])
            ->middleware('role:aparatur_desa');
        Route::post('/qrcode/generate', [RondaController::class, 'generateQr'])
            ->middleware('role:warga');
        Route::post('/qrcode/scan', [RondaController::class, 'scanQr'])
            ->middleware('role:aparatur_desa');
    });

    Route::prefix('rumah-kosong')->group(function () {
        Route::get('/', [RumahKosongController::class, 'index']);
        Route::post('/', [RumahKosongController::class, 'store']);
        Route::get('/{id}', [RumahKosongController::class, 'show']);
        Route::put('/{id}', [RumahKosongController::class, 'update']);
        Route::delete('/{id}', [RumahKosongController::class, 'destroy']);
    });

    Route::prefix('kamtibmas')->group(function () {
        Route::get('/', [KamtibmasController::class, 'index']);
        Route::post('/', [KamtibmasController::class, 'store']);
        Route::get('/{id}', [KamtibmasController::class, 'show']);
        Route::put('/{id}/status', [KamtibmasController::class, 'updateStatus'])
            ->middleware('role:polsek');
    });

    Route::prefix('linmas')->group(function () {
        Route::get('/', [LinmasController::class, 'index'])
            ->middleware('role:polsek');
        Route::post('/', [LinmasController::class, 'store'])
            ->middleware('role:polsek');
        Route::get('/{id}', [LinmasController::class, 'show'])
            ->middleware('role:polsek');
        Route::put('/{id}', [LinmasController::class, 'update'])
            ->middleware('role:polsek');
        Route::delete('/{id}', [LinmasController::class, 'destroy'])
            ->middleware('role:polsek');
    });

    Route::prefix('panic')->group(function () {
        Route::post('/', [PanicController::class, 'store'])
            ->middleware('role:warga');
        Route::get('/active', [PanicController::class, 'active']);
        Route::put('/{id}/respond', [PanicController::class, 'respond'])
            ->middleware('role:polsek');
    });

    Route::prefix('dashboard')->group(function () {
        Route::get('/polsek', [DashboardController::class, 'polsekSummary'])
            ->middleware('role:polsek');
        Route::get('/desa', [DashboardController::class, 'desaSummary'])
            ->middleware('role:aparatur_desa');
        Route::get('/warga', [DashboardController::class, 'wargaSummary'])
            ->middleware('role:warga');
        Route::get('/desa/ai-insight', [DashboardController::class, 'aiInsight'])
            ->middleware('role:aparatur_desa');
        Route::post('/desa/ai-insight/generate', [DashboardController::class, 'generateAiInsight'])
            ->middleware('role:aparatur_desa');
    });
});
