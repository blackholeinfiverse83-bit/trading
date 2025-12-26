import { useEffect, useState, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

const UniGuruBackground = () => {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles - matching Uni-Guru exactly (darker, more subtle)
    const particleCount = 100;
    const particles: Particle[] = [];

    // Much darker, more subtle colors to match Uni-Guru
    const colors = [
      'rgba(147, 51, 234, 0.3)',   // Purple - subtle
      'rgba(124, 58, 237, 0.25)',  // Violet - subtle
      'rgba(37, 99, 235, 0.25)',   // Blue - subtle
      'rgba(59, 130, 246, 0.2)',   // Light Blue - very subtle
      'rgba(168, 85, 247, 0.25)',  // Light Purple - subtle
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    particlesRef.current = particles;

    // Animation loop
    const animate = () => {
      // Clear with deep purple-black background (matching Uni-Guru exactly: rgb(27, 7, 37))
      ctx.fillStyle = '#1b0725'; // rgb(27, 7, 37) - exact match
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw very subtle gradient orbs first (behind particles) - matching Uni-Guru
      const time = Date.now() * 0.0005;
      
      // Purple orb - top left area - very subtle
      const purpleGradient = ctx.createRadialGradient(
        canvas.width * 0.15 + Math.sin(time) * 20,
        canvas.height * 0.25 + Math.cos(time) * 20,
        0,
        canvas.width * 0.15 + Math.sin(time) * 20,
        canvas.height * 0.25 + Math.cos(time) * 20,
        600
      );
      purpleGradient.addColorStop(0, 'rgba(147, 51, 234, 0.06)');
      purpleGradient.addColorStop(0.3, 'rgba(124, 58, 237, 0.03)');
      purpleGradient.addColorStop(0.6, 'rgba(147, 51, 234, 0.015)');
      purpleGradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = purpleGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue orb - bottom right area - very subtle
      const blueGradient = ctx.createRadialGradient(
        canvas.width * 0.85 + Math.cos(time * 0.6) * 20,
        canvas.height * 0.75 + Math.sin(time * 0.6) * 20,
        0,
        canvas.width * 0.85 + Math.cos(time * 0.6) * 20,
        canvas.height * 0.75 + Math.sin(time * 0.6) * 20,
        600
      );
      blueGradient.addColorStop(0, 'rgba(37, 99, 235, 0.05)');
      blueGradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.025)');
      blueGradient.addColorStop(0.6, 'rgba(37, 99, 235, 0.01)');
      blueGradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = blueGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center very subtle orb
      const centerGradient = ctx.createRadialGradient(
        canvas.width * 0.5 + Math.sin(time * 0.8) * 15,
        canvas.height * 0.5 + Math.cos(time * 0.8) * 15,
        0,
        canvas.width * 0.5 + Math.sin(time * 0.8) * 15,
        canvas.height * 0.5 + Math.cos(time * 0.8) * 15,
        500
      );
      centerGradient.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
      centerGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)');
      centerGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with subtle glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        
        // Create subtle glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        const baseColor = particle.color;
        gradient.addColorStop(0, baseColor.replace(/[\d.]+(?=\))/, particle.opacity.toString()));
        gradient.addColorStop(0.5, baseColor.replace(/[\d.]+(?=\))/, (particle.opacity * 0.4).toString()));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw very subtle connections between nearby particles
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const alpha = 0.08 * (1 - distance / 120);
            ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ 
        backgroundColor: '#1b0725', // Deep purple-black matching Uni-Guru exactly: rgb(27, 7, 37)
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundColor: '#1b0725',
        }}
      />
      {/* Uni-Guru Text Watermark - very subtle */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 'clamp(10rem, 22vw, 28rem)',
          fontWeight: 100,
          letterSpacing: '0.2em',
          color: 'rgba(147, 51, 234, 0.015)', // Very subtle
          textTransform: 'uppercase',
          userSelect: 'none',
          transform: 'rotate(-5deg)',
          textShadow: 'none',
          pointerEvents: 'none',
        }}
      >
        UNI-GURU
      </div>
    </div>
  );
};

export default UniGuruBackground;
