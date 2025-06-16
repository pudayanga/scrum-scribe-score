
-- Create player_tracking table for tracking player actions (without video_file_name)
CREATE TABLE public.player_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) NOT NULL,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  tracking_time DECIMAL(10,2) NOT NULL, -- Time in seconds with decimals
  action TEXT NOT NULL,
  description TEXT,
  field_position TEXT,
  points_h DECIMAL(5,2), -- Horizontal position
  points_v DECIMAL(5,2), -- Vertical position
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on player_tracking table
ALTER TABLE public.player_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for player_tracking table
CREATE POLICY "All users can manage tracking data" ON public.player_tracking
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_player_tracking_team_id ON public.player_tracking(team_id);
CREATE INDEX idx_player_tracking_player_id ON public.player_tracking(player_id);
CREATE INDEX idx_player_tracking_created_at ON public.player_tracking(created_at DESC);

-- Add missing columns to players table for better player management
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS phone TEXT;
