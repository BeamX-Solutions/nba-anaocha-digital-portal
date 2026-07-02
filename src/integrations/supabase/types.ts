export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          portal: string
          published: boolean | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          portal?: string
          published?: boolean | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          portal?: string
          published?: boolean | null
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          read: boolean
          replied_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          read?: boolean
          replied_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          read?: boolean
          replied_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      dues_items: {
        Row: {
          amount_0_4: number | null
          amount_10_14: number | null
          amount_15_plus: number | null
          amount_5_9: number | null
          amount_san: number | null
          category: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          flat_amount: number | null
          id: string
          is_active: boolean
          is_tiered: boolean
          requires_upload: boolean
          title: string
          upload_label: string | null
          year: number
        }
        Insert: {
          amount_0_4?: number | null
          amount_10_14?: number | null
          amount_15_plus?: number | null
          amount_5_9?: number | null
          amount_san?: number | null
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          flat_amount?: number | null
          id?: string
          is_active?: boolean
          is_tiered?: boolean
          requires_upload?: boolean
          title: string
          upload_label?: string | null
          year: number
        }
        Update: {
          amount_0_4?: number | null
          amount_10_14?: number | null
          amount_15_plus?: number | null
          amount_5_9?: number | null
          amount_san?: number | null
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          flat_amount?: number | null
          id?: string
          is_active?: boolean
          is_tiered?: boolean
          requires_upload?: boolean
          title?: string
          upload_label?: string | null
          year?: number
        }
        Relationships: []
      }
      dues_payments: {
        Row: {
          amount: number | null
          created_at: string
          dues_item_id: string
          id: string
          paid_at: string | null
          receipt_url: string | null
          reference: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          dues_item_id: string
          id?: string
          paid_at?: string | null
          receipt_url?: string | null
          reference?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          dues_item_id?: string
          id?: string
          paid_at?: string | null
          receipt_url?: string | null
          reference?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dues_payments_dues_item_id_fkey"
            columns: ["dues_item_id"]
            isOneToOne: false
            referencedRelation: "dues_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          channel: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          reference: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          channel?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          reference: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          channel?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          reference?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          category: string
          committee: string | null
          created_at: string
          display_order: number
          id: string
          name: string
          photo_url: string | null
          position: string
          updated_at: string
        }
        Insert: {
          category?: string
          committee?: string | null
          created_at?: string
          display_order?: number
          id?: string
          name: string
          photo_url?: string | null
          position: string
          updated_at?: string
        }
        Update: {
          category?: string
          committee?: string | null
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          photo_url?: string | null
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_change_requests: {
        Row: {
          changes: Json
          created_at: string
          id: string
          previous: Json
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          changes: Json
          created_at?: string
          id?: string
          previous?: Json
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          changes?: Json
          created_at?: string
          id?: string
          previous?: Json
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_admin: boolean
          lbian: string | null
          lbian_public: boolean
          middle_name: string | null
          office_address: string | null
          phone: string | null
          portal_access: string
          rank: string
          scn: string | null
          show_email: boolean | null
          show_office_address: boolean | null
          show_phone: boolean | null
          status: string
          surname: string | null
          updated_at: string
          user_id: string
          year_of_call: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean
          lbian?: string | null
          lbian_public?: boolean
          middle_name?: string | null
          office_address?: string | null
          phone?: string | null
          portal_access?: string
          rank?: string
          scn?: string | null
          show_email?: boolean | null
          show_office_address?: boolean | null
          show_phone?: boolean | null
          status?: string
          surname?: string | null
          updated_at?: string
          user_id: string
          year_of_call?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_admin?: boolean
          lbian?: string | null
          lbian_public?: boolean
          middle_name?: string | null
          office_address?: string | null
          phone?: string | null
          portal_access?: string
          rank?: string
          scn?: string | null
          show_email?: boolean | null
          show_office_address?: boolean | null
          show_phone?: boolean | null
          status?: string
          surname?: string | null
          updated_at?: string
          user_id?: string
          year_of_call?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_url: string | null
          id: string
          portal: string
          title: string
          type: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          portal?: string
          title: string
          type?: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          portal?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      service_applications: {
        Row: {
          created_at: string
          file_urls: string[] | null
          form_data: Json
          id: string
          payment_reference: string | null
          payment_status: string
          rejection_reason: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_urls?: string[] | null
          form_data?: Json
          id?: string
          payment_reference?: string | null
          payment_status?: string
          rejection_reason?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_urls?: string[] | null
          form_data?: Json
          id?: string
          payment_reference?: string | null
          payment_status?: string
          rejection_reason?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
