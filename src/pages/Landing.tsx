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
  BarChart3,
  Play
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Landing() {
  return (
    <Layout>
      {/* Noise overlay for texture */}
      <div className="noise-overlay" />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center pt-20">
        {/* Animated mesh background */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        
        {/* Animated floating orbs */}
        <motion.div 
          className="absolute top-20 left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/15 to-accent/10 blur-[120px] animate-morph"
          animate={{ 
            x: [0, 60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent/15 to-primary/10 blur-[120px] animate-morph"
          style={{ animationDelay: '-4s' }}
          animate={{ 
            x: [0, -50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-primary/8 to-transparent blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <motion.div 
            className="max-w-5xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge 
                variant="outline" 
                className="mb-8 px-5 py-2.5 text-sm border-primary/20 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 transition-colors cursor-default"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-medium">
                  AI-Powered • Blockchain-Verified
                </span>
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold mb-8 leading-[1.05] tracking-tight"
            >
              <span className="text-foreground">The Future of</span>
              <br />
              <span className="gradient-text text-shadow-glow">Transparent</span>
              <span className="text-foreground"> & </span>
              <span className="gradient-text-accent">Fair Voting</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Create voting rooms, gather community opinions, and let AI determine winners 
              with complete transparency. Every result is{' '}
              <span className="text-foreground font-medium">immutably recorded</span> on the blockchain.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button variant="hero" size="xl" asChild className="group min-w-[220px]">
                <Link to="/auth?mode=signup">
                  Start Voting Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild className="group min-w-[200px]">
                <Link to="/leaderboard">
                  <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  View Leaderboard
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              variants={itemVariants}
              className="mt-20 pt-12 border-t border-border/30"
            >
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-muted-foreground">
                {[
                  { icon: Lock, text: 'End-to-End Encrypted' },
                  { icon: Globe, text: 'Hedera Blockchain' },
                  { icon: Brain, text: 'AI-Powered Analysis' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-center gap-3 group cursor-default"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
            <motion.div 
              className="w-1.5 h-2.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/20 to-transparent" />
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-5 py-2.5 border-primary/20 bg-primary/5">
              <span className="text-muted-foreground">How It Works</span>
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
              Simple. Transparent.{' '}
              <span className="gradient-text">Powerful.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
              A revolutionary voting system that combines AI intelligence with blockchain immutability
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: Users,
                title: 'Create a Room',
                description: 'Set up your voting room with custom evaluation criteria and add candidates.',
                step: '01',
                gradient: 'from-violet-500 to-purple-600'
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
                gradient: 'from-indigo-500 to-blue-600'
              }
            ].map((feature, i) => (
              <AnimatedItem key={i} index={i}>
                <Card 
                  variant="interactive" 
                  className="relative group h-full overflow-hidden bg-card/80 backdrop-blur-sm"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`} />
                  <CardContent className="p-8 relative">
                    <div className="absolute top-6 right-6 text-6xl font-display font-bold text-primary/[0.06] group-hover:text-primary/[0.12] transition-colors duration-500">
                      {feature.step}
                    </div>
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-0 w-[700px] h-[700px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/8 to-accent/8 blur-[150px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <AnimatedSection direction="left">
              <Badge variant="outline" className="mb-6 px-5 py-2.5 border-primary/20 bg-primary/5">
                <span className="text-muted-foreground">Why Chain2Vote?</span>
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-8 leading-tight tracking-tight">
                Fair, Transparent, and{' '}
                <span className="gradient-text">Unstoppable</span>
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed">
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
                    className="flex items-center gap-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                    </motion.div>
                    <span className="text-lg group-hover:text-foreground transition-colors">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                <Card variant="premium" className="p-10 lg:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl" />
                  
                  <div className="space-y-8 relative">
                    {[
                      { label: 'Total Rooms Created', value: '1,247', icon: Vote, gradient: 'from-primary/15 to-accent/15' },
                      { label: 'Votes Cast', value: '48,392', icon: BarChart3, gradient: 'from-blue-500/15 to-cyan-500/15' },
                      { label: 'Blockchain Records', value: '892', icon: Shield, gradient: 'from-emerald-500/15 to-teal-500/15' },
                    ].map((stat, i) => (
                      <motion.div 
                        key={i}
                        className={`flex items-center justify-between ${i < 2 ? 'pb-8 border-b border-border/40' : ''}`}
                        whileHover={{ scale: 1.02, x: 4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                          <p className="text-4xl lg:text-5xl font-display font-bold gradient-text">{stat.value}</p>
                        </div>
                        <div className={`w-16 h-16 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                          <stat.icon className="w-8 h-8 text-primary" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                <div className="absolute -z-10 inset-0 bg-gradient-to-r from-primary/15 to-accent/15 blur-[100px] rounded-3xl scale-110" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-5 py-2.5 border-primary/20 bg-primary/5">
              <span className="text-muted-foreground">Use Cases</span>
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
              From team decisions to community contests, Chain2Vote handles it all
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Team Decisions',
                description: 'Perfect for selecting project names, design options, or team awards with full transparency.',
                icon: Users,
                color: 'from-violet-500 to-purple-600'
              },
              {
                title: 'Community Contests',
                description: 'Run fair competitions where the community decides winners based on clear criteria.',
                icon: Trophy,
                color: 'from-amber-500 to-orange-500'
              },
              {
                title: 'Research Surveys',
                description: 'Gather opinions and let AI analyze feedback for unbiased insights.',
                icon: BarChart3,
                color: 'from-emerald-500 to-teal-500'
              },
            ].map((item, i) => (
              <AnimatedItem key={i} index={i}>
                <Card variant="glass" className="p-8 h-full group hover:border-primary/30 bg-card/60">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="font-display font-semibold text-xl mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3" />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/8 to-transparent blur-[150px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection>
            <Card variant="premium" className="max-w-4xl mx-auto text-center p-12 md:p-20 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full border border-primary/10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full border border-accent/10"
              />
              
              <div className="relative">
                <motion.div 
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-10 shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 10 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-12 h-12 text-primary-foreground" />
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">
                  Ready to Transform Your Voting?
                </h2>
                <p className="text-muted-foreground mb-12 max-w-xl mx-auto text-lg md:text-xl leading-relaxed">
                  Create your first voting room in seconds. No credit card required. 
                  Start making fair, transparent decisions today.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="xl" asChild className="group min-w-[220px]">
                    <Link to="/auth?mode=signup">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </Button>
                  <Button variant="glass" size="xl" asChild className="min-w-[180px]">
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
      <footer className="border-t border-border/30 py-16 relative bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8 text-center">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Vote className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Chain2Vote</span>
            </motion.div>
            
            <p className="text-muted-foreground text-sm max-w-md">
              AI-Powered Voting with Blockchain Verification. Making decisions fair, transparent, and tamper-proof.
            </p>
            
            <div className="flex gap-8 text-sm">
              {['Privacy', 'Terms', 'Contact'].map((link) => (
                <Link 
                  key={link}
                  to="#" 
                  className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  {link}
                </Link>
              ))}
            </div>
            
            <p className="text-muted-foreground/60 text-xs">
              © 2024 Chain2Vote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}