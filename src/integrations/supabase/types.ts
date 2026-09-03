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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      crisis_events: {
        Row: {
          id: string
          journal_id: string | null
          signal_score: number
          surfaced_at: string
          threshold: number
          trusted_notified: boolean
          user_action: string | null
          user_action_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          journal_id?: string | null
          signal_score: number
          surfaced_at?: string
          threshold: number
          trusted_notified?: boolean
          user_action?: string | null
          user_action_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          journal_id?: string | null
          signal_score?: number
          surfaced_at?: string
          threshold?: number
          trusted_notified?: boolean
          user_action?: string | null
          user_action_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_events_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
        ]
      }
      disclaimer_acceptances: {
        Row: {
          accepted_at: string
          disclaimer_version: string
          feature_key: string
          id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          disclaimer_version: string
          feature_key: string
          id?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          disclaimer_version?: string
          feature_key?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          config: Json | null
          enabled: boolean
          key: string
          min_tier: string
          rollout_percent: number
          updated_at: string
        }
        Insert: {
          config?: Json | null
          enabled?: boolean
          key: string
          min_tier?: string
          rollout_percent?: number
          updated_at?: string
        }
        Update: {
          config?: Json | null
          enabled?: boolean
          key?: string
          min_tier?: string
          rollout_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_analysis: {
        Row: {
          clarity_insight: string | null
          clarity_score: number | null
          cognitive_patterns: Json | null
          context_signals: Json | null
          created_at: string
          crisis_signal: number | null
          crisis_signal_threshold_breached: boolean | null
          distortions_or_biases: Json | null
          emotional_state: string | null
          id: string
          intensity_score: number | null
          is_encrypted: boolean
          is_voice_entry: boolean
          journal_id: string
          key_thoughts: Json | null
          reflection_mode: string | null
          suggested_reflection: string | null
          summary: string | null
          user_id: string
          voice_hesitation_ratio: number | null
          voice_pace_wpm: number | null
          voice_tonal_variability_hz: number | null
        }
        Insert: {
          clarity_insight?: string | null
          clarity_score?: number | null
          cognitive_patterns?: Json | null
          context_signals?: Json | null
          created_at?: string
          crisis_signal?: number | null
          crisis_signal_threshold_breached?: boolean | null
          distortions_or_biases?: Json | null
          emotional_state?: string | null
          id?: string
          intensity_score?: number | null
          is_encrypted?: boolean
          is_voice_entry?: boolean
          journal_id: string
          key_thoughts?: Json | null
          reflection_mode?: string | null
          suggested_reflection?: string | null
          summary?: string | null
          user_id: string
          voice_hesitation_ratio?: number | null
          voice_pace_wpm?: number | null
          voice_tonal_variability_hz?: number | null
        }
        Update: {
          clarity_insight?: string | null
          clarity_score?: number | null
          cognitive_patterns?: Json | null
          context_signals?: Json | null
          created_at?: string
          crisis_signal?: number | null
          crisis_signal_threshold_breached?: boolean | null
          distortions_or_biases?: Json | null
          emotional_state?: string | null
          id?: string
          intensity_score?: number | null
          is_encrypted?: boolean
          is_voice_entry?: boolean
          journal_id?: string
          key_thoughts?: Json | null
          reflection_mode?: string | null
          suggested_reflection?: string | null
          summary?: string | null
          user_id?: string
          voice_hesitation_ratio?: number | null
          voice_pace_wpm?: number | null
          voice_tonal_variability_hz?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_analysis_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: true
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          ciphertext: string | null
          content: string | null
          created_at: string
          id: string
          is_encrypted: boolean
          user_id: string
        }
        Insert: {
          ciphertext?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          user_id: string
        }
        Update: {
          ciphertext?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          user_id?: string
        }
        Relationships: []
      }
      mentor_personas: {
        Row: {
          compatible_modes: string[]
          display_order: number
          is_curated: boolean
          key: string
          name: string
          voice_block: string
        }
        Insert: {
          compatible_modes?: string[]
          display_order?: number
          is_curated?: boolean
          key: string
          name: string
          voice_block: string
        }
        Update: {
          compatible_modes?: string[]
          display_order?: number
          is_curated?: boolean
          key?: string
          name?: string
          voice_block?: string
        }
        Relationships: []
      }
      mind_edges: {
        Row: {
          created_at: string
          id: string
          last_co_occurred_at: string
          source_id: string
          target_id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_co_occurred_at?: string
          source_id: string
          target_id: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_co_occurred_at?: string
          source_id?: string
          target_id?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "mind_edges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "mind_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mind_edges_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "mind_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_node_entries: {
        Row: {
          created_at: string
          id: string
          journal_id: string
          node_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journal_id: string
          node_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journal_id?: string
          node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mind_node_entries_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "mind_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      mind_nodes: {
        Row: {
          created_at: string
          embedding: string | null
          first_seen_at: string
          frequency: number
          id: string
          label: string
          label_normalized: string
          last_seen_at: string
          metadata: Json
          type: Database["public"]["Enums"]["mind_node_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          first_seen_at?: string
          frequency?: number
          id?: string
          label: string
          label_normalized: string
          last_seen_at?: string
          metadata?: Json
          type: Database["public"]["Enums"]["mind_node_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          embedding?: string | null
          first_seen_at?: string
          frequency?: number
          id?: string
          label?: string
          label_normalized?: string
          last_seen_at?: string
          metadata?: Json
          type?: Database["public"]["Enums"]["mind_node_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_for_interrupts: string | null
          pattern_interrupt_channel: string
          pattern_interrupts_enabled: boolean
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_for_interrupts?: string | null
          pattern_interrupt_channel?: string
          pattern_interrupts_enabled?: boolean
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_for_interrupts?: string | null
          pattern_interrupt_channel?: string
          pattern_interrupts_enabled?: boolean
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pattern_interrupt_inbox: {
        Row: {
          body: string
          created_at: string
          dismissed_at: string | null
          distortion_label: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          dismissed_at?: string | null
          distortion_label: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          dismissed_at?: string | null
          distortion_label?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_mentor_persona: string | null
          created_at: string
          crisis_detection_enabled: boolean
          crisis_detection_locale_approved: boolean
          default_mentor_persona: string | null
          display_name: string | null
          e2ee_enabled: boolean
          e2ee_kdf_salt: string | null
          e2ee_passphrase_set_at: string | null
          e2ee_sync_fields: Json
          email: string | null
          id: string
          reflection_mode: string
          sunday_letter_email_enabled: boolean
          sunday_letter_enabled: boolean
          sunday_letter_push_enabled: boolean
          sunday_letter_time: string
          timezone: string
          trusted_contact: Json | null
          updated_at: string
          you_mentor_profile: Json | null
        }
        Insert: {
          active_mentor_persona?: string | null
          created_at?: string
          crisis_detection_enabled?: boolean
          crisis_detection_locale_approved?: boolean
          default_mentor_persona?: string | null
          display_name?: string | null
          e2ee_enabled?: boolean
          e2ee_kdf_salt?: string | null
          e2ee_passphrase_set_at?: string | null
          e2ee_sync_fields?: Json
          email?: string | null
          id: string
          reflection_mode?: string
          sunday_letter_email_enabled?: boolean
          sunday_letter_enabled?: boolean
          sunday_letter_push_enabled?: boolean
          sunday_letter_time?: string
          timezone?: string
          trusted_contact?: Json | null
          updated_at?: string
          you_mentor_profile?: Json | null
        }
        Update: {
          active_mentor_persona?: string | null
          created_at?: string
          crisis_detection_enabled?: boolean
          crisis_detection_locale_approved?: boolean
          default_mentor_persona?: string | null
          display_name?: string | null
          e2ee_enabled?: boolean
          e2ee_kdf_salt?: string | null
          e2ee_passphrase_set_at?: string | null
          e2ee_sync_fields?: Json
          email?: string | null
          id?: string
          reflection_mode?: string
          sunday_letter_email_enabled?: boolean
          sunday_letter_enabled?: boolean
          sunday_letter_push_enabled?: boolean
          sunday_letter_time?: string
          timezone?: string
          trusted_contact?: Json | null
          updated_at?: string
          you_mentor_profile?: Json | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string
          free_months: number
          id: string
          max_redemptions: number | null
          redemption_count: number
          tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at: string
          free_months?: number
          id?: string
          max_redemptions?: number | null
          redemption_count?: number
          tier?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string
          free_months?: number
          id?: string
          max_redemptions?: number | null
          redemption_count?: number
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          code: string
          created_at: string
          environment: string
          granted_until: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          environment?: string
          granted_until: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          environment?: string
          granted_until?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sunday_letters: {
        Row: {
          body: string
          generated_at: string | null
          id: string
          read_at: string | null
          user_id: string
          week_starts_on: string
        }
        Insert: {
          body: string
          generated_at?: string | null
          id?: string
          read_at?: string | null
          user_id: string
          week_starts_on: string
        }
        Update: {
          body?: string
          generated_at?: string | null
          id?: string
          read_at?: string | null
          user_id?: string
          week_starts_on?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_integrations: {
        Row: {
          access_token_enc: string | null
          calendar_mask_titles: boolean | null
          connected_at: string | null
          id: string
          provider: string
          refresh_token_enc: string | null
          scopes: Json | null
          token_expires_at: string | null
          user_id: string
        }
        Insert: {
          access_token_enc?: string | null
          calendar_mask_titles?: boolean | null
          connected_at?: string | null
          id?: string
          provider: string
          refresh_token_enc?: string | null
          scopes?: Json | null
          token_expires_at?: string | null
          user_id: string
        }
        Update: {
          access_token_enc?: string | null
          calendar_mask_titles?: boolean | null
          connected_at?: string | null
          id?: string
          provider?: string
          refresh_token_enc?: string | null
          scopes?: Json | null
          token_expires_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_patterns: {
        Row: {
          computed_at: string
          confidence: number
          created_at: string
          day_of_week: number
          distortion_label: string | null
          hour_of_day: number
          id: string
          last_distortion_seen_at: string | null
          last_fired_at: string | null
          pattern_type: string
          sample_size: number
          theme_label: string | null
          theme_node_id: string | null
          user_id: string
        }
        Insert: {
          computed_at?: string
          confidence?: number
          created_at?: string
          day_of_week: number
          distortion_label?: string | null
          hour_of_day: number
          id?: string
          last_distortion_seen_at?: string | null
          last_fired_at?: string | null
          pattern_type?: string
          sample_size?: number
          theme_label?: string | null
          theme_node_id?: string | null
          user_id: string
        }
        Update: {
          computed_at?: string
          confidence?: number
          created_at?: string
          day_of_week?: number
          distortion_label?: string | null
          hour_of_day?: number
          id?: string
          last_distortion_seen_at?: string | null
          last_fired_at?: string | null
          pattern_type?: string
          sample_size?: number
          theme_label?: string | null
          theme_node_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_persona_switches: {
        Row: {
          id: string
          persona_key: string
          switched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          persona_key: string
          switched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          persona_key?: string
          switched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: { Args: { _user_id: string }; Returns: boolean }
      match_mind_node: {
        Args: {
          _embedding: string
          _threshold?: number
          _type: Database["public"]["Enums"]["mind_node_type"]
          _user_id: string
        }
        Returns: {
          id: string
          similarity: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_promo_code: {
        Args: { _code: string; _environment: string; _user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      mind_node_type: "theme" | "emotion" | "person" | "distortion" | "trigger"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      mind_node_type: ["theme", "emotion", "person", "distortion", "trigger"],
    },
  },
} as const
