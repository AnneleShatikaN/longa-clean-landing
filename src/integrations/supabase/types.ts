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
      automated_payout_batches: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          batch_name: string
          batch_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          payout_count: number
          processed_at: string | null
          processed_by: string | null
          processing_notes: string | null
          scheduled_date: string | null
          status: string | null
          total_amount: number
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          batch_name: string
          batch_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          payout_count?: number
          processed_at?: string | null
          processed_by?: string | null
          processing_notes?: string | null
          scheduled_date?: string | null
          status?: string | null
          total_amount?: number
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          batch_name?: string
          batch_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          payout_count?: number
          processed_at?: string | null
          processed_by?: string | null
          processing_notes?: string | null
          scheduled_date?: string | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "automated_payout_batches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "automated_payout_batches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "automated_payout_batches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "automated_payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "automated_payout_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_payout_batches_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "automated_payout_batches_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "automated_payout_batches_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      banking_instructions: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          branch_code: string | null
          created_at: string | null
          id: string
          instructions: string
          is_active: boolean | null
          reference_format: string
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          branch_code?: string | null
          created_at?: string | null
          id?: string
          instructions?: string
          is_active?: boolean | null
          reference_format?: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          branch_code?: string | null
          created_at?: string | null
          id?: string
          instructions?: string
          is_active?: boolean | null
          reference_format?: string
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          assignment_reason: string | null
          auto_assigned: boolean | null
          booking_id: string
          id: string
          provider_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          assignment_reason?: string | null
          auto_assigned?: boolean | null
          booking_id: string
          id?: string
          provider_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          assignment_reason?: string | null
          auto_assigned?: boolean | null
          booking_id?: string
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "booking_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "booking_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "booking_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "booking_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          acceptance_deadline: string | null
          assigned_at: string | null
          assigned_by: string | null
          assignment_status: string | null
          booking_date: string
          booking_time: string
          check_in_time: string | null
          client_id: string
          created_at: string | null
          duration_minutes: number | null
          emergency_booking: boolean | null
          id: string
          is_weekend_job: boolean | null
          location_town: string | null
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
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_status?: string | null
          booking_date: string
          booking_time: string
          check_in_time?: string | null
          client_id: string
          created_at?: string | null
          duration_minutes?: number | null
          emergency_booking?: boolean | null
          id?: string
          is_weekend_job?: boolean | null
          location_town?: string | null
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
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_status?: string | null
          booking_date?: string
          booking_time?: string
          check_in_time?: string | null
          client_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          emergency_booking?: boolean | null
          id?: string
          is_weekend_job?: boolean | null
          location_town?: string | null
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
            foreignKeyName: "bookings_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "bookings_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "bookings_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
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
      business_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          description: string | null
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_audit_log: {
        Row: {
          action: string
          changes: Json | null
          content_id: string
          content_type: string
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          content_id: string
          content_type: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          content_id?: string
          content_type?: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "content_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "content_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_analytics: {
        Row: {
          avg_booking_value: number | null
          avg_rating_given: number | null
          churn_risk_score: number | null
          client_id: string | null
          completed_bookings: number | null
          created_at: string | null
          customer_lifetime_value: number | null
          first_booking_date: string | null
          id: string
          last_booking_date: string | null
          last_calculated_at: string | null
          preferred_locations: string[] | null
          preferred_services: string[] | null
          total_bookings: number | null
          total_spent: number | null
        }
        Insert: {
          avg_booking_value?: number | null
          avg_rating_given?: number | null
          churn_risk_score?: number | null
          client_id?: string | null
          completed_bookings?: number | null
          created_at?: string | null
          customer_lifetime_value?: number | null
          first_booking_date?: string | null
          id?: string
          last_booking_date?: string | null
          last_calculated_at?: string | null
          preferred_locations?: string[] | null
          preferred_services?: string[] | null
          total_bookings?: number | null
          total_spent?: number | null
        }
        Update: {
          avg_booking_value?: number | null
          avg_rating_given?: number | null
          churn_risk_score?: number | null
          client_id?: string | null
          completed_bookings?: number | null
          created_at?: string | null
          customer_lifetime_value?: number | null
          first_booking_date?: string | null
          id?: string
          last_booking_date?: string | null
          last_calculated_at?: string | null
          preferred_locations?: string[] | null
          preferred_services?: string[] | null
          total_bookings?: number | null
          total_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_analytics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "customer_analytics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "customer_analytics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "users"
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
      email_verification_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      faq_analytics: {
        Row: {
          faq_id: string | null
          id: string
          page_context: string | null
          user_id: string | null
          user_role: string | null
          viewed_at: string | null
        }
        Insert: {
          faq_id?: string | null
          id?: string
          page_context?: string | null
          user_id?: string | null
          user_role?: string | null
          viewed_at?: string | null
        }
        Update: {
          faq_id?: string | null
          id?: string
          page_context?: string | null
          user_id?: string | null
          user_role?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_analytics_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "support_faqs"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
      package_entitlements: {
        Row: {
          allowed_service_id: string
          cycle_days: number
          id: string
          package_id: string
          quantity_per_cycle: number
        }
        Insert: {
          allowed_service_id: string
          cycle_days?: number
          id?: string
          package_id: string
          quantity_per_cycle: number
        }
        Update: {
          allowed_service_id?: string
          cycle_days?: number
          id?: string
          package_id?: string
          quantity_per_cycle?: number
        }
        Relationships: [
          {
            foreignKeyName: "package_entitlements_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_entitlements_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "package_entitlements_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_entitlements_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_entitlements_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_service_inclusions: {
        Row: {
          created_at: string
          id: string
          package_id: string
          provider_fee_per_job: number
          quantity_per_package: number
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          provider_fee_per_job: number
          quantity_per_package?: number
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          provider_fee_per_job?: number
          quantity_per_package?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_service_inclusions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_service_inclusions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_service_inclusions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "package_service_inclusions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_service_inclusions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "analytics_provider_rankings"
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
      payout_automation_rules: {
        Row: {
          auto_approve_under_amount: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_payout_amount: number | null
          payout_day: number | null
          payout_frequency: string | null
          performance_bonus_enabled: boolean | null
          performance_bonus_percentage: number | null
          performance_bonus_threshold: number | null
          provider_id: string | null
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          auto_approve_under_amount?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_payout_amount?: number | null
          payout_day?: number | null
          payout_frequency?: string | null
          performance_bonus_enabled?: boolean | null
          performance_bonus_percentage?: number | null
          performance_bonus_threshold?: number | null
          provider_id?: string | null
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          auto_approve_under_amount?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_payout_amount?: number | null
          payout_day?: number | null
          payout_frequency?: string | null
          performance_bonus_enabled?: boolean | null
          performance_bonus_percentage?: number | null
          performance_bonus_threshold?: number | null
          provider_id?: string | null
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_automation_rules_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payout_automation_rules_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "payout_automation_rules_provider_id_fkey"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
          weekend_bonus: number | null
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
          weekend_bonus?: number | null
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
          weekend_bonus?: number | null
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
      pending_transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          booking_details: Json | null
          created_at: string | null
          id: string
          package_id: string | null
          payment_proof_url: string | null
          reference_number: string | null
          service_id: string | null
          status: string
          transaction_type: string
          updated_at: string | null
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          booking_details?: Json | null
          created_at?: string | null
          id?: string
          package_id?: string | null
          payment_proof_url?: string | null
          reference_number?: string | null
          service_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string | null
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          booking_details?: Json | null
          created_at?: string | null
          id?: string
          package_id?: string | null
          payment_proof_url?: string | null
          reference_number?: string | null
          service_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pending_transactions_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_package_id"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "user_active_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "fk_pending_transactions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          provider_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          provider_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          provider_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_banking_details: {
        Row: {
          account_holder_name: string
          account_number: string
          account_type: string | null
          bank_name: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          provider_id: string
          routing_number: string | null
          swift_code: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          account_type?: string | null
          bank_name: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          provider_id: string
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          account_type?: string | null
          bank_name?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          provider_id?: string
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_banking_details_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_banking_details_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_banking_details_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_banking_details_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_banking_details_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_banking_details_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_documents: {
        Row: {
          document_name: string
          document_type: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          provider_id: string
          rejection_reason: string | null
          uploaded_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_name: string
          document_type: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          provider_id: string
          rejection_reason?: string | null
          uploaded_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_name?: string
          document_type?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          provider_id?: string
          rejection_reason?: string | null
          uploaded_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_documents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_documents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_documents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_documents_verified_by_fkey"
            columns: ["verified_by"]
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
      provider_references: {
        Row: {
          company_name: string | null
          contacted_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          provider_id: string
          reference_email: string | null
          reference_name: string
          reference_phone: string
          relationship: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          years_known: number | null
        }
        Insert: {
          company_name?: string | null
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          provider_id: string
          reference_email?: string | null
          reference_name: string
          reference_phone: string
          relationship: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_known?: number | null
        }
        Update: {
          company_name?: string | null
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          provider_id?: string
          reference_email?: string | null
          reference_name?: string
          reference_phone?: string
          relationship?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          years_known?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_references_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_references_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_references_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_references_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_references_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_references_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_specializations: {
        Row: {
          certification_details: Json | null
          created_at: string | null
          expertise_level: string | null
          id: string
          provider_id: string
          service_id: string
          years_experience: number | null
        }
        Insert: {
          certification_details?: Json | null
          created_at?: string | null
          expertise_level?: string | null
          id?: string
          provider_id: string
          service_id: string
          years_experience?: number | null
        }
        Update: {
          certification_details?: Json | null
          created_at?: string | null
          expertise_level?: string | null
          id?: string
          provider_id?: string
          service_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_specializations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_specializations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_specializations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_specializations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_specializations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "provider_specializations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_specializations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_time_off: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          end_date: string
          end_time: string | null
          id: string
          provider_id: string
          reason: string | null
          start_date: string
          start_time: string | null
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          end_date: string
          end_time?: string | null
          id?: string
          provider_id: string
          reason?: string | null
          start_date: string
          start_time?: string | null
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          end_date?: string
          end_time?: string | null
          id?: string
          provider_id?: string
          reason?: string | null
          start_date?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_time_off_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_time_off_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_time_off_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_forecasts: {
        Row: {
          accuracy_score: number | null
          actual_bookings: number | null
          actual_revenue: number | null
          confidence_level: number | null
          created_at: string | null
          factors: Json | null
          forecast_date: string
          forecast_type: string
          id: string
          location: string | null
          predicted_bookings: number
          predicted_revenue: number
          service_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_bookings?: number | null
          actual_revenue?: number | null
          confidence_level?: number | null
          created_at?: string | null
          factors?: Json | null
          forecast_date: string
          forecast_type: string
          id?: string
          location?: string | null
          predicted_bookings: number
          predicted_revenue: number
          service_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_bookings?: number | null
          actual_revenue?: number | null
          confidence_level?: number | null
          created_at?: string | null
          factors?: Json | null
          forecast_date?: string
          forecast_type?: string
          id?: string
          location?: string | null
          predicted_bookings?: number
          predicted_revenue?: number
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_forecasts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_forecasts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "revenue_forecasts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_forecasts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
            referencedRelation: "analytics_provider_rankings"
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
      service_usage_logs: {
        Row: {
          allowed_service_id: string
          booking_id: string | null
          id: string
          package_id: string
          used_at: string
          user_id: string
        }
        Insert: {
          allowed_service_id: string
          booking_id?: string | null
          id?: string
          package_id: string
          used_at?: string
          user_id: string
        }
        Update: {
          allowed_service_id?: string
          booking_id?: string | null
          id?: string
          package_id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_usage_logs_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_usage_logs_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_usage_logs_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_usage_logs_allowed_service_id_fkey"
            columns: ["allowed_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_usage_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_popularity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_usage_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "analytics_service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_usage_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_search_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_usage_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          client_price: number
          commission_percentage: number | null
          coverage_areas: string[] | null
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
          coverage_areas?: string[] | null
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
          coverage_areas?: string[] | null
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
      subscription_packages: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "subscription_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "subscription_packages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          last_updated_by: string | null
          priority: number | null
          question: string
          updated_at: string | null
          views: number | null
          visibility_rules: Json | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_by?: string | null
          priority?: number | null
          question: string
          updated_at?: string | null
          views?: number | null
          visibility_rules?: Json | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_by?: string | null
          priority?: number | null
          question?: string
          updated_at?: string | null
          views?: number | null
          visibility_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "support_faqs_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_performance"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "support_faqs_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "analytics_provider_rankings"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "support_faqs_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
            referencedRelation: "analytics_provider_rankings"
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
      user_active_packages: {
        Row: {
          expiry_date: string
          id: string
          package_id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          expiry_date: string
          id?: string
          package_id: string
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          expiry_date?: string
          id?: string
          package_id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_active_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
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
            referencedRelation: "analytics_provider_rankings"
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
          background_check_consent: boolean | null
          banking_details_verified: boolean | null
          created_at: string | null
          current_work_location: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_available: boolean | null
          password_hash: string
          phone: string | null
          rating: number | null
          role: string
          service_coverage_areas: string[] | null
          total_jobs: number | null
          updated_at: string | null
          verification_documents: Json | null
          verification_notes: string | null
          verification_status: string | null
          verification_submitted_at: string | null
          verified_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_check_consent?: boolean | null
          banking_details_verified?: boolean | null
          created_at?: string | null
          current_work_location?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          password_hash: string
          phone?: string | null
          rating?: number | null
          role: string
          service_coverage_areas?: string[] | null
          total_jobs?: number | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          verified_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_check_consent?: boolean | null
          banking_details_verified?: boolean | null
          created_at?: string | null
          current_work_location?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          password_hash?: string
          phone?: string | null
          rating?: number | null
          role?: string
          service_coverage_areas?: string[] | null
          total_jobs?: number | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          verified_at?: string | null
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
      analytics_financial_overview: {
        Row: {
          avg_booking_value: number | null
          completed_bookings: number | null
          month: string | null
          platform_commission: number | null
          provider_payouts: number | null
          revenue: number | null
          total_bookings: number | null
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
      analytics_provider_rankings: {
        Row: {
          bookings_30_days: number | null
          completed_30_days: number | null
          completion_rate: number | null
          overall_rating: number | null
          provider_id: string | null
          provider_name: string | null
          recent_rating: number | null
          revenue_30_days: number | null
          service_coverage_areas: string[] | null
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
      analytics_service_profitability: {
        Row: {
          avg_price: number | null
          avg_rating: number | null
          completed_bookings: number | null
          coverage_areas: string[] | null
          profit_margin: number | null
          service_id: string | null
          service_name: string | null
          service_type: string | null
          total_bookings: number | null
          total_payouts: number | null
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
      activate_user_package: {
        Args: {
          p_user_id: string
          p_package_id: string
          p_duration_days?: number
        }
        Returns: Json
      }
      approve_pending_transaction: {
        Args: { transaction_id: string; admin_notes_param?: string }
        Returns: Json
      }
      assign_booking_to_provider: {
        Args: {
          p_booking_id: string
          p_provider_id: string
          p_assigned_by: string
          p_assignment_reason?: string
          p_auto_assigned?: boolean
        }
        Returns: Json
      }
      calculate_customer_ltv: {
        Args: { client_id_param: string }
        Returns: number
      }
      calculate_enhanced_payout: {
        Args:
          | { service_id: string; client_price: number; is_emergency?: boolean }
          | {
              service_id: string
              client_price: number
              is_emergency?: boolean
              is_weekend?: boolean
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
      calculate_revenue_forecast: {
        Args: { forecast_months?: number; service_id_filter?: string }
        Returns: {
          month: string
          predicted_revenue: number
          predicted_bookings: number
          confidence_level: number
          growth_trend: number
        }[]
      }
      cancel_booking_with_refund: {
        Args: { p_booking_id: string; p_reason: string }
        Returns: undefined
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
      check_provider_availability_at_time: {
        Args: {
          p_provider_id: string
          p_date: string
          p_time: string
          p_duration_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decline_pending_transaction: {
        Args: { transaction_id: string; admin_notes_param?: string }
        Returns: Json
      }
      find_available_providers_for_booking: {
        Args: {
          p_service_id: string
          p_booking_date: string
          p_booking_time: string
          p_duration_minutes?: number
          p_location_town?: string
        }
        Returns: {
          provider_id: string
          provider_name: string
          rating: number
          expertise_level: string
          years_experience: number
          availability_score: number
        }[]
      }
      generate_reset_token: {
        Args: { p_user_id: string }
        Returns: string
      }
      generate_verification_token: {
        Args: { p_user_id: string }
        Returns: string
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
      get_enhanced_financial_overview: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_revenue: number
          total_provider_payouts: number
          total_expenses: number
          admin_profit: number
          total_bookings: number
          completed_bookings: number
          total_packages_sold: number
          avg_booking_value: number
        }[]
      }
      get_faqs_for_context: {
        Args: {
          p_user_role?: string
          p_page_context?: string
          p_category?: string
        }
        Returns: {
          id: string
          question: string
          answer: string
          category: string
          views: number
          priority: number
          visibility_rules: Json
          created_at: string
        }[]
      }
      get_financial_overview: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_revenue: number
          total_provider_payouts: number
          total_expenses: number
          admin_profit: number
        }[]
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
      get_providers_by_location: {
        Args: { location_filter?: string; service_id_filter?: string }
        Returns: {
          id: string
          full_name: string
          rating: number
          total_jobs: number
          current_work_location: string
          service_coverage_areas: string[]
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
      get_services_by_location: {
        Args: { location_filter?: string }
        Returns: {
          id: string
          name: string
          description: string
          service_type: string
          client_price: number
          duration_minutes: number
          tags: string[]
          coverage_areas: string[]
          provider_count: number
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
      is_provider_verified: {
        Args: { provider_id: string }
        Returns: boolean
      }
      is_weekend_in_namibian_timezone: {
        Args: { check_date: string }
        Returns: boolean
      }
      mark_client_no_show: {
        Args: { p_booking_id: string; p_reason: string }
        Returns: undefined
      }
      mark_provider_no_show: {
        Args: { p_booking_id: string; p_reason: string }
        Returns: undefined
      }
      perform_financial_reconciliation: {
        Args: { start_date: string; end_date: string }
        Returns: string
      }
      reassign_booking_provider: {
        Args: {
          p_booking_id: string
          p_new_provider_id: string
          p_reassignment_reason: string
          p_old_provider_id?: string
        }
        Returns: undefined
      }
      refresh_service_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rollback_booking_status: {
        Args: { p_booking_id: string; p_new_status: string; p_reason: string }
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
      update_booking_details: {
        Args: {
          p_booking_id: string
          p_booking_date?: string
          p_booking_time?: string
          p_service_id?: string
          p_total_amount?: number
          p_special_instructions?: string
          p_location_town?: string
          p_duration_minutes?: number
          p_emergency_booking?: boolean
        }
        Returns: undefined
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
      update_provider_verification_status: {
        Args: { provider_id: string; new_status: string; admin_notes?: string }
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
      use_package_service: {
        Args: { p_user_id: string; p_service_id: string }
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
