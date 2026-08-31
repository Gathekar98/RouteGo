import { supabase } from '../../lib/supabase';
import type { SignupFormValues, LoginFormValues } from './schemas';

export async function signUp({ fullName, email, phone, password }: SignupFormValues) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }: LoginFormValues) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}