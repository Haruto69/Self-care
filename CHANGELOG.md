# Changelog

All notable changes to this project will be documented in this file.

## V1.0.3 - 2026-06-23

### Main Features

- Added a level system powered by lifetime points.
- Added configurable level thresholds from Level 1 through Level 10.
- Added level progress fields to the point summary API.
- Updated the dashboard Points Card with current level, next-level progress, and points needed for the next level.
- Added simple level-up feedback after task completion crosses a level threshold.

### Technical Improvements

- Added a dedicated level service so progression logic stays separate from task, point, and UI logic.
- Recalculate and save user `currentLevel` whenever points are awarded.
- Added backend tests for level calculations, defaults, summary fields, saved level updates, and level-up detection.
- Added frontend tests for level display, progress rendering, and level-up messaging.

## V1.0.2 - 2026-06-23

### Main Features

- Added a points system that awards users when they complete generated tasks.
- Added centralized point values for Exercise, Skincare, and Focus daily and weekly tasks.
- Added user point profiles with total points, lifetime points, current level, points earned today, and last award date.
- Added a dashboard Points Card showing total points and points earned today.
- Added point transaction history for future audits, rewards, levels, and achievements.

### Technical Improvements

- Added a point service so award logic stays separate from task generation and UI components.
- Added authenticated point summary and point history API endpoints.
- Added duplicate-award protection so repeated task toggles do not grant points again.
- Added backend and frontend tests for point awards, summaries, transaction history, and dashboard updates.

## V1.0.0 - 2026-06-17

### Main Features

- Added JWT-based signup, login, and protected app routes.
- Added goal selection for Exercise / Bodybuilding, Acne Reduction / Skincare, and Focus / Studying.
- Added dynamic setup forms for each goal using frontend goal templates.
- Added rules-based daily task generation from saved goal settings.
- Added a dashboard with today's tasks grouped by goal and completion percentage.
- Added task check-off behavior with optimistic frontend updates.
- Added a progress page with simple goal summaries.
- Added profile/settings actions for logout and data reset.

### Technical Improvements

- Added MongoDB models for users, goals, tasks, and check-ins.
- Added bcrypt password hashing and JWT authentication middleware.
- Added backend validation for goal types, selected options, dates, and ObjectIds.
- Refactored goals into frontend templates and backend rule modules.
- Added stable generated task keys, task source tracking, task upserts, stale generated task cleanup, and task index syncing.
- Added frontend loading and error states for goal loading, task generation, task toggling, and profile reset.
- Added automated backend API tests with an in-memory MongoDB.
- Added automated frontend component tests with Vitest and Testing Library.

### Known Limitations

- No AI features are included in V1.
- Check-in APIs exist, but there is no check-in UI yet.
- Progress analytics are intentionally simple and task-completion based.
- JWTs are stored in `localStorage`; httpOnly cookies should be used before production hardening.
- Goal guidance is rules-based and not medical, dermatological, nutritional, or fitness advice.
- There is no password reset, email verification, or account deletion flow yet.
- There is no deployment configuration included yet.

### Next Planned Features

- Add a check-in UI for daily metrics and notes.
- Improve progress analytics with trends and streaks.
- Add password reset and stronger account settings.
- Add more goal templates after the V1 architecture settles.
- Add production deployment documentation.
- Move authentication storage from `localStorage` to httpOnly cookies.
