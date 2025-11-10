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
          created_at: string
          full_name: string
          id: string
          notes: string | null
          phone: string
          preferred_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          preferred_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          preferred_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          age: number | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          id: string
          code: string
          status: 'waiting' | 'playing' | 'finished'
          current_round: 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich' | null
          user_id: string | null
          intro_videos: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          status?: 'waiting' | 'playing' | 'finished'
          current_round?: 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich' | null
          user_id?: string | null
          intro_videos?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          status?: 'waiting' | 'playing' | 'finished'
          current_round?: 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich' | null
          user_id?: string | null
          intro_videos?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          game_id: string
          name: string
          score: number
          position: number | null
          is_host: boolean
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          name: string
          score?: number
          position?: number | null
          is_host?: boolean
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          score?: number
          position?: number | null
          is_host?: boolean
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          game_id: string
          round: 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich'
          question_text: string
          correct_answer: string
          points: number
          order_index: number
          question_type: 'normal' | 'hang_ngang' | 'chuong_ngai_vat' | 'goi_cau_hoi' | null
          hang_ngang_index: number | null
          goi_diem: number | null
          hint: string | null
          options: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          round: 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich'
          question_text: string
          correct_answer: string
          points?: number
          order_index: number
          question_type?: 'normal' | 'hang_ngang' | 'chuong_ngai_vat' | 'goi_cau_hoi' | null
          hang_ngang_index?: number | null
          goi_diem?: number | null
          hint?: string | null
          options?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          round?: 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich'
          question_text?: string
          correct_answer?: string
          points?: number
          order_index?: number
          question_type?: 'normal' | 'hang_ngang' | 'chuong_ngai_vat' | 'goi_cau_hoi' | null
          hang_ngang_index?: number | null
          goi_diem?: number | null
          hint?: string | null
          options?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      answers: {
        Row: {
          id: string
          player_id: string
          question_id: string
          answer_text: string
          is_correct: boolean
          points_earned: number
          response_time: number | null
          answered_at: string
        }
        Insert: {
          id?: string
          player_id: string
          question_id: string
          answer_text: string
          is_correct?: boolean
          points_earned?: number
          response_time?: number | null
          answered_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          question_id?: string
          answer_text?: string
          is_correct?: boolean
          points_earned?: number
          response_time?: number | null
          answered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_player_id_fkey"
            columns: ["player_id"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      vcnv_state: {
        Row: {
          id: string
          game_id: string
          hang_ngang_index: number
          is_revealed: boolean
          revealed_at: string | null
        }
        Insert: {
          id?: string
          game_id: string
          hang_ngang_index: number
          is_revealed?: boolean
          revealed_at?: string | null
        }
        Update: {
          id?: string
          game_id?: string
          hang_ngang_index?: number
          is_revealed?: boolean
          revealed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vcnv_state_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      ve_dich_state: {
        Row: {
          id: string
          game_id: string
          player_id: string
          goi_diem: number
          question_id: string
          selected_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          goi_diem: number
          question_id: string
          selected_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          goi_diem?: number
          question_id?: string
          selected_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ve_dich_state_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ve_dich_state_player_id_fkey"
            columns: ["player_id"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ve_dich_state_question_id_fkey"
            columns: ["question_id"]
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          game_id: string
          player_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_game_id_fkey"
            columns: ["game_id"]
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_player_id_fkey"
            columns: ["player_id"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
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
