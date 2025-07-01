-- +goose Up
ALTER TABLE attendance
  DROP CONSTRAINT IF EXISTS attendance_employee_id_date_key;

-- +goose Down
ALTER TABLE attendance
  ADD CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date);