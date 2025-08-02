import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Minus } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("सबै");
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();

  const genres = ["सबै", "कथा", "निबन्ध", "उपन्यास", "इतिहास", "कविता", "विज्ञान कथा", "डरावनी", "रोमान्स"];

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "त्रुटि",
        description: "पुस्तकहरू लोड गर्न असफल भयो।",
        variant: "destructive",
      });
    } else {
      setBooks(data || []);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        books:book_id (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      setCartItems(data || []);
    }
  };

  const addToCart = async (bookId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        book_id: bookId,
        quantity: 1,
      }, {
        onConflict: 'user_id,book_id',
        ignoreDuplicates: false,
      });

    if (error) {
      toast({
        title: "त्रुटि",
        description: "कार्टमा थप्न असफल भयो।",
        variant: "destructive",
      });
    } else {
      toast({
        title: "सफल!",
        description: "पुस्तक कार्टमा थपियो।",
        variant: "default",
      });
      fetchCartItems();
    }
  };

  const filteredBooks = selectedGenre === "सबै" 
    ? books 
    : books.filter(book => book.genre === selectedGenre);

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header
        user={user}
        cartItemCount={cartItems.length}
        onAuthClick={() => setShowAuthModal(true)}
        onCartClick={() => setShowCart(true)}
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            नेपाली पुस्तकहरूको सबैभन्दा ठूलो संग्रह
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            घरमै बसेर नेपाली साहित्यका उत्कृष्ट पुस्तकहरू अर्डर गर्नुहोस्। केवल कैश अन डेलिभरी!
          </p>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">विधा अनुसार खोज्नुहोस्:</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "warm" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="shadow-card hover:shadow-warm transition-shadow">
              <CardHeader className="pb-3">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                <p className="text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="secondary">{book.genre}</Badge>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      रू. {book.price}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(book.id)}
                      disabled={book.stock_quantity === 0}
                    >
                      <Plus className="h-4 w-4" />
                      कार्टमा थप्नुहोस्
                    </Button>
                  </div>
                  {book.stock_quantity === 0 && (
                    <p className="text-sm text-destructive">स्टकमा छैन</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">कुनै पुस्तक फेला परेन</h3>
            <p className="text-muted-foreground">यस विधामा कुनै पुस्तक उपलब्ध छैन।</p>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Index;
