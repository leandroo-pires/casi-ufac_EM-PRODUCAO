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
      calendario_academico: {
        Row: {
          ano: number
          ativo: boolean
          created_at: string
          id: string
          pdf_url: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ano: number
          ativo?: boolean
          created_at?: string
          id?: string
          pdf_url: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ano?: number
          ativo?: boolean
          created_at?: string
          id?: string
          pdf_url?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      diretoria: {
        Row: {
          ativo: boolean
          bio: string | null
          cargo: string
          created_at: string
          email: string | null
          foto_url: string | null
          github: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          nome: string
          ordem: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ativo?: boolean
          bio?: string | null
          cargo: string
          created_at?: string
          email?: string | null
          foto_url?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          nome: string
          ordem?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ativo?: boolean
          bio?: string | null
          cargo?: string
          created_at?: string
          email?: string | null
          foto_url?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          nome?: string
          ordem?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      documentos_academicos: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          pdf_url: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          pdf_url: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          pdf_url?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      editais: {
        Row: {
          categoria: string | null
          created_at: string
          data_publicacao: string
          descricao: string | null
          id: string
          pdf_url: string
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_publicacao?: string
          descricao?: string | null
          id?: string
          pdf_url: string
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_publicacao?: string
          descricao?: string | null
          id?: string
          pdf_url?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      eventos: {
        Row: {
          created_at: string
          data_evento: string
          descricao: string | null
          id: string
          imagem_url: string | null
          inscricao_url: string | null
          is_novo: boolean
          local: string | null
          resumo_url: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_evento: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          inscricao_url?: string | null
          is_novo?: boolean
          local?: string | null
          resumo_url?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_evento?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          inscricao_url?: string | null
          is_novo?: boolean
          local?: string | null
          resumo_url?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      midia_showcase: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          imagem_url: string
          link_url: string | null
          ordem: number
          subtitulo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url: string
          link_url?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          imagem_url?: string
          link_url?: string | null
          ordem?: number
          subtitulo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      ouvidorias: {
        Row: {
          categoria: string
          created_at: string
          id: string
          is_public: boolean
          matricula: string | null
          mensagem: string
          nome: string | null
          resposta_publica: string | null
          status: string
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          is_public?: boolean
          matricula?: string | null
          mensagem: string
          nome?: string | null
          resposta_publica?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          is_public?: boolean
          matricula?: string | null
          mensagem?: string
          nome?: string | null
          resposta_publica?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          curso: string | null
          data_nascimento: string | null
          display_name: string | null
          github: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          matricula: string | null
          nickname: string | null
          periodo: string | null
          twitter: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          curso?: string | null
          data_nascimento?: string | null
          display_name?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          matricula?: string | null
          nickname?: string | null
          periodo?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          curso?: string | null
          data_nascimento?: string | null
          display_name?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          matricula?: string | null
          nickname?: string | null
          periodo?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          chave: string
          conteudo: string | null
          created_at: string
          id: string
          titulo: string | null
          updated_at: string
        }
        Insert: {
          chave: string
          conteudo?: string | null
          created_at?: string
          id?: string
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          chave?: string
          conteudo?: string | null
          created_at?: string
          id?: string
          titulo?: string | null
          updated_at?: string
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
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          curso: string | null
          display_name: string | null
          github: string | null
          id: string | null
          instagram: string | null
          linkedin: string | null
          nickname: string | null
          periodo: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          curso?: string | null
          display_name?: string | null
          github?: string | null
          id?: string | null
          instagram?: string | null
          linkedin?: string | null
          nickname?: string | null
          periodo?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          curso?: string | null
          display_name?: string | null
          github?: string | null
          id?: string | null
          instagram?: string | null
          linkedin?: string | null
          nickname?: string | null
          periodo?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "diretoria" | "aluno"
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
    Enums: {
      app_role: ["admin", "diretoria", "aluno"],
    },
  },
} as const
