"""
Multi-Rate Time Domain Scheduler Engine (v12)
Manages the 9 time domains from ELECTRICAL (1ms) to CHRONIC (1wk).
"""
from models.enums import TimeDomain

class Scheduler:
    DOMAIN_INTERVALS: dict[TimeDomain, float] = {
        TimeDomain.ELECTRICAL: 0.001,   # 1ms
        TimeDomain.CARDIAC: 0.01,       # 10ms
        TimeDomain.RESPIRATORY: 0.1,    # 100ms
        TimeDomain.CIRCULATION: 1.0,    # 1s
        TimeDomain.HORMONAL: 10.0,      # 10s
        TimeDomain.RENAL: 60.0,         # 1min
        TimeDomain.INFLAMMATION: 3600.0,# 1hr
        TimeDomain.HEALING: 86400.0,    # 1day
        TimeDomain.CHRONIC: 604800.0,   # 1wk
    }

    def __init__(self, fixed_dt: float = 0.001):
        self.dt = fixed_dt
        self.sim_time = 0.0
        self._last_executed: dict[TimeDomain, float] = {d: -1.0 for d in TimeDomain}

    def advance(self):
        self.sim_time += self.dt

    def get_due_domains(self) -> list[TimeDomain]:
        due = []
        for domain, interval in Scheduler.DOMAIN_INTERVALS.items():
            last = self._last_executed[domain]
            if last < 0 or (self.sim_time - last) >= (interval - 1e-6):
                due.append(domain)
                self._last_executed[domain] = self.sim_time
        return due
