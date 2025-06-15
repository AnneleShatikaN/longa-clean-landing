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
      bookings: {
        Row: {
          acceptance_deadline: string | null
          booking_date: string
          booking_time: string
          check_in_time: string | null
          client_id: string
          created_at: string | null
          duration_minutes: number | null
          emergency_booking: boolean | null
          id: string
          modification_history: Json | null
          progress_photos: string[] | null
          provider_id: string | null
          provider_payout: number | null
          quality_score: number | null
          rating: number | null
          review: string | null
          service_id: string
          special_instructions: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          acceptance_deadline?: string | null
          booking_date: string
          booking_time: string
          check_in_time?: string | null
          client_id: string
          created_at?: string | null
          duration_minutes?: number | null
          emergency_booking?: boolean | null
          id?: string
          modification_history?: Json | null
          progress_photos?: string[] | null
          provider_id?: string | null
          provider_payout?: number | null
          quality_score?: number | null
          rating?: number | null
          review?: string | null
          service_id: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          acceptance_deadline?: string | null
          booking_date?: string
          booking_time?: string
          check_in_time?: string | null
          client_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          emergency_booking?: boolean | null
          id?: string
          modification_history?: Json | null
          progress_photos?: string[] | null
          provider_id?: string | null
          provider_payout?: number | null
          quality_score?: number | null
          rating?: number | null
          review?: string | null
          service_id?: string
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_links: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_type: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      financial_reconciliation: {
        Row: {
          created_at: string | null
          discrepancy_amount: number
          id: string
          notes: string | null
          period_end: string
          period_start: string
          platform_commission: number
          reconciled_amount: number
          reconciled_at: string | null
          reconciled_by: string | null
          status: string | null
          taxes_withheld: number
          total_payouts: number
          total_revenue: number
        }
        Insert: {
          created_at?: string | null
          discrepancy_amount?: number
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          platform_commission?: number
          reconciled_amount?: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string | null
          taxes_withheld?: number
          total_payouts?: number
          total_revenue?: number
        }
        Update: {
          created_at?: string | null
          discrepancy_amount?: number
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          platform_commission?: number
          reconciled_amount?: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string | null
          taxes_withheld?: number
          total_payouts?: number
          total_revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "financial_reconciliation_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "financial_reconciliation_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "global_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "global_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          booking_id: string | null
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          booking_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          booking_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_log: {
        Row: {
          attempt_count: number | null
          channel: string
          created_at: string | null
          delivered_at: string | null
          delivery_details: Json | null
          delivery_status: string
          error_message: string | null
          external_id: string | null
          failed_at: string | null
          id: string
          notification_id: string | null
        }
        Insert: {
          attempt_count?: number | null
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_details?: Json | null
          delivery_status: string
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          notification_id?: string | null
        }
        Update: {
          attempt_count?: number | null
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          delivery_details?: Json | null
          delivery_status?: string
          error_message?: string | null
          external_id?: string | null
          failed_at?: string | null
          id?: string
          notification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          push_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_enabled: boolean | null
          timezone: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          push_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_enabled?: boolean | null
          timezone?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          channel: string
          created_at: string | null
          data: Json | null
          delivered: boolean | null
          delivery_attempted_at: string | null
          delivery_failed_reason: string | null
          expires_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean | null
          support_ticket_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          channel: string
          created_at?: string | null
          data?: Json | null
          delivered?: boolean | null
          delivery_attempted_at?: string | null
          delivery_failed_reason?: string | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          support_ticket_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          channel?: string
          created_at?: string | null
          data?: Json | null
          delivered?: boolean | null
          delivery_attempted_at?: string | null
          delivery_failed_reason?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          support_ticket_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_method_configs: {
        Row: {
          api_endpoint: string | null
          api_key_encrypted: string | null
          created_at: string
          id: string
          is_configured: boolean
          last_tested_at: string | null
          name: string
          status: string
          test_result: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_configured?: boolean
          last_tested_at?: string | null
          name: string
          status?: string
          test_result?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_configured?: boolean
          last_tested_at?: string | null
          name?: string
          status?: string
          test_result?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payout_analytics: {
        Row: {
          average_payout: number | null
          commission_paid: number | null
          created_at: string | null
          id: string
          jobs_completed: number | null
          month: string
          payment_method_used: string | null
          payout_frequency: string | null
          provider_id: string | null
          taxes_withheld: number | null
          total_earnings: number | null
          total_payouts: number | null
        }
        Insert: {
          average_payout?: number | null
          commission_paid?: number | null
          created_at?: string | null
          id?: string
          jobs_completed?: number | null
          month: string
          payment_method_used?: string | null
          payout_frequency?: string | null
          provider_id?: string | null
          taxes_withheld?: number | null
          total_earnings?: number | null
          total_payouts?: number | null
        }
        Update: {
          average_payout?: number | null
          commission_paid?: number | null
          created_at?: string | null
          id?: string
          jobs_completed?: number | null
          month?: string
          payment_method_used?: string | null
          payout_frequency?: string | null
          provider_id?: string | null
          taxes_withheld?: number | null
          total_earnings?: number | null
          total_payouts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_analytics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payout_analytics_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_batches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_name: string
          created_at: string | null
          created_by: string | null
          failure_reason: string | null
          id: string
          notes: string | null
          payout_count: number
          processed_at: string | null
          processed_by: string | null
          status: string | null
          total_amount: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_name: string
          created_at?: string | null
          created_by?: string | null
          failure_reason?: string | null
          id?: string
          notes?: string | null
          payout_count?: number
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          total_amount?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_name?: string
          created_at?: string | null
          created_by?: string | null
          failure_reason?: string | null
          id?: string
          notes?: string | null
          payout_count?: number
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payout_batches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payout_batches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_batches_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payout_batches_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          batch_id: string | null
          booking_id: string | null
          created_at: string | null
          external_reference: string | null
          failure_reason: string | null
          gross_amount: number | null
          id: string
          net_amount: number | null
          notes: string | null
          payment_details: string | null
          payment_method: string | null
          payment_method_id: string | null
          payout_type: string
          platform_commission: number | null
          processed_at: string | null
          provider_id: string
          retry_count: number | null
          scheduled_date: string | null
          status: string | null
          tax_withheld: number | null
          urgency_level: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          booking_id?: string | null
          created_at?: string | null
          external_reference?: string | null
          failure_reason?: string | null
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          payment_details?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payout_type: string
          platform_commission?: number | null
          processed_at?: string | null
          provider_id: string
          retry_count?: number | null
          scheduled_date?: string | null
          status?: string | null
          tax_withheld?: number | null
          urgency_level?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          batch_id?: string | null
          booking_id?: string | null
          created_at?: string | null
          external_reference?: string | null
          failure_reason?: string | null
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          payment_details?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payout_type?: string
          platform_commission?: number | null
          processed_at?: string | null
          provider_id?: string
          retry_count?: number | null
          scheduled_date?: string | null
          status?: string | null
          tax_withheld?: number | null
          urgency_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payouts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "payout_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "provider_payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payouts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_earnings_summaries: {
        Row: {
          document_url: string | null
          generated_at: string | null
          id: string
          jobs_completed: number | null
          provider_id: string | null
          quarter: number | null
          total_commission_paid: number | null
          total_gross_earnings: number | null
          total_net_earnings: number | null
          total_taxes_withheld: number | null
          year: number
        }
        Insert: {
          document_url?: string | null
          generated_at?: string | null
          id?: string
          jobs_completed?: number | null
          provider_id?: string | null
          quarter?: number | null
          total_commission_paid?: number | null
          total_gross_earnings?: number | null
          total_net_earnings?: number | null
          total_taxes_withheld?: number | null
          year: number
        }
        Update: {
          document_url?: string | null
          generated_at?: string | null
          id?: string
          jobs_completed?: number | null
          provider_id?: string | null
          quarter?: number | null
          total_commission_paid?: number | null
          total_gross_earnings?: number | null
          total_net_earnings?: number | null
          total_taxes_withheld?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_summaries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_earnings_summaries_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_payment_methods: {
        Row: {
          account_holder_name: string
          account_number: string | null
          bank_name: string | null
          branch_code: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          is_verified: boolean | null
          method_type: string
          mobile_number: string | null
          provider_id: string | null
          updated_at: string | null
          verification_date: string | null
        }
        Insert: {
          account_holder_name: string
          account_number?: string | null
          bank_name?: string | null
          branch_code?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          method_type: string
          mobile_number?: string | null
          provider_id?: string | null
          updated_at?: string | null
          verification_date?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string | null
          bank_name?: string | null
          branch_code?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          is_verified?: boolean | null
          method_type?: string
          mobile_number?: string | null
          provider_id?: string | null
          updated_at?: string | null
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_payment_methods_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_payment_methods_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          id: string
          results_count: number | null
          search_filters: Json | null
          search_query: string
          search_timestamp: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          search_timestamp?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          search_timestamp?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "search_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          client_price: number
          commission_percentage: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          provider_fee: number | null
          service_type: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          client_price: number
          commission_percentage?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          provider_fee?: number | null
          service_type: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          client_price?: number
          commission_percentage?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          provider_fee?: number | null
          service_type?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_contacts: {
        Row: {
          availability_hours: string | null
          contact_type: string
          contact_value: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_emergency: boolean | null
          is_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          availability_hours?: string | null
          contact_type: string
          contact_value: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_emergency?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          availability_hours?: string | null
          contact_type?: string
          contact_value?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_emergency?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      support_ticket_responses: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "support_ticket_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behavior_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_behavior_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "user_behavior_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          password_hash: string
          phone: string | null
          rating: number | null
          role: string
          total_jobs: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          password_hash: string
          phone?: string | null
          rating?: number | null
          role: string
          total_jobs?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          password_hash?: string
          phone?: string | null
          rating?: number | null
          role?: string
          total_jobs?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      analytics_bookings: {
        Row: {
          avg_amount: number | null
          avg_rating: number | null
          booking_count: number | null
          booking_date: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
        }
        Relationships: []
      }
      analytics_provider_performance: {
        Row: {
          avg_rating: number | null
          cancelled_jobs: number | null
          completed_jobs: number | null
          completion_rate: number | null
          provider_id: string | null
          provider_name: string | null
          total_earnings: number | null
          total_jobs: number | null
        }
        Relationships: []
      }
      analytics_revenue: {
        Row: {
          gross_revenue: number | null
          month: string | null
          platform_commission: number | null
          provider_payouts: number | null
          service_type: string | null
          total_bookings: number | null
        }
        Relationships: []
      }
      analytics_service_popularity: {
        Row: {
          avg_rating: number | null
          bookings_30d: number | null
          id: string | null
          name: string | null
          service_type: string | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      analytics_user_stats: {
        Row: {
          active_users: number | null
          new_users_30d: number | null
          role: string | null
          total_users: number | null
        }
        Relationships: []
      }
      service_search_analytics: {
        Row: {
          avg_rating: number | null
          bookings_30d: number | null
          client_price: number | null
          completed_bookings: number | null
          duration_minutes: number | null
          id: string | null
          name: string | null
          service_type: string | null
          tags: string[] | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_enhanced_payout: {
        Args: {
          service_id: string
          client_price: number
          is_emergency?: boolean
        }
        Returns: {
          gross_amount: number
          platform_commission: number
          tax_withheld: number
          net_amount: number
        }[]
      }
      calculate_provider_payout: {
        Args: { service_id: string; client_price: number }
        Returns: number
      }
      check_booking_conflicts: {
        Args: {
          provider_id: string
          booking_date: string
          booking_time: string
          duration_minutes: number
        }
        Returns: boolean
      }
      get_analytics_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          total_providers: number
          total_bookings: number
          completed_bookings: number
          total_revenue: number
          avg_rating: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_geographic_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          region: string
          total_bookings: number
          total_revenue: number
        }[]
      }
      get_mrr: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          mrr: number
          growth_rate: number
        }[]
      }
      get_search_suggestions: {
        Args: { partial_query: string; limit_results?: number }
        Returns: {
          suggestion: string
          category: string
          popularity: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_faq_views: {
        Args: { faq_id: string }
        Returns: undefined
      }
      perform_financial_reconciliation: {
        Args: { start_date: string; end_date: string }
        Returns: string
      }
      refresh_service_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_bookings: {
        Args: {
          user_id_filter?: string
          user_role?: string
          status_filter?: string
          service_type_filter?: string
          date_from?: string
          date_to?: string
          min_amount?: number
          max_amount?: number
          search_text?: string
          sort_by?: string
          sort_order?: string
          limit_results?: number
          offset_results?: number
        }
        Returns: {
          id: string
          booking_date: string
          booking_time: string
          status: string
          total_amount: number
          service_name: string
          client_name: string
          provider_name: string
          created_at: string
          search_rank: number
        }[]
      }
      search_providers_by_location: {
        Args: {
          search_lat?: number
          search_lng?: number
          max_distance_km?: number
          service_type_filter?: string
          min_rating?: number
          available_date?: string
          available_time?: string
          limit_results?: number
        }
        Returns: {
          id: string
          full_name: string
          rating: number
          total_jobs: number
          distance_km: number
          available: boolean
        }[]
      }
      search_services: {
        Args: {
          search_query: string
          service_type_filter?: string
          min_price?: number
          max_price?: number
          min_duration?: number
          max_duration?: number
          min_rating?: number
          tags_filter?: string[]
          limit_results?: number
          offset_results?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          service_type: string
          client_price: number
          duration_minutes: number
          tags: string[]
          avg_rating: number
          total_bookings: number
          search_rank: number
        }[]
      }
      send_notification: {
        Args:
          | {
              p_user_id: string
              p_type: string
              p_title: string
              p_message: string
              p_data?: Json
              p_booking_id?: string
              p_priority?: string
            }
          | {
              user_id: string
              notification_type: string
              title: string
              message: string
              booking_id?: string
            }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      test_payment_method_connection: {
        Args: { config_id: string }
        Returns: Json
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      update_global_setting: {
        Args: { setting_key: string; setting_value: Json }
        Returns: Json
      }
      update_payment_method_config: {
        Args: {
          config_id: string
          endpoint?: string
          api_key?: string
          new_status?: string
        }
        Returns: Json
      }
      update_support_contact: {
        Args:
          | {
              p_contact_type: string
              p_contact_value: string
              p_display_name?: string
              p_description?: string
              p_availability_hours?: string
            }
          | {
              p_contact_type: string
              p_contact_value: string
              p_display_name?: string
              p_description?: string
              p_availability_hours?: string
              p_is_emergency?: boolean
            }
        Returns: Json
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
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
    Enums: {
      booking_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
