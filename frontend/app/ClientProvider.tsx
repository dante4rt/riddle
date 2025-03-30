"use client";

import { useEffect, useRef } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Toaster } from "@/components/ui/sonner";
import { config } from "./services/wagmi/config";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    const colors = ["#b19cd9", "#77dd77", "#ffb347", "#aec6cf"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
      };
    };

    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      ctx.closePath();
    };

    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.dx;
        particle.y += particle.dy;

        if (particle.x - particle.radius < 0 || particle.x + particle.radius > canvas.width) {
          particle.dx *= -1;
        }
        if (particle.y - particle.radius < 0 || particle.y + particle.radius > canvas.height) {
          particle.dy *= -1;
        }
      });
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(drawParticle);
      updateParticles();
      requestAnimationFrame(animateParticles);
    };

    const initializeParticles = () => {
      for (let i = 0; i < 100; i++) {
        particles.push(createParticle());
      }
    };

    resizeCanvas();
    initializeParticles();
    animateParticles();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
          <div className="relative z-10">
            {children}
            <footer className="sticky bottom-0 z-20 bg-white bg-opacity-90 text-gray-700 text-center py-2 sm:py-3 text-xs sm:text-sm">
              © {currentYear} with ❤️ by{" "}
              <a href="https://ramadhvni.com/" target="_blank" rel="noopener noreferrer">
                Rama.
              </a>
            </footer>
            <Toaster richColors position="top-right" />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
