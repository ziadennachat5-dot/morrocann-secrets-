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
          child_price: number | null;
          child_age_min: number | null;
          child_age_max: number | null;
          min_guests: number | null;
          deposit_amount: number;
          max_guests: number;
          start_time: string | null;
          meal_options: Json;
          why_love: Json;
          what_to_expect: Json | null;
          what_to_remember: Json | null;
          host_languages: Json | null;
          image_url: string;
          image_alt: Json | null;
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
          child_price?: number | null;
          child_age_min?: number | null;
          child_age_max?: number | null;
          min_guests?: number | null;
          deposit_amount?: number;
          max_guests: number;
          start_time?: string | null;
          meal_options?: Json;
          why_love?: Json;
          what_to_expect?: Json | null;
          what_to_remember?: Json | null;
          host_languages?: Json | null;
          image_url: string;
          image_alt?: Json | null;
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
          child_price?: number | null;
          child_age_min?: number | null;
          child_age_max?: number | null;
          min_guests?: number | null;
          deposit_amount?: number;
          max_guests?: number;
          start_time?: string | null;
          meal_options?: Json;
          why_love?: Json;
          what_to_expect?: Json | null;
          what_to_remember?: Json | null;
          host_languages?: Json | null;
          image_url?: string;
          image_alt?: Json | null;
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
          image_alt: Json | null;
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
          image_alt?: Json | null;
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
          image_alt?: Json | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          category: Json;
          question: Json;
          answer: Json;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: Json;
          question: Json;
          answer: Json;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: Json;
          question?: Json;
          answer?: Json;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          kind: "private_event" | "gift" | "partner";
          full_name: string;
          email: string;
          phone: string | null;
          organization: string | null;
          event_type: string | null;
          requested_date: string | null;
          guest_count: number | null;
          quantity: number | null;
          message: string;
          status: "new" | "contacted" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kind: "private_event" | "gift" | "partner";
          full_name: string;
          email: string;
          phone?: string | null;
          organization?: string | null;
          event_type?: string | null;
          requested_date?: string | null;
          guest_count?: number | null;
          quantity?: number | null;
          message: string;
          status?: "new" | "contacted" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kind?: "private_event" | "gift" | "partner";
          full_name?: string;
          email?: string;
          phone?: string | null;
          organization?: string | null;
          event_type?: string | null;
          requested_date?: string | null;
          guest_count?: number | null;
          quantity?: number | null;
          message?: string;
          status?: "new" | "contacted" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          slug: string;
          title: Json;
          summary: Json;
          body: Json;
          status: "draft" | "published";
          draft_note: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title: Json;
          summary: Json;
          body: Json;
          status?: "draft" | "published";
          draft_note?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: Json;
          summary?: Json;
          body?: Json;
          status?: "draft" | "published";
          draft_note?: string | null;
          published_at?: string | null;
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
          adults: number;
          children: number;
          infants: number;
          adult_unit_price: number;
          child_unit_price: number | null;
          meal_choice: string | null;
          start_time: string | null;
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
          adults?: number;
          children?: number;
          infants?: number;
          adult_unit_price?: number;
          child_unit_price?: number | null;
          meal_choice?: string | null;
          start_time?: string | null;
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
          adults?: number;
          children?: number;
          infants?: number;
          adult_unit_price?: number;
          child_unit_price?: number | null;
          meal_choice?: string | null;
          start_time?: string | null;
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
          booking_id: string | null;
          experience_id: string | null;
          author: string;
          origin: string;
          quote: Json;
          rating: number;
          approved: boolean;
          language: "en" | "fr" | "ar";
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          experience_id?: string | null;
          author: string;
          origin: string;
          quote: Json;
          rating?: number;
          approved?: boolean;
          language?: "en" | "fr" | "ar";
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          experience_id?: string | null;
          author?: string;
          origin?: string;
          quote?: Json;
          rating?: number;
          approved?: boolean;
          language?: "en" | "fr" | "ar";
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
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
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
      booking_internal_notes: {
        Row: {
          id: string;
          booking_id: string;
          admin_user_id: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          admin_user_id?: string;
          note: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          admin_user_id?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      booking_messages: {
        Row: {
          id: string;
          booking_id: string;
          admin_user_id: string;
          channel: "email" | "whatsapp" | "phone" | "other";
          direction: "inbound" | "outbound";
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          admin_user_id?: string;
          channel: "email" | "whatsapp" | "phone" | "other";
          direction: "inbound" | "outbound";
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          admin_user_id?: string;
          channel?: "email" | "whatsapp" | "phone" | "other";
          direction?: "inbound" | "outbound";
          message?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      booking_email_jobs: {
        Row: {
          id: string;
          booking_id: string;
          kind:
            | "booking_received"
            | "booking_confirmed"
            | "booking_reminder"
            | "booking_cancelled"
            | "review_request";
          scheduled_at: string;
          status: "pending" | "processing" | "sent" | "logged" | "failed";
          attempts: number;
          last_error: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          kind:
            | "booking_received"
            | "booking_confirmed"
            | "booking_reminder"
            | "booking_cancelled"
            | "review_request";
          scheduled_at?: string;
          status?: "pending" | "processing" | "sent" | "logged" | "failed";
          attempts?: number;
          last_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          kind?:
            | "booking_received"
            | "booking_confirmed"
            | "booking_reminder"
            | "booking_cancelled"
            | "review_request";
          scheduled_at?: string;
          status?: "pending" | "processing" | "sent" | "logged" | "failed";
          attempts?: number;
          last_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guest_photos: {
        Row: {
          id: string;
          source_file: string | null;
          storage_path: string;
          renditions: Json;
          alt: Json;
          sort_order: number;
          guest_consent_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_file?: string | null;
          storage_path: string;
          renditions?: Json;
          alt?: Json;
          sort_order: number;
          guest_consent_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_file?: string | null;
          storage_path?: string;
          renditions?: Json;
          alt?: Json;
          sort_order?: number;
          guest_consent_confirmed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          language: "en" | "fr" | "ar";
          status: "pending" | "confirmed" | "unsubscribed";
          confirmation_token_hash: string | null;
          confirmation_expires_at: string | null;
          consented_at: string;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          language: "en" | "fr" | "ar";
          status?: "pending" | "confirmed" | "unsubscribed";
          confirmation_token_hash?: string | null;
          confirmation_expires_at?: string | null;
          consented_at?: string;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          language?: "en" | "fr" | "ar";
          status?: "pending" | "confirmed" | "unsubscribed";
          confirmation_token_hash?: string | null;
          confirmation_expires_at?: string | null;
          consented_at?: string;
          confirmed_at?: string | null;
          created_at?: string;
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
      admin_set_booking_status: {
        Args: { p_booking_id: string; p_status: string };
        Returns: boolean;
      };
      claim_booking_email_jobs: {
        Args: { p_batch_size?: number };
        Returns: Database["public"]["Tables"]["booking_email_jobs"]["Row"][];
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
      consume_public_form_rate_limit: {
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
