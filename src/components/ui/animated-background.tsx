import { useEffect } from "react";

interface AnimatedBackgroundProps {
  isDarkMode?: boolean;
}

// Reusable canvas particle background extracted from animated-sign-in.
// Renders at position:fixed z-0 — always behind content (AppHeader is z-50).
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isDarkMode = true }) => {
  useEffect(() => {
    const canvas = document.getElementById("auth-bg-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      size = Math.random() * 3 + 1;
      speedX = (Math.random() - 0.5) * 0.5;
      speedY = (Math.random() - 0.5) * 0.5;
      color = isDarkMode
        ? `rgba(255,255,255,${Math.random() * 0.18})`
        : `rgba(193,0,58,${Math.random() * 0.15})`;

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
    const particles = Array.from({ length: count }, () => new Particle());

    let animId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [isDarkMode]);

  return (
    <canvas
      id="auth-bg-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;
