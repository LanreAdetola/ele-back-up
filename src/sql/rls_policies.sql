-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create new policies
CREATE POLICY "Public can view products" ON products
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Admins can insert products" ON products
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;

-- Allow public access to read product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow admins to upload product images
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);

-- Allow admins to update/delete their uploaded images
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' AND
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' AND
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can check their own admin status" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;

-- Drop and recreate admin_users table with proper constraints
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create policies for admin_users
CREATE POLICY "Users can check their own admin status" ON admin_users
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage admin users" ON admin_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Note: You'll need to manually insert your user ID as admin
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- You can find your user ID in the Supabase dashboard under Authentication > Users
-- Example:
-- INSERT INTO admin_users (user_id) VALUES ('your-user-id-here');

-- Insert current user as admin if not exists
INSERT INTO admin_users (user_id)
SELECT auth.uid()
WHERE NOT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
); 