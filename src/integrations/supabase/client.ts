// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qrbymkundamindyychzl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyYnlta3VuZGFtaW5keXljaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDAxNzMsImV4cCI6MjA2NDM3NjE3M30.FG7iRYO4joyMXFXIhT5-J9OBLP099S-f0eHyB_tD748";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);