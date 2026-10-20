export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "superadmin";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "superadmin";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "superadmin";
          created_at?: string;
        };
        Relationships: [];
      };
      experiences: {
        Row: {
          id: string;
          title: Json;
          blurb: Json;
          duration: Json;
          price: number;
          deposit_amount: number;
          max_guests: number;
          image_url: string;
          included: Json;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: Json;
          blurb: Json;
          duration: Json;
          price: number;
          deposit_amount?: number;
          max_guests: number;
          image_url: string;
          included?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: Json;
          blurb?: Json;
          duration?: Json;
          price?: number;
          deposit_amount?: number;
          max_guests?: number;
          image_url?: string;
          included?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      host_families: {
        Row: {
          id: string;
          name: Json;
          area: Json;
          languages: Json;
          signature_dish: Json;
          story: Json;
          address: string | null;
          image_url: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: Json;
          area: Json;
          languages: Json;
          signature_dish: Json;
          story: Json;
          address?: string | null;
          image_url: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: Json;
          area?: Json;
          languages?: Json;
          signature_dish?: Json;
          story?: Json;
          address?: string | null;
          image_url?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability: {
        Row: {
          id: string;
          date: string;
          experience_id: string;
          capacity: number;
          booked_count: number;
          status: "available" | "booked" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          experience_id: string;
          capacity: number;
          booked_count?: number;
          status?: "available" | "booked" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          experience_id?: string;
          capacity?: number;
          booked_count?: number;
          status?: "available" | "booked" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          experience_id: string;
          date: string;
          guests: number;
          dietary_needs: string | null;
          message: string | null;
          status: "pending" | "confirmed" | "cancelled";
          payment_method: "arrival" | "deposit" | "card";
          deposit_paid: number;
          total_price: number;
          language: "en" | "fr" | "ar";
          special_occasion: string | null;
          private_group: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          experience_id: string;
          date: string;
          guests: number;
          dietary_needs?: string | null;
          message?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          payment_method?: "arrival" | "deposit" | "card";
          deposit_paid?: number;
          total_price?: number;
          language?: "en" | "fr" | "ar";
          special_occasion?: string | null;
          private_group?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          experience_id?: string;
          date?: string;
          guests?: number;
          dietary_needs?: string | null;
          message?: string | null;
          status?: "pending" | "confirmed" | "cancelled";
          payment_method?: "arrival" | "deposit" | "card";
          deposit_paid?: number;
          total_price?: number;
          language?: "en" | "fr" | "ar";
          special_occasion?: string | null;
          private_group?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          experience_id: string | null;
          author: string;
          origin: string;
          quote: Json;
          rating: number;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          experience_id?: string | null;
          author: string;
          origin: string;
          quote: Json;
          rating?: number;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          experience_id?: string | null;
          author?: string;
          origin?: string;
          quote?: Json;
          rating?: number;
          approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_experience_id_fkey";
            columns: ["experience_id"];
            isOneToOne: false;
            referencedRelation: "experiences";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          setting_key: string;
          value: Json;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          setting_key: string;
          value?: Json;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          setting_key?: string;
          value?: Json;
          is_public?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      book_experience_atomic: {
        Args: {
          p_name: string;
          p_email: string;
          p_phone: string;
          p_experience_id: string;
          p_date: string;
          p_guests: number;
          p_dietary_needs?: string | null;
          p_message?: string | null;
          p_language?: string;
          p_payment_method?: string;
          p_deposit_paid?: number;
          p_special_occasion?: string | null;
          p_private_group?: boolean;
        };
        Returns: Json;
      };
      consume_booking_rate_limit: {
        Args: { p_ip_hash: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
