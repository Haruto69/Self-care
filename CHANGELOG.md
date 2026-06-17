# Changelog

All notable changes to this project will be documented in this file.

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
