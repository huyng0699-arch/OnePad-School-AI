# Alert Algorithms

- Academic engine uses ABC-oriented features and baseline deltas from quiz/mastery/support trends.
- Wellbeing engine uses support/frustration/low-confidence frequency plus optional text-signal score.
- Physical health engine uses smartwatch/health urgency + inactivity/safety response factors.
- Social integration engine uses group/collaboration participation drop and concern signals.
- Every alert stores: `score`, `confidence`, `evidenceCount`, `baselineWindowDays`, `triggeredSignals`.
