-- KicksFolio Supabase Schema
-- Migrated from Rails backend

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE public.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    sneaker_size DECIMAL(3,1) NOT NULL CHECK (sneaker_size >= 7 AND sneaker_size <= 16 AND MOD((sneaker_size * 2)::INTEGER, 1) = 0),
    profile_picture VARCHAR(500),
    reset_password_token VARCHAR(255) UNIQUE,
    reset_password_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE public.collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sneakers table
CREATE TABLE public.sneakers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    size DECIMAL(3,1) NOT NULL,
    purchase_date DATE,
    price_paid DECIMAL(10,2),
    condition INTEGER NOT NULL CHECK (condition >= 1 AND condition <= 5),
    estimated_value DECIMAL(10,2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'rocking' NOT NULL,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships table
CREATE TABLE public.friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Create indexes for better performance
CREATE INDEX ON public.users(email);
CREATE INDEX ON public.users(username);
CREATE INDEX ON public.collections(user_id);
CREATE INDEX ON public.sneakers(collection_id);
CREATE INDEX ON public.friendships(user_id);
CREATE INDEX ON public.friendships(friend_id);
CREATE INDEX ON public.friendships(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sneakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for collections
CREATE POLICY "Users can view their own collections" ON public.collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" ON public.collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON public.collections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON public.collections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sneakers
CREATE POLICY "Users can view sneakers in their collections" ON public.sneakers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.collections WHERE id = collection_id
        )
    );

CREATE POLICY "Users can insert sneakers in their collections" ON public.sneakers
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.collections WHERE id = collection_id
        )
    );

CREATE POLICY "Users can update sneakers in their collections" ON public.sneakers
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.collections WHERE id = collection_id
        )
    );

CREATE POLICY "Users can delete sneakers in their collections" ON public.sneakers
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.collections WHERE id = collection_id
        )
    );

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sneakers_updated_at BEFORE UPDATE ON public.sneakers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('sneakers', 'sneakers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload sneaker images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'sneakers' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view all sneaker images" ON storage.objects
    FOR SELECT USING (bucket_id = 'sneakers');

CREATE POLICY "Users can update their own sneaker images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'sneakers' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profiles' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view all profile images" ON storage.objects
    FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Users can update their own profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profiles' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    ); 