from django.test import TestCase

from .engine import HOSRulesEngine, HOSState


class HOSRulesEngineTests(TestCase):

    def test_simulate_trip_returns_rounded_hours(self):
        engine = HOSRulesEngine()
        state = HOSState(cycle_used=23.0)

        result = engine.simulate_trip(state, 1.99)

        self.assertEqual(result["status"], "approved")
        self.assertEqual(result["driving_hours"], 1.99)
        self.assertEqual(result["on_duty"], 3.99)
        self.assertEqual(result["cycle_used"], 26.99)
