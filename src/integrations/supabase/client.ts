// This is a temporary mock file. 
// The real Supabase client will be auto-generated when you properly connect Supabase.
// Please click the green Supabase button in the top right and complete the setup.

const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Please connect Supabase first") }),
    signUp: () => Promise.resolve({ data: null, error: new Error("Please connect Supabase first") }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error("Please connect Supabase first") }),
        order: () => Promise.resolve({ data: [], error: new Error("Please connect Supabase first") })
      }),
      order: () => Promise.resolve({ data: [], error: new Error("Please connect Supabase first") })
    }),
    insert: () => Promise.resolve({ data: null, error: new Error("Please connect Supabase first") }),
    upsert: () => Promise.resolve({ data: null, error: new Error("Please connect Supabase first") })
  })
};

export const supabase = mockSupabase as any;