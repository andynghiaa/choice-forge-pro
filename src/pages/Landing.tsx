import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { 
  Vote, 
  Brain, 
  Shield, 
  Users, 
  Trophy, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="info" className="mb-6 animate-fade-in">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered • Blockchain-Verified
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Decentralized Voting with{' '}
              <span className="gradient-text">AI Intelligence</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Create voting rooms, collect community evaluations, and let AI determine the winner. 
              Every result is permanently recorded on the Hedera blockchain.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Start Voting Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/leaderboard">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A transparent, fair, and verifiable voting system powered by cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Create a Room',
                description: 'Set up a voting room with custom criteria and add candidates for evaluation.',
                step: '01'
              },
              {
                icon: Vote,
                title: 'Collect Votes',
                description: 'Invite participants to vote and submit their text evaluations.',
                step: '02'
              },
              {
                icon: Brain,
                title: 'AI Analysis',
                description: 'Our AI processes all evaluations and scores each candidate 0-100.',
                step: '03'
              },
              {
                icon: Shield,
                title: 'Blockchain Proof',
                description: 'The winner is recorded on Hedera with immutable verification.',
                step: '04'
              }
            ].map((feature, i) => (
              <Card 
                key={i} 
                variant="glass" 
                className="relative group hover:-translate-y-2 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="absolute top-4 right-4 text-4xl font-display font-bold text-primary/10">
                    {feature.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="success" className="mb-4">Why VoteChain?</Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Fair, Transparent, and{' '}
                <span className="gradient-text">Unstoppable</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Traditional voting systems are opaque and easily manipulated. VoteChain 
                combines AI fairness with blockchain immutability to create the most 
                trustworthy voting platform.
              </p>

              <ul className="space-y-4">
                {[
                  'AI evaluates all feedback objectively',
                  'Blockchain records are permanent and tamper-proof',
                  'Real-time vote tracking with live updates',
                  'Transparent scoring methodology',
                  'Global leaderboard for competitive rooms'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <Card variant="gradient" className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rooms Created</p>
                      <p className="text-3xl font-display font-bold">1,247</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Vote className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-4 border-b border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Votes Cast</p>
                      <p className="text-3xl font-display font-bold">48,392</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <Users className="w-7 h-7 text-accent" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Blockchain Records</p>
                      <p className="text-3xl font-display font-bold">892</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-7 h-7 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </Card>

              <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <Card variant="glow" className="max-w-3xl mx-auto text-center p-12">
            <Zap className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Start?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Create your first voting room in seconds. No credit card required.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?mode=signup">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 VoteChain. AI-Powered Voting with Blockchain Verification.</p>
        </div>
      </footer>
    </Layout>
  );
}
