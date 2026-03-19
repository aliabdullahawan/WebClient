-- ============================================================
-- ADMIN PASSWORD FIX
-- PostgreSQL crypt() hash != bcryptjs hash format
-- This sets the correct bcryptjs-compatible hash
-- ============================================================

-- Fix admin password (Admin@123)
UPDATE admins 
SET password_hash = '$2b$12$yB2LC44QU6bm1iEML2QYFuIrbOfwcq48NNQh31omcjOwQVqoE/97m',
    updated_at = NOW()
WHERE email = 'amnamubeen516@gmail.com';

-- Verify it was updated
SELECT id, email, full_name, 
       LEFT(password_hash, 7) AS hash_prefix,
       updated_at
FROM admins 
WHERE email = 'amnamubeen516@gmail.com';
