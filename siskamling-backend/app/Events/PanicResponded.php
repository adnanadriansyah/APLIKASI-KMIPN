<?php

namespace App\Events;

use App\Models\PanicButtonLog;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PanicResponded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public PanicButtonLog $panic;

    public function __construct(PanicButtonLog $panic)
    {
        $this->panic = $panic;
    }

    public function broadcastOn(): array
    {
        $polsekId = $this->resolvePolsekId();

        return [
            new PrivateChannel('polsek.'.$polsekId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'panic.responded';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->panic->id,
            'status' => $this->panic->status,
            'responded_by' => [
                'id' => $this->panic->respondedBy->id,
                'nama' => $this->panic->respondedBy->nama,
            ],
            'responded_at' => $this->panic->responded_at,
        ];
    }

    private function resolvePolsekId(): ?int
    {
        $user = $this->panic->user;

        if ($user->polsek_id) {
            return $user->polsek_id;
        }

        if ($user->desa && $user->desa->polsek_id) {
            return $user->desa->polsek_id;
        }

        return $user->dusun?->desa?->polsek_id;
    }
}
