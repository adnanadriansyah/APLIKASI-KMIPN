<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'role_id',
        'dusun_id',
        'desa_id',
        'polsek_id',
        'nama',
        'email',
        'phone',
        'nik',
        'alamat',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function dusun(): BelongsTo
    {
        return $this->belongsTo(Dusun::class);
    }

    public function desa(): BelongsTo
    {
        return $this->belongsTo(Desa::class);
    }

    public function polsek(): BelongsTo
    {
        return $this->belongsTo(Polsek::class);
    }

    /**
     * Resolve polsek_id untuk user ini berdasarkan hierarchy:
     *   polsek          → user.polsek_id (filtered to own polsek)
     *   aparatur_desa   → desa_id → desa.polsek_id
     *   warga           → dusun_id → dusun.desa.polsek_id
     */
    public function getPolsekId(): ?int
    {
        $roleName = $this->role?->name;

        if ($roleName === 'polsek') {
            return $this->polsek_id;
        }

        if ($this->desa_id && $this->desa) {
            return $this->desa->polsek_id;
        }

        if ($this->dusun && $this->dusun->desa) {
            return $this->dusun->desa->polsek_id;
        }

        return null;
    }

    /**
     * Get array dusun_ids yang bisa diakses user ini berdasarkan hierarchy.
     *
     * Polsek         → semua dusun di polsek-nya (filtered by polsek_id)
     * Aparatur desa  → semua dusun di desanya
     * Warga          → dusun sendiri saja
     */
    public function getDusunIds(): array
    {
        $roleName = $this->role?->name;

        if ($roleName === 'polsek') {
            if ($this->polsek_id) {
                return Dusun::whereHas('desa', fn ($q) => $q->where('polsek_id', $this->polsek_id))
                    ->pluck('id')->toArray();
            }

            return Dusun::pluck('id')->toArray();
        }

        if ($roleName === 'aparatur_desa') {
            $desaId = $this->desa_id ?? $this->dusun?->desa_id;
            if (! $desaId) {
                return [];
            }

            return Dusun::where('desa_id', $desaId)->pluck('id')->toArray();
        }

        if ($this->dusun_id) {
            return [$this->dusun_id];
        }

        return [];
    }

    /**
     * Get desa_id untuk user ini, resolved dari hierarchy.
     */
    public function getDesaId(): ?int
    {
        if ($this->desa_id) {
            return $this->desa_id;
        }

        if ($this->dusun && $this->dusun->desa_id) {
            return $this->dusun->desa_id;
        }

        return null;
    }

    /**
     * Resolve Desa model untuk user ini.
     */
    public function getDesa(): ?Desa
    {
        if ($this->desa) {
            return $this->desa;
        }

        if ($this->dusun && $this->dusun->desa) {
            return $this->dusun->desa;
        }

        return null;
    }

    public function jadwalRondaPetugas()
    {
        return $this->hasMany(JadwalRondaPetugas::class);
    }

    public function qrcodeRondas()
    {
        return $this->hasMany(QrcodeRonda::class, 'scanned_by');
    }

    public function laporanRumahKosongs()
    {
        return $this->hasMany(LaporanRumahKosong::class);
    }

    public function laporanKamtibmas()
    {
        return $this->hasMany(LaporanKamtibmas::class);
    }

    public function panicButtonLogs()
    {
        return $this->hasMany(PanicButtonLog::class);
    }

    public function respondedPanicButtonLogs()
    {
        return $this->hasMany(PanicButtonLog::class, 'responded_by');
    }
}
