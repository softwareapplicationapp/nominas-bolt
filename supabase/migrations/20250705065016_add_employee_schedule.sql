/*
  # Add Employee Schedule Fields

  This migration adds weekly_hours and working_days to employees table.
  weekly_hours stores the expected number of hours per week.
  working_days is a text[] with the days of the week the employee works.
*/

-- +goose Up
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS weekly_hours NUMERIC(5,2) DEFAULT 40,
  ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday'];

-- +goose Down
ALTER TABLE employees
  DROP COLUMN IF EXISTS weekly_hours,
  DROP COLUMN IF EXISTS working_days;
