/*
  # Add Comments to Leave Requests

  1. Changes
    - Add `admin_comments` column to leave_requests table
    - This will store optional comments from managers when approving/rejecting leave requests

  2. Security
    - No changes to RLS policies needed
    - Comments will be visible to the employee who requested the leave
*/

-- Add admin_comments column to leave_requests table
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- Add index for better performance when querying leave requests with comments
CREATE INDEX IF NOT EXISTS idx_leave_requests_admin_comments ON leave_requests(admin_comments) WHERE admin_comments IS NOT NULL;