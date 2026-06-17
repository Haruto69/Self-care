import { getWeekNumber } from "../utils/dateUtils.js";

export const numberFrom = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const sessionMinutes = (value = "25 min") => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? 25 : parsed;
};

export const yes = (value) => String(value || "").toLowerCase() === "yes";

export const weeklyPillowcaseDue = (frequency, date) => {
  const day = date.getDay();
  const week = getWeekNumber(date);

  if (frequency === "Weekly") return day === 1;
  if (frequency === "Every 2 weeks") return day === 1 && week % 2 === 0;
  if (frequency === "Monthly") return date.getDate() === 1;
  return date.getDate() === 1;
};
