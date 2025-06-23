
-- Add coach_id to players table to link players to specific coaches
ALTER TABLE public.players ADD COLUMN coach_id uuid REFERENCES public.coaches(id);

-- Add coach_id to teams table to link teams to specific coaches  
ALTER TABLE public.teams ADD COLUMN coach_id uuid REFERENCES public.coaches(id);

-- Add coach_id to tournaments table to link tournaments to specific coaches
ALTER TABLE public.tournaments ADD COLUMN coach_id uuid REFERENCES public.coaches(id);

-- Add coach_id to matches table to link matches to specific coaches
ALTER TABLE public.matches ADD COLUMN coach_id uuid REFERENCES public.matches(id);

-- Update existing data to link with coaches (this assumes you have existing coach data)
-- You may need to adjust these based on your existing data structure
UPDATE public.players SET coach_id = (
  SELECT c.id FROM public.coaches c 
  JOIN public.teams t ON c.team_id = t.id 
  WHERE t.id = players.team_id 
  LIMIT 1
) WHERE coach_id IS NULL;

UPDATE public.teams SET coach_id = (
  SELECT id FROM public.coaches WHERE team_id = teams.id LIMIT 1
) WHERE coach_id IS NULL;

-- For tournaments and matches, you'll need to set these based on your business logic
-- This is a placeholder - adjust based on how you want to assign existing data
UPDATE public.tournaments SET coach_id = (
  SELECT id FROM public.coaches LIMIT 1
) WHERE coach_id IS NULL;

UPDATE public.matches SET coach_id = (
  SELECT id FROM public.coaches LIMIT 1  
) WHERE coach_id IS NULL;
