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
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
      {/* Modern glass morphism background */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-primary/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/8 rounded-2xl" />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="relative px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobileMenu}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
            <Vote className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300">Chain2Vote</span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <Link to="/leaderboard" className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          {user && (
            <Link to="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate max-w-28">
                    {user.email}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="rounded-lg text-sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" className="rounded-lg text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-8 w-8 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden transition-all duration-300 shadow-2xl",
        mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
      )}>
        <div className="p-3 space-y-1">
          <Link 
            to="/leaderboard" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={closeMobileMenu}
          >
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Leaderboard</span>
          </Link>
          
          {user && (
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors"
              onClick={closeMobileMenu}
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          )}
          
          <div className="pt-2 mt-2 border-t border-border/50">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </span>
                </div>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/auth" onClick={closeMobileMenu}>Sign In</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-primary to-accent" asChild>
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
