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
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          file_id: string | null
          id: string
          metadata: Json | null
          payment_link_id: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          file_id?: string | null
          id?: string
          metadata?: Json | null
          payment_link_id?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          file_id?: string | null
          id?: string
          metadata?: Json | null
          payment_link_id?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string
        }
        Update: {
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      currency_settings: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          is_default: boolean
          is_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency_code: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          is_default?: boolean
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          access_duration: number
          created_at: string
          description: string | null
          device_restrictions: boolean
          download_limit: number
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_active: boolean
          mime_type: string | null
          original_filename: string | null
          password_protection: string | null
          preview_path: string | null
          price: number
          title: string
          total_downloads: number
          total_revenue: number
          updated_at: string
          user_id: string
          watermark_config: Json | null
          watermark_enabled: boolean
          watermark_path: string | null
        }
        Insert: {
          access_duration?: number
          created_at?: string
          description?: string | null
          device_restrictions?: boolean
          download_limit?: number
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_active?: boolean
          mime_type?: string | null
          original_filename?: string | null
          password_protection?: string | null
          preview_path?: string | null
          price?: number
          title: string
          total_downloads?: number
          total_revenue?: number
          updated_at?: string
          user_id: string
          watermark_config?: Json | null
          watermark_enabled?: boolean
          watermark_path?: string | null
        }
        Update: {
          access_duration?: number
          created_at?: string
          description?: string | null
          device_restrictions?: boolean
          download_limit?: number
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_active?: boolean
          mime_type?: string | null
          original_filename?: string | null
          password_protection?: string | null
          preview_path?: string | null
          price?: number
          title?: string
          total_downloads?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string
          watermark_config?: Json | null
          watermark_enabled?: boolean
          watermark_path?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_links: {
        Row: {
          created_at: string
          current_downloads: number
          custom_message: string | null
          custom_price: number | null
          expires_at: string | null
          file_id: string
          id: string
          is_active: boolean
          link_code: string
          max_downloads: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_downloads?: number
          custom_message?: string | null
          custom_price?: number | null
          expires_at?: string | null
          file_id: string
          id?: string
          is_active?: boolean
          link_code: string
          max_downloads?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_downloads?: number
          custom_message?: string | null
          custom_price?: number | null
          expires_at?: string | null
          file_id?: string
          id?: string
          is_active?: boolean
          link_code?: string
          max_downloads?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_configurations: {
        Row: {
          account_details: Json
          created_at: string
          currency_code: string
          id: string
          is_active: boolean
          is_verified: boolean
          minimum_payout_amount: number
          payout_method: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_details?: Json
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          minimum_payout_amount?: number
          payout_method: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_details?: Json
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          minimum_payout_amount?: number
          payout_method?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          external_payout_id: string | null
          failure_reason: string | null
          fee_amount: number
          id: string
          net_amount: number
          payout_configuration_id: string
          processed_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string
          external_payout_id?: string | null
          failure_reason?: string | null
          fee_amount?: number
          id?: string
          net_amount: number
          payout_configuration_id: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          external_payout_id?: string | null
          failure_reason?: string | null
          fee_amount?: number
          id?: string
          net_amount?: number
          payout_configuration_id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_payout_configuration_id_fkey"
            columns: ["payout_configuration_id"]
            isOneToOne: false
            referencedRelation: "payout_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          notification_preferences: Json
          plan_type: string | null
          security_settings: Json
          subscription_status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          notification_preferences?: Json
          plan_type?: string | null
          security_settings?: Json
          subscription_status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          notification_preferences?: Json
          plan_type?: string | null
          security_settings?: Json
          subscription_status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          expires_at: string
          flutterwave_subscription_id: string | null
          flutterwave_tx_ref: string
          id: string
          plan_type: string
          starts_at: string
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          expires_at: string
          flutterwave_subscription_id?: string | null
          flutterwave_tx_ref: string
          id?: string
          plan_type: string
          starts_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          expires_at?: string
          flutterwave_subscription_id?: string | null
          flutterwave_tx_ref?: string
          id?: string
          plan_type?: string
          starts_at?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          email: string
          full_name: string | null
          id: string
          invited_at: string
          role: string
          status: string
          team_owner_id: string
        }
        Insert: {
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string
          role: string
          status?: string
          team_owner_id: string
        }
        Update: {
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string
          role?: string
          status?: string
          team_owner_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          converted_amount: number | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          exchange_rate: number | null
          fee_amount: number | null
          file_id: string
          flutterwave_tx_id: string | null
          flutterwave_tx_ref: string
          id: string
          net_amount: number | null
          original_currency: string | null
          payment_link_id: string
          payment_method: string | null
          plan_fee_rate: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          converted_amount?: number | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          exchange_rate?: number | null
          fee_amount?: number | null
          file_id: string
          flutterwave_tx_id?: string | null
          flutterwave_tx_ref: string
          id?: string
          net_amount?: number | null
          original_currency?: string | null
          payment_link_id: string
          payment_method?: string | null
          plan_fee_rate?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          converted_amount?: number | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          exchange_rate?: number | null
          fee_amount?: number | null
          file_id?: string
          flutterwave_tx_id?: string | null
          flutterwave_tx_ref?: string
          id?: string
          net_amount?: number | null
          original_currency?: string | null
          payment_link_id?: string
          payment_method?: string | null
          plan_fee_rate?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_link_id_fkey"
            columns: ["payment_link_id"]
            isOneToOne: false
            referencedRelation: "payment_links"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_upload_file: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      get_plan_limits: {
        Args: { plan: string }
        Returns: Json
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
