// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obrhuhasrppixjwkznri.supabase.co'; // بدّلي xxx بالرابط بتاع مشروعك
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icmh1aGFzcnBwaXhqd2t6bnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDYyNzgsImV4cCI6MjA2NDA4MjI3OH0.BEso8xpPQBPBMwWFLLyM7npDMxHdEjv-pe9Q2HVU_cY'; // خد المفتاح من Supabase Dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
