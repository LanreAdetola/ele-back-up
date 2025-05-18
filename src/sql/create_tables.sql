-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
-- Products table policies
CREATE POLICY "Products are viewable by everyone" ON products
FOR SELECT USING (true);

CREATE POLICY "Products can be inserted by admin" ON products
FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Products can be updated by admin" ON products
FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Products can be deleted by admin" ON products
FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Admin users table policies
CREATE POLICY "Users can check their own admin status" ON admin_users
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage admin users" ON admin_users
FOR ALL USING (auth.role() = 'service_role');

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Admin Upload Access" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'products' AND
    auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Admin Update Access" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'products' AND
    auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Admin Delete Access" ON storage.objects
FOR DELETE USING (
    bucket_id = 'products' AND
    auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Insert your user as admin
INSERT INTO admin_users (user_id)
VALUES ('3d249e95-6d2c-4eaf-8512-55a989a6a361')
ON CONFLICT (user_id) DO NOTHING; 