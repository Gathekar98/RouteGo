import { supabase } from '../../lib/supabase';

export interface City {
  id: string;
  name: string;
  state: string;
}

export async function searchCities(query: string): Promise<City[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, state')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(8);

  if (error) throw error;
  return data;
}