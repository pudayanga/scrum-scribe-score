export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      matches: {
        Row: {
          created_at: string
          half: number | null
          id: string
          match_time: number | null
          scheduled_date: string
          status: string | null
          team1_id: string
          team1_score: number | null
          team2_id: string
          team2_score: number | null
          tournament_id: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          half?: number | null
          id?: string
          match_time?: number | null
          scheduled_date: string
          status?: string | null
          team1_id: string
          team1_score?: number | null
          team2_id: string
          team2_score?: number | null
          tournament_id: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          half?: number | null
          id?: string
          match_time?: number | null
          scheduled_date?: string
          status?: string | null
          team1_id?: string
          team1_score?: number | null
          team2_id?: string
          team2_score?: number | null
          tournament_id?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      player_statistics: {
        Row: {
          conversions: number | null
          drop_goals: number | null
          id: string
          match_id: string
          penalties: number | null
          player_id: string
          total_points: number | null
          tries: number | null
        }
        Insert: {
          conversions?: number | null
          drop_goals?: number | null
          id?: string
          match_id: string
          penalties?: number | null
          player_id: string
          total_points?: number | null
          tries?: number | null
        }
        Update: {
          conversions?: number | null
          drop_goals?: number | null
          id?: string
          match_id?: string
          penalties?: number | null
          player_id?: string
          total_points?: number | null
          tries?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_statistics_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_statistics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_tracking: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          field_position: string | null
          id: string
          player_id: string
          points_h: number | null
          points_v: number | null
          team_id: string
          tracking_time: number
          updated_at: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          field_position?: string | null
          id?: string
          player_id: string
          points_h?: number | null
          points_v?: number | null
          team_id: string
          tracking_time: number
          updated_at?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          field_position?: string | null
          id?: string
          player_id?: string
          points_h?: number | null
          points_v?: number | null
          team_id?: string
          tracking_time?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_tracking_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_tracking_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          height: number | null
          id: string
          jersey_number: number
          name: string
          phone: string | null
          position: string | null
          team_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          height?: number | null
          id?: string
          jersey_number: number
          name: string
          phone?: string | null
          position?: string | null
          team_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          height?: number | null
          id?: string
          jersey_number?: number
          name?: string
          phone?: string | null
          position?: string | null
          team_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_events: {
        Row: {
          comment: string | null
          created_at: string
          event_type: string
          id: string
          match_id: string
          match_time: string
          player_id: string
          points: number
          team_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          event_type: string
          id?: string
          match_id: string
          match_time: string
          player_id: string
          points: number
          team_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          event_type?: string
          id?: string
          match_id?: string
          match_time?: string
          player_id?: string
          points?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scoring_events_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          coach_email: string | null
          created_at: string
          id: string
          logo: string | null
          name: string
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          coach_email?: string | null
          created_at?: string
          id?: string
          logo?: string | null
          name: string
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          coach_email?: string | null
          created_at?: string
          id?: string
          logo?: string | null
          name?: string
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
