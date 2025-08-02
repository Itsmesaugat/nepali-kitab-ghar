import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderProps {
  user: SupabaseUser | null;
  cartItemCount: number;
  onAuthClick: () => void;
  onCartClick: () => void;
}

export const Header = ({ user, cartItemCount, onAuthClick, onCartClick }: HeaderProps) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setUserProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">नेपाली पुस्तक भण्डार</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  स्वागत, {userProfile?.full_name || user.email}
                  {isAdmin && <span className="ml-2 text-primary font-medium">(एडमिन)</span>}
                </span>
                
                {isAdmin && (
                  <Button variant="outline" size="sm">
                    एडमिन प्यानल
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCartClick}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4" />
                  कार्ट
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  बाहिर निस्कनुहोस्
                </Button>
              </>
            ) : (
              <Button
                variant="warm"
                size="sm"
                onClick={onAuthClick}
              >
                <User className="h-4 w-4" />
                लगइन / साइनअप
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};