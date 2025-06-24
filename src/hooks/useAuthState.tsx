
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    profile: null
  });

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false
        }));

        // Fetch profile data when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }

        // Clear profile when user signs out
        if (event === 'SIGNED_OUT') {
          setAuthState(prev => ({
            ...prev,
            profile: null
          }));
        }
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            loading: false
          }));

          // Fetch profile if we have a user
          if (session?.user) {
            fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Session retrieval error:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setAuthState(prev => ({ ...prev, profile }));
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const signOut = async () => {
    try {
      // Clear any pending user data
      localStorage.removeItem('pending_user_data');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }

      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  return {
    ...authState,
    signOut,
    refreshProfile: () => authState.user && fetchUserProfile(authState.user.id)
  };
};
