import { motion } from 'framer-motion';

const FloatingOrb = ({ 
  size, 
  color, 
  initialX, 
  initialY, 
  duration,
  delay = 0 
}: { 
  size: number; 
  color: string; 
  initialX: string; 
  initialY: string; 
  duration: number;
  delay?: number;
}) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{
      width: size,
      height: size,
      background: color,
      left: initialX,
      top: initialY,
    }}
    animate={{
      x: [0, 100, -50, 80, 0],
      y: [0, -80, 60, -40, 0],
      scale: [1, 1.2, 0.9, 1.1, 1],
      opacity: [0.4, 0.6, 0.3, 0.5, 0.4],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

const FloatingShape = ({ 
  size, 
  borderColor, 
  initialX, 
  initialY, 
  duration,
  delay = 0,
  rotate = true
}: { 
  size: number; 
  borderColor: string; 
  initialX: string; 
  initialY: string; 
  duration: number;
  delay?: number;
  rotate?: boolean;
}) => (
  <motion.div
    className="absolute rounded-full border opacity-20"
    style={{
      width: size,
      height: size,
      borderColor,
      left: initialX,
      top: initialY,
    }}
    animate={{
      x: [0, 50, -30, 40, 0],
      y: [0, -40, 30, -20, 0],
      rotate: rotate ? [0, 180, 360] : 0,
      scale: [1, 1.1, 0.95, 1.05, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

const GridPattern = () => (
  <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  </div>
);

const GlowingDot = ({ 
  x, 
  y, 
  delay,
  size = 4 
}: { 
  x: string; 
  y: string; 
  delay: number;
  size?: number;
}) => (
  <motion.div
    className="absolute rounded-full bg-primary"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      boxShadow: '0 0 20px hsl(var(--primary))',
    }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0.5, 1.5, 0.5],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      {/* Animated mesh gradient overlay */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, hsla(var(--primary) / 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 80%, hsla(var(--accent) / 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 50% 50%, hsla(280, 70%, 60%, 0.06) 0%, transparent 60%)
          `,
        }}
        animate={{
          opacity: [1, 0.8, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating orbs */}
      <FloatingOrb
        size={600}
        color="radial-gradient(circle, hsla(var(--primary) / 0.15) 0%, transparent 70%)"
        initialX="5%"
        initialY="10%"
        duration={20}
      />
      <FloatingOrb
        size={500}
        color="radial-gradient(circle, hsla(var(--accent) / 0.12) 0%, transparent 70%)"
        initialX="60%"
        initialY="60%"
        duration={18}
        delay={2}
      />
      <FloatingOrb
        size={400}
        color="radial-gradient(circle, hsla(280, 70%, 60%, 0.1) 0%, transparent 70%)"
        initialX="70%"
        initialY="10%"
        duration={22}
        delay={4}
      />
      <FloatingOrb
        size={350}
        color="radial-gradient(circle, hsla(var(--primary) / 0.1) 0%, transparent 70%)"
        initialX="20%"
        initialY="70%"
        duration={16}
        delay={1}
      />

      {/* Floating ring shapes */}
      <FloatingShape
        size={300}
        borderColor="hsl(var(--primary))"
        initialX="10%"
        initialY="30%"
        duration={25}
        delay={0}
      />
      <FloatingShape
        size={200}
        borderColor="hsl(var(--accent))"
        initialX="75%"
        initialY="25%"
        duration={20}
        delay={3}
      />
      <FloatingShape
        size={250}
        borderColor="hsl(var(--primary))"
        initialX="60%"
        initialY="70%"
        duration={22}
        delay={1}
      />
      <FloatingShape
        size={150}
        borderColor="hsl(var(--accent))"
        initialX="30%"
        initialY="80%"
        duration={18}
        delay={5}
      />

      {/* Grid pattern */}
      <GridPattern />

      {/* Glowing dots scattered around */}
      <GlowingDot x="15%" y="25%" delay={0} />
      <GlowingDot x="85%" y="15%" delay={1} />
      <GlowingDot x="45%" y="75%" delay={2} />
      <GlowingDot x="75%" y="55%" delay={0.5} />
      <GlowingDot x="25%" y="65%" delay={1.5} />
      <GlowingDot x="90%" y="80%" delay={2.5} />
      <GlowingDot x="5%" y="90%" delay={0.8} />
      <GlowingDot x="55%" y="35%" delay={1.8} />
      <GlowingDot x="35%" y="15%" delay={2.2} />
      <GlowingDot x="65%" y="90%" delay={0.3} />

      {/* Moving gradient line */}
      <motion.div
        className="absolute h-[1px] w-[200px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        style={{ top: '30%', left: '-200px' }}
        animate={{
          x: ['0vw', '120vw'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 4,
        }}
      />
      <motion.div
        className="absolute h-[1px] w-[150px] bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        style={{ top: '60%', left: '-150px' }}
        animate={{
          x: ['0vw', '120vw'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
          delay: 3,
          repeatDelay: 5,
        }}
      />
      <motion.div
        className="absolute w-[1px] h-[150px] bg-gradient-to-b from-transparent via-primary/30 to-transparent"
        style={{ left: '20%', top: '-150px' }}
        animate={{
          y: ['0vh', '120vh'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
          repeatDelay: 6,
        }}
      />

      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)',
          opacity: 0.4,
        }}
      />
    </div>
  );
}