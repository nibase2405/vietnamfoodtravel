export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenericTable<Row = any, Insert = any, Update = any> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
};

export type Database = {
  public: {
    Tables: Record<string, GenericTable> & {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "guide" | "merchant" | "admin" | "super_admin";
          preferred_language: string | null;
          status: "active" | "blocked" | "pending";
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      destinations: {
        Row: {
          id: string;
          country: string | null;
          city: string | null;
          slug: string | null;
          region: "north" | "central" | "south" | null;
          latitude: number | null;
          longitude: number | null;
          cover_image_url: string | null;
          status: string | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["destinations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["destinations"]["Row"]>;
      };
      tours: {
        Row: {
          id: string;
          destination_id: string | null;
          title: string;
          slug: string;
          tour_type: "private" | "semi_self_guided" | "group" | "day_trip" | "custom" | null;
          theme: string[] | null;
          duration_days: number | null;
          duration_nights: number | null;
          min_people: number | null;
          max_people: number | null;
          base_price: number | null;
          currency: string | null;
          cover_image_url: string | null;
          gallery_urls: string[] | null;
          status: string | null;
          is_featured: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tours"]["Row"]> & { title: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["tours"]["Row"]>;
      };
      restaurants: {
        Row: {
          id: string;
          destination_id: string | null;
          name: string;
          slug: string;
          cuisine_type: string[] | null;
          price_range: "low" | "medium" | "high" | "luxury" | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          opening_hours: Json | null;
          cover_image_url: string | null;
          status: string | null;
          is_featured: boolean | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["restaurants"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Row"]>;
      };
      attractions: {
        Row: {
          id: string;
          destination_id: string | null;
          name: string;
          slug: string;
          category: string[] | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          opening_hours: Json | null;
          cover_image_url: string | null;
          rating_avg: number | null;
          status: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["attractions"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["attractions"]["Row"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string | null;
          tags: string[] | null;
          cover_image_url: string | null;
          excerpt: string | null;
          content: Json | null;
          status: "draft" | "published" | "archived" | null;
          published_at: string | null;
          seo_title: string | null;
          seo_description: string | null;
          canonical_url: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]> & { title: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};
