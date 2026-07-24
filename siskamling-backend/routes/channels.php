<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('polsek.{polsekId}', function (User $user, $polsekId) {
    if ($user->role->name !== 'polsek') {
        return false;
    }

    $userPolsekId = $user->getPolsekId();

    return $userPolsekId && (int) $userPolsekId === (int) $polsekId;
});
