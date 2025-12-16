import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection';
import { 
  Vote, 
  Brain, 
  Shield, 
  Users, 
  Trophy, 
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react';

export default function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        {/* Animated orbs */}
        <motion.div 
          className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-[100px]"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-accent/20 to-primary/20 blur-[100px]"
          animate={{ 
            x: [0, -40, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                AI-Powered • Blockchain-Verified
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              The Future of{' '}
              <span className="gradient-text">Transparent</span>
              <br className="hidden sm:block" />
              {' '}and <span className="gradient-text">Fair Voting</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Create rooms, gather community opinions, and let AI determine winners with complete transparency. 
              Every result is immutably recorded on the blockchain.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/auth?mode=signup">
                  Start Voting Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/leaderboard">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </Link>
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div 
              className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span>Hedera Blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span>AI-Powered Analysis</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-20">
            <Badge variant="outline" className="mb-4 px-4 py-2">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Simple. Transparent. <span className="gradient-text">Powerful.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A revolutionary voting system that combines AI intelligence with blockchain immutability
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Create a Room',
                description: 'Set up your voting room with custom evaluation criteria and add candidates.',
                step: '01',
                gradient: 'from-violet-500 to-purple-500'
              },
              {
                icon: Vote,
                title: 'Collect Votes',
                description: 'Share your room link and let participants vote with detailed evaluations.',
                step: '02',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Brain,
                title: 'AI Analysis',
                description: 'Our AI processes all feedback and scores candidates 0-100 based on criteria.',
                step: '03',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Shield,
                title: 'Blockchain Proof',
                description: 'Results are permanently recorded on Hedera with verifiable transaction IDs.',
                step: '04',
                gradient: 'from-indigo-500 to-blue-500'
              }
            ].map((feature, i) => (
              <AnimatedItem key={i} index={i}>
                <Card 
                  variant="glass" 
                  className="relative group hover:-translate-y-3 transition-all duration-500 h-full overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardContent className="p-8 relative">
                    <div className="absolute top-6 right-6 text-5xl font-display font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                      {feature.step}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-[150px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <Badge variant="outline" className="mb-6 px-4 py-2">Why Chain2Vote?</Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                Fair, Transparent, and{' '}
                <span className="gradient-text">Unstoppable</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Traditional voting systems are opaque and easily manipulated. Chain2Vote 
                combines AI fairness with blockchain immutability to create the most
                trustworthy voting platform ever built.
              </p>

              <ul className="space-y-5">
                {[
                  'AI evaluates all feedback objectively without bias',
                  'Blockchain records are permanent and tamper-proof',
                  'Real-time vote tracking with live updates',
                  'Transparent scoring methodology visible to all',
                  'Global leaderboard for competitive rooms'
                ].map((benefit, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                <Card variant="gradient" className="p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
                  <div className="space-y-8 relative">
                    <motion.div 
                      className="flex items-center justify-between pb-6 border-b border-border/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Rooms Created</p>
                        <p className="text-4xl font-display font-bold gradient-text">1,247</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Vote className="w-8 h-8 text-primary" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center justify-between pb-6 border-b border-border/50"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Votes Cast</p>
                        <p className="text-4xl font-display font-bold gradient-text">48,392</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-accent" />
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center justify-between"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Blockchain Records</p>
                        <p className="text-4xl font-display font-bold gradient-text">892</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-emerald-500" />
                      </div>
                    </motion.div>
                  </div>
                </Card>

                <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-[80px] rounded-3xl scale-110" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-24 bg-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">Trusted Platform</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From team decisions to community contests, Chain2Vote handles it all
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Team Decisions',
                description: 'Perfect for selecting project names, design options, or team awards with full transparency.',
                icon: Users,
              },
              {
                title: 'Community Contests',
                description: 'Run fair competitions where the community decides winners based on clear criteria.',
                icon: Trophy,
              },
              {
                title: 'Research Surveys',
                description: 'Gather opinions and let AI analyze feedback for unbiased insights.',
                icon: BarChart3,
              },
            ].map((item, i) => (
              <AnimatedItem key={i} index={i}>
                <Card variant="glass" className="p-8 h-full group hover:border-primary/30 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-[150px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <Card variant="glow" className="max-w-4xl mx-auto text-center p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-primary/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full border border-accent/20"
              />
              
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Zap className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                  Ready to Transform Your Voting?
                </h2>
                <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
                  Create your first voting room in seconds. No credit card required. 
                  Start making fair, transparent decisions today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="xl" asChild className="group">
                    <Link to="/auth?mode=signup">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button variant="glass" size="xl" asChild>
                    <Link to="/leaderboard">
                      Explore Rooms
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Vote className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">Chain2Vote</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Chain2Vote. AI-Powered Voting with Blockchain Verification.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
