import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables!');
    }
  
    this.supabase = createClient(supabaseUrl, supabaseKey);  // Creating client
  }

  getClient() {
    if (!this.supabase) {
      throw new Error('Supabase client is not initialized.');
    }
    return this.supabase;
  }
}
