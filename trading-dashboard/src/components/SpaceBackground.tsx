import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    const numStars = 800;
    const stars: Star[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width - centerX,
        y: Math.random() * canvas.height - centerY,
        z: Math.random() * canvas.width,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    // Animation
    let speed = 0.5;
    
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // Darker slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      stars.forEach((star) => {
        star.z -= speed;

        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width - centerX;
          star.y = Math.random() * canvas.height - centerY;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / canvas.width) * star.radius * 2;
          const brightness = 1 - star.z / canvas.width;
          
          // Draw star with glow
          const gradient = ctx.createRadialGradient(px, py, 0, px, py, size * 2);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
          gradient.addColorStop(0.5, `rgba(150, 180, 255, ${brightness * 0.5})`);
          gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)' }}
    />
  );
}