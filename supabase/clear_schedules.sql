-- Clear all study schedules for testing
-- Run this to clean up duplicate programs

DELETE FROM schedules WHERE type = 'study';
