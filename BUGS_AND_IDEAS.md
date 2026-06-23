# Bugs And Ideas

Use this file to collect future V2 planning items without expanding the V1 scope.

## Bugs To Watch

- Verify task generation across time zones, especially near midnight.
- Confirm weekly tasks behave correctly for all schedule rules.
- Watch for stale dashboard data after long browser sessions.
- Check whether duplicate goal records can still appear after unusual network failures.
- Confirm MongoDB index syncing behaves as expected in production environments.

## V2 Ideas

- Add check-in forms for exercise, skincare, and focus metrics.
- Add streaks, weekly trends, and calendar-style task history.
- Add password reset, email verification, and account deletion.
- Add a dedicated edit-goal page with clearer saved-settings feedback.
- Add more goals, such as nutrition, sleep, mindfulness, and reading.
- Add user-controlled reminder preferences.
- Add export/download of progress data.
- Add production deployment guides for Render, Railway, Vercel, or similar platforms.

## Technical Improvements

- Move JWT auth from `localStorage` to httpOnly cookies.
- Add centralized frontend form validation using the same template metadata.
- Add seed scripts for local demo data.
- Add CI to run backend tests, frontend tests, and frontend build on every pull request.
- Add server-side pagination for history and check-ins if data grows.
- Add structured logging for backend errors.

## Product Notes

- Keep V2 calm and self-care focused, not overloaded with analytics.
- Avoid presenting generated tasks as medical, fitness, or dermatology advice.
- Keep new goal templates beginner-friendly and easy to edit.

## V1.0.2 Notes

- Points are now the primary progression currency for task completion.
- Keep level thresholds, cheat rewards, achievements, and AI recommendations layered on top of point transactions rather than recalculating directly from tasks.
- Future reward rules should consume the transaction log so spending, audits, and eligibility checks stay consistent.

## V1.0.3 Notes

- Levels are calculated from lifetime points, not spendable total points.
- Keep future reward spending separate from level progression so v1.0.4 cheat rewards can use total points without reducing current level.
- Future achievements can listen for level-up events or use point transaction history for eligibility.
