
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pgzpchlsoqtarplgqapr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnenBjaGxzb3F0YXJwbGdxYXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MjQ0MTMsImV4cCI6MjA4OTMwMDQxM30.jWLxBGrGZ9L01JtTZSWBNB0as1EYlxA_yQptM5yG9-w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);