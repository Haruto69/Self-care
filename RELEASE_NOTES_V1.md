# Self-care V1.0.0

Release date: 2026-06-17

Self-care V1.0.0 is the first complete release of the MERN self-care app. It helps users choose personal improvement goals, answer setup questions, generate daily tasks, and track completion from a clean dashboard.

## Highlights

- User signup and login with JWT authentication.
- Three V1 goal areas:
  - Exercise / Bodybuilding
  - Acne Reduction / Skincare
  - Focus / Studying
- Dynamic goal setup forms powered by frontend goal templates.
- Rules-based daily task generation from saved setup answers.
- Dashboard with tasks grouped by goal and completion percentage.
- Checkable daily tasks with optimistic UI updates.
- Progress summaries for active goals.
- Profile/settings page with logout and data reset.

## Technical Notes

- Backend built with Node.js, Express, MongoDB, and Mongoose.
- Passwords are hashed with bcrypt.
- Goal validation and task generation are now template/rule driven.
- Generated tasks use stable task keys to avoid duplicates.
- Stale generated tasks are cleaned when goal settings change.
- Automated tests were added for backend API behavior and frontend task/setup flows.

## Known Limitations

- No AI-powered recommendations yet.
- Check-in endpoints exist, but V1 does not include a check-in UI.
- Analytics are intentionally lightweight.
- JWT is currently stored in `localStorage`.
- The app is for habit support only and does not provide medical or professional advice.

## What's Next

- Check-in UI for daily metrics.
- Better progress trends and streaks.
- More goal templates.
- Password reset and account management improvements.
- Production deployment guide.
- Authentication hardening with httpOnly cookies.
