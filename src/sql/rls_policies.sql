-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products can be inserted by admin" ON products;
DROP POLICY IF EXISTS "Products can be updated by admin" ON products;
DROP POLICY IF EXISTS "Products can be deleted by admin" ON products;

-- Create policies
-- Policy for reading products (public access)
CREATE POLICY "Products are viewable by everyone" ON products
FOR SELECT USING (true);

-- Policy for inserting products (admin only)
CREATE POLICY "Products can be inserted by admin" ON products
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);

-- Policy for updating products (admin only)
CREATE POLICY "Products can be updated by admin" ON products
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);

-- Policy for deleting products (admin only)
CREATE POLICY "Products can be deleted by admin" ON products
FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin_users table
CREATE POLICY "Admin users are viewable by admins" ON admin_users
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
); 