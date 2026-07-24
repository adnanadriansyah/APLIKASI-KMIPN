<?php

use App\Jobs\GenerateAiInsight;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new GenerateAiInsight)->weeklyOn(1, '6:00');
