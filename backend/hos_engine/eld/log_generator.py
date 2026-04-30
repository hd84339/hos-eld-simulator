from dataclasses import dataclass
from typing import List, Dict

@dataclass
class LogEntry:
    status: str   # DRIVING / ON_DUTY / OFF_DUTY / SLEEPER
    start: float
    end: float


class ELDLogGenerator:

    def generate_daily_log(self, driving_hours: float, on_duty_hours: float):
        """
        Creates a simple FMCSA-style daily log breakdown
        """

        log = []

        remaining_drive = driving_hours
        remaining_duty = on_duty_hours

        current_time = 0

        # 1. Driving block
        if remaining_drive > 0:
            log.append(LogEntry(
                status="DRIVING",
                start=current_time,
                end=current_time + remaining_drive
            ))
            current_time += remaining_drive

        # 2. On duty rest of time
        if remaining_duty > remaining_drive:
            log.append(LogEntry(
                status="ON_DUTY",
                start=current_time,
                end=remaining_duty
            ))

        return log