from dataclasses import dataclass

@dataclass
class HOSState:
    driving_hours_today: float = 0
    on_duty_hours_today: float = 0
    cycle_used: float = 0  # 70-hour rolling total


class HOSRulesEngine:

    MAX_DRIVING = 11
    MAX_ON_DUTY = 14
    MAX_CYCLE = 70

    def check_cycle_limit(self, state: HOSState, new_hours: float):
        if state.cycle_used + new_hours > self.MAX_CYCLE:
            return False, "70-hour limit exceeded. 34-hour restart required."
        return True, "OK"

    def check_daily_limits(self, state: HOSState, driving_add: float, duty_add: float):

        if state.driving_hours_today + driving_add > self.MAX_DRIVING:
            return False, "11-hour driving limit exceeded"

        if state.on_duty_hours_today + duty_add > self.MAX_ON_DUTY:
            return False, "14-hour duty window exceeded"

        return True, "OK"

    def simulate_trip(self, state: HOSState, driving_hours: float):

        duty_hours = driving_hours + 2  # pickup + drop assumption

        cycle_ok, cycle_msg = self.check_cycle_limit(state, duty_hours)
        if not cycle_ok:
            return {"status": "violation", "message": cycle_msg, "driving_hours": 0, "on_duty": 0}

        daily_ok, daily_msg = self.check_daily_limits(state, driving_hours, duty_hours)
        if not daily_ok:
            return {"status": "violation", "message": daily_msg, "driving_hours": 0, "on_duty": 0}

        state.driving_hours_today += driving_hours
        state.on_duty_hours_today += duty_hours
        state.cycle_used += duty_hours

        return {
            "status": "approved",
            "driving_hours": round(state.driving_hours_today, 2),
            "on_duty": round(state.on_duty_hours_today, 2),
            "cycle_used": round(state.cycle_used, 2)
        }