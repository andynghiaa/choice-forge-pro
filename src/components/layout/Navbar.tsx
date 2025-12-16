import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Vote, LogOut, User, LayoutDashboard, Trophy, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      {/* Floating glass effect background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl rounded-[32px] border border-border/30 shadow-xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-[32px]" />
      
      <div className="container mx-auto px-6 h-16 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
            <Vote className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Chain2Vote</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 hover:text-primary">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          {user && (
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 hover:text-primary">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/30">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate max-w-32">
                    {user.email}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 mt-2 mx-2 bg-background/95 backdrop-blur-2xl rounded-2xl border border-border/30 overflow-hidden transition-all duration-300",
        mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="container mx-auto px-4 py-4 space-y-3">
          <Link 
            to="/leaderboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            onClick={closeMobileMenu}
          >
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-medium">Leaderboard</span>
          </Link>
          
          {user && (
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              onClick={closeMobileMenu}
            >
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}
          
          <div className="pt-3 border-t border-border/30">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary/20">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth" onClick={closeMobileMenu}>Sign In</Link>
                </Button>
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/auth?mode=signup" onClick={closeMobileMenu}>Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
