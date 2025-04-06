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
      api_keys: {
        Row: {
          active: boolean | null
          api_key: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          api_key?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          company: string | null
          confidence_score: number | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string | null
          github_url: string | null
          id: string
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          phone: string | null
          position: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          confidence_score?: number | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          position?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          confidence_score?: number | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          phone?: string | null
          position?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enrichment_requests: {
        Row: {
          credits_used: number | null
          email_queried: string | null
          id: string
          result_id: string | null
          status: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          credits_used?: number | null
          email_queried?: string | null
          id?: string
          result_id?: string | null
          status?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          credits_used?: number | null
          email_queried?: string | null
          id?: string
          result_id?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrichment_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enrichment_results: {
        Row: {
          company: string | null
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          last_updated: string | null
          linkedin_url: string | null
          location: string | null
          twitter_url: string | null
        }
        Insert: {
          company?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_updated?: string | null
          linkedin_url?: string | null
          location?: string | null
          twitter_url?: string | null
        }
        Update: {
          company?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_updated?: string | null
          linkedin_url?: string | null
          location?: string | null
          twitter_url?: string | null
        }
        Relationships: []
      }
      lookup_history: {
        Row: {
          contact_id: string | null
          email_queried: string
          id: string
          search_timestamp: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          email_queried: string
          id?: string
          search_timestamp?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          email_queried?: string
          id?: string
          search_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lookup_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          id: string
          monthly_credits: number | null
          monthly_price: number | null
          name: string
          overage_price: number | null
        }
        Insert: {
          id?: string
          monthly_credits?: number | null
          monthly_price?: number | null
          name: string
          overage_price?: number | null
        }
        Update: {
          id?: string
          monthly_credits?: number | null
          monthly_price?: number | null
          name?: string
          overage_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          created_at: string
          id: string
          is_complete: boolean | null
          task: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_complete?: boolean | null
          task: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_complete?: boolean | null
          task?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company: string | null
          created_at: string | null
          credits_remaining: number | null
          email: string | null
          id: string
          name: string
          password_hash: string | null
          plan_id: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          credits_remaining?: number | null
          email?: string | null
          id?: string
          name: string
          password_hash?: string | null
          plan_id?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          credits_remaining?: number | null
          email?: string | null
          id?: string
          name?: string
          password_hash?: string | null
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_contact: {
        Args: {
          p_email: string
          p_search_info?: Json
        }
        Returns: string
      }
      log_contact_lookup: {
        Args: {
          p_user_id: string
          p_email: string
          p_contact_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
