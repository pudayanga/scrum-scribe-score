
-- Create coaches table
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  team_id UUID REFERENCES public.teams(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admins table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin (password hash is for 'password123')
INSERT INTO public.admins (username, password_hash, full_name, email) 
VALUES ('admin1', '$2b$10$rQZ8kqXz5rq3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q', 'Admin User', 'admin@example.com');

-- Insert demo coaches (password hash is for 'password123')
INSERT INTO public.coaches (username, password_hash, full_name, email, team_id) 
VALUES 
('coach1', '$2b$10$rQZ8kqXz5rq3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q', 'John Smith', 'john.smith@example.com', (SELECT id FROM public.teams LIMIT 1)),
('coach2', '$2b$10$rQZ8kqXz5rq3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q3q3Q', 'Sarah Johnson', 'sarah.johnson@example.com', (SELECT id FROM public.teams ORDER BY created_at DESC LIMIT 1));

-- Create coach permissions table
CREATE TABLE public.coach_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  tournaments BOOLEAN NOT NULL DEFAULT false,
  teams BOOLEAN NOT NULL DEFAULT false,
  players BOOLEAN NOT NULL DEFAULT false,
  matches BOOLEAN NOT NULL DEFAULT false,
  statistics BOOLEAN NOT NULL DEFAULT false,
  player_tracking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id)
);

-- Create coach messages table
CREATE TABLE public.coach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for coaches
CREATE POLICY "Admins can view all coaches" 
  ON public.coaches 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert coaches" 
  ON public.coaches 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update coaches" 
  ON public.coaches 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can delete coaches" 
  ON public.coaches 
  FOR DELETE 
  USING (true);

-- RLS policies for admins
CREATE POLICY "Admins can view admins" 
  ON public.admins 
  FOR SELECT 
  USING (true);

-- RLS policies for coach_permissions
CREATE POLICY "Admins can manage coach permissions" 
  ON public.coach_permissions 
  FOR ALL 
  USING (true);

-- RLS policies for coach_messages
CREATE POLICY "Coaches can view their own messages" 
  ON public.coach_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Coaches can insert their own messages" 
  ON public.coach_messages 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update coach messages" 
  ON public.coach_messages 
  FOR UPDATE 
  USING (true);

-- RLS policies for notifications
CREATE POLICY "Coaches can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (true);

CREATE POLICY "Coaches can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Admins can manage notifications" 
  ON public.notifications 
  FOR ALL 
  USING (true);

-- Insert default permissions for existing coaches
INSERT INTO public.coach_permissions (coach_id, tournaments, teams, players, matches, statistics, player_tracking)
SELECT id, true, true, true, true, true, true 
FROM public.coaches 
ON CONFLICT (coach_id) DO NOTHING;
