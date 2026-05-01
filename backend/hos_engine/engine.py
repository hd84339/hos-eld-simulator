from dataclasses import dataclass
from typing import List, Dict

@dataclass
class HOSState:
    driving_hours_today: float = 0
    on_duty_hours_today: float = 0
    cycle_used: float = 0  # 70-hour rolling total
    current_day: int = 1

@dataclass
class LogEntry:
    status: str
    start: float
    end: float
    day: int
    note: str = ""

class HOSRulesEngine:
    MAX_DRIVING = 11
    MAX_ON_DUTY = 14
    MAX_CYCLE = 70
    BREAK_AFTER_DRIVING = 8

    def simulate_trip(self, initial_cycle_used: float, required_driving_hours: float):
        state = HOSState(cycle_used=initial_cycle_used)
        logs = []
        violations_prevented = []
        
        current_time_in_day = 0.0
        remaining_drive = required_driving_hours
        
        # 1 hr ON_DUTY for Pickup/Pre-trip
        pickup_time = 1.0
        logs.append(LogEntry("ON_DUTY", current_time_in_day, current_time_in_day + pickup_time, state.current_day, "Pickup / Pre-trip"))
        current_time_in_day += pickup_time
        state.on_duty_hours_today += pickup_time
        state.cycle_used += pickup_time
        
        continuous_drive = 0.0
        
        while remaining_drive > 0:
            # Check if cycle limit is hit
            if state.cycle_used >= self.MAX_CYCLE:
                return {
                    "status": "violation",
                    "violation_type": "70_hour_limit_exceeded",
                    "message": "70-hour cycle limit reached. 34-hour restart required before continuing.",
                    "driving_hours": required_driving_hours - remaining_drive,
                    "on_duty": state.on_duty_hours_today,
                    "cycle_used": state.cycle_used,
                    "eld_log": [self._log_to_dict(l) for l in logs],
                    "rules_enforced": violations_prevented
                }
            
            # How much can we drive right now?
            # 1. Constrained by 8-hour break rule
            drive_until_break = self.BREAK_AFTER_DRIVING - continuous_drive
            # 2. Constrained by 11-hour daily limit
            drive_until_11hr = self.MAX_DRIVING - state.driving_hours_today
            # 3. Constrained by 14-hour duty limit
            drive_until_14hr = self.MAX_ON_DUTY - state.on_duty_hours_today
            # 4. Constrained by 70-hour cycle limit
            drive_until_70hr = self.MAX_CYCLE - state.cycle_used
            
            max_possible_drive = min(drive_until_break, drive_until_11hr, drive_until_14hr, drive_until_70hr, remaining_drive)
            
            if max_possible_drive > 0:
                logs.append(LogEntry("DRIVING", current_time_in_day, current_time_in_day + max_possible_drive, state.current_day, "Driving segment"))
                current_time_in_day += max_possible_drive
                state.driving_hours_today += max_possible_drive
                state.on_duty_hours_today += max_possible_drive
                state.cycle_used += max_possible_drive
                continuous_drive += max_possible_drive
                remaining_drive -= max_possible_drive

            if remaining_drive <= 0:
                break # We finished driving!
                
            # If we couldn't drive (or finished max possible drive), figure out what rest is needed
            
            # Need 30-min break
            if continuous_drive >= self.BREAK_AFTER_DRIVING:
                violations_prevented.append("Required 30-minute break after 8 hours of driving.")
                break_duration = 0.5
                logs.append(LogEntry("OFF_DUTY", current_time_in_day, current_time_in_day + break_duration, state.current_day, "30-min Break"))
                current_time_in_day += break_duration
                state.on_duty_hours_today += break_duration
                state.cycle_used += break_duration
                continuous_drive = 0.0 # reset continuous drive
                
            # Need 10-hour sleeper rest
            if state.driving_hours_today >= self.MAX_DRIVING or state.on_duty_hours_today >= self.MAX_ON_DUTY:
                reason = "11-hour driving limit" if state.driving_hours_today >= self.MAX_DRIVING else "14-hour duty limit"
                violations_prevented.append(f"Required 10-hour sleeper berth due to {reason}.")
                sleep_duration = 10.0
                logs.append(LogEntry("SLEEPER", current_time_in_day, current_time_in_day + sleep_duration, state.current_day, "10-hour Rest"))
                
                # Advance to next day
                state.current_day += 1
                state.driving_hours_today = 0.0
                state.on_duty_hours_today = 0.0
                continuous_drive = 0.0
                current_time_in_day = 0.0 # Reset day clock
                
        # Finished driving, add 1 hr Dropoff
        # Check cycle one last time before dropoff
        if state.cycle_used + 1.0 > self.MAX_CYCLE:
             return {
                "status": "violation",
                "violation_type": "70_hour_limit_exceeded",
                "message": "Cannot complete dropoff, 70-hour cycle limit reached.",
                "driving_hours": required_driving_hours,
                "on_duty": state.on_duty_hours_today,
                "cycle_used": state.cycle_used,
                "eld_log": [self._log_to_dict(l) for l in logs],
                "rules_enforced": violations_prevented
            }
            
        dropoff_time = 1.0
        logs.append(LogEntry("ON_DUTY", current_time_in_day, current_time_in_day + dropoff_time, state.current_day, "Dropoff / Post-trip"))
        state.on_duty_hours_today += dropoff_time
        state.cycle_used += dropoff_time
        
        return {
            "status": "compliant",
            "driving_hours": required_driving_hours,
            "on_duty": state.on_duty_hours_today,
            "cycle_used": state.cycle_used,
            "total_days": state.current_day,
            "eld_log": [self._log_to_dict(l) for l in logs],
            "rules_enforced": violations_prevented
        }
        
    def _log_to_dict(self, log: LogEntry):
        return {
            "status": log.status,
            "start": round(log.start, 2),
            "end": round(log.end, 2),
            "day": log.day,
            "note": log.note
        }