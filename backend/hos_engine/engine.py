from dataclasses import dataclass
from typing import List, Dict

@dataclass
class LogEntry:
    status: str
    start: float  # Absolute time in hours from start of trip
    end: float    # Absolute time in hours from start of trip
    note: str = ""

@dataclass
class HOSState:
    cycle_used: float = 0         # Cumulative ON_DUTY + DRIVING across all days
    shift_driving: float = 0      # Cumulative DRIVING since last 10h rest
    shift_elapsed: float = 0      # Time elapsed since last 10h rest started (ticks continuously)
    continuous_drive: float = 0   # Cumulative DRIVING since last 30m break or 10h rest
    absolute_time: float = 0      # Total hours since trip began

class HOSRulesEngine:
    MAX_DRIVING = 11.0
    MAX_SHIFT = 14.0
    MAX_CYCLE = 70.0
    BREAK_AFTER_DRIVING = 8.0

    def simulate_trip(self, initial_cycle_used: float, required_driving_hours: float):
        state = HOSState(cycle_used=initial_cycle_used)
        logs = []
        violations_prevented = []
        
        remaining_drive = required_driving_hours
        
        def add_log(status, duration, note=""):
            if duration <= 0:
                return
                
            logs.append(LogEntry(status, state.absolute_time, state.absolute_time + duration, note))
            state.absolute_time += duration
            
            if status in ["DRIVING"]:
                state.shift_driving += duration
                state.continuous_drive += duration
                state.cycle_used += duration
            elif status in ["ON_DUTY"]:
                state.cycle_used += duration
                
            if status in ["OFF_DUTY", "SLEEPER"]:
                if duration >= 10.0:
                    state.shift_driving = 0
                    state.shift_elapsed = 0
                    state.continuous_drive = 0
                elif duration >= 0.5:
                    state.continuous_drive = 0
                    
            if duration < 10.0:
                state.shift_elapsed += duration

        # 1 hr ON_DUTY for Pickup/Pre-trip
        add_log("ON_DUTY", 1.0, "Pickup / Pre-trip")
        
        while remaining_drive > 0:
            if state.cycle_used >= self.MAX_CYCLE:
                return {
                    "status": "violation",
                    "violation_type": "70_hour_limit_exceeded",
                    "message": "70-hour cycle limit reached. 34-hour restart required before continuing.",
                    "driving_hours": required_driving_hours - remaining_drive,
                    "cycle_used": state.cycle_used,
                    "eld_log": self._chunk_logs_by_day(logs),
                    "rules_enforced": violations_prevented,
                    "raw_logs": [{"status": l.status, "start": l.start, "end": l.end, "note": l.note} for l in logs]
                }
            
            drive_until_break = self.BREAK_AFTER_DRIVING - state.continuous_drive
            drive_until_11hr = self.MAX_DRIVING - state.shift_driving
            drive_until_14hr = self.MAX_SHIFT - state.shift_elapsed
            drive_until_70hr = self.MAX_CYCLE - state.cycle_used
            
            max_possible_drive = max(0.0, min(drive_until_break, drive_until_11hr, drive_until_14hr, drive_until_70hr, remaining_drive))
            
            if max_possible_drive > 0:
                add_log("DRIVING", max_possible_drive, "Driving segment")
                remaining_drive -= max_possible_drive
                
            if remaining_drive <= 0:
                break
                
            if state.shift_elapsed >= self.MAX_SHIFT or state.shift_driving >= self.MAX_DRIVING:
                reason = "11-hour driving limit" if state.shift_driving >= self.MAX_DRIVING else "14-hour shift limit"
                violations_prevented.append(f"Required 10-hour sleeper berth due to {reason}.")
                add_log("SLEEPER", 10.0, "10-hour Rest")
                
            elif state.continuous_drive >= self.BREAK_AFTER_DRIVING:
                if state.shift_elapsed + 0.5 >= self.MAX_SHIFT:
                    violations_prevented.append("Required 10-hour sleeper berth (30-min break would exceed 14-hr shift).")
                    add_log("SLEEPER", 10.0, "10-hour Rest")
                else:
                    violations_prevented.append("Required 30-minute break after 8 hours of driving.")
                    add_log("OFF_DUTY", 0.5, "30-min Break")
                    
        if state.cycle_used + 1.0 > self.MAX_CYCLE:
             return {
                "status": "violation",
                "violation_type": "70_hour_limit_exceeded",
                "message": "Cannot complete dropoff, 70-hour cycle limit reached.",
                "driving_hours": required_driving_hours,
                "cycle_used": state.cycle_used,
                "eld_log": self._chunk_logs_by_day(logs),
                "rules_enforced": violations_prevented,
                "raw_logs": [{"status": l.status, "start": l.start, "end": l.end, "note": l.note} for l in logs]
            }
            
        add_log("ON_DUTY", 1.0, "Dropoff / Post-trip")
        
        return {
            "status": "compliant",
            "driving_hours": required_driving_hours,
            "cycle_used": round(state.cycle_used, 2),
            "total_hours": round(state.absolute_time, 2),
            "eld_log": self._chunk_logs_by_day(logs),
            "rules_enforced": violations_prevented,
            "raw_logs": [{"status": l.status, "start": l.start, "end": l.end, "note": l.note} for l in logs]
        }
        
    def _chunk_logs_by_day(self, logs: List[LogEntry]):
        chunked = []
        for log in logs:
            start = log.start
            end = log.end
            
            while start < end:
                day_num = int(start // 24) + 1
                day_end = day_num * 24.0
                
                chunk_end = min(end, day_end)
                
                start_in_day = start - (day_num - 1) * 24.0
                end_in_day = chunk_end - (day_num - 1) * 24.0
                
                chunked.append({
                    "day": day_num,
                    "status": log.status,
                    "start": round(start_in_day, 2),
                    "end": round(end_in_day, 2),
                    "note": log.note
                })
                
                start = chunk_end
                
        return chunked