-- ============================================
-- TEMPORARILY DISABLE RLS FOR TESTING
-- This will help us identify if RLS is the problem
-- ============================================

-- Disable RLS on all tables temporarily
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_status DISABLE ROW LEVEL SECURITY;

-- ============================================
-- IMPORTANT: This is for testing only!
-- After confirming it works, you should re-enable RLS
-- and create proper policies
-- ============================================

-- To re-enable later, run:
-- ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE room_status ENABLE ROW LEVEL SECURITY;
