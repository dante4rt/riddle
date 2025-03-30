"use client";

import { useEffect, useRef } from "react";
import { WalletAuth } from "../components/wallet-auth";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  dx: number;
  dy: number;
  life: number;
}

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const savedVerification = localStorage.getItem("walletAuth");
    if (isConnected && savedVerification) {
      const parsed = JSON.parse(savedVerification);
      if (parsed.verified) {
        router.push("/game");
      }
    }
  }, [isConnected, router]);

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

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      dx: (Math.random() - 0.5) * 3,
      dy: (Math.random() - 0.5) * 3,
      life: Math.random() * 100 + 50,
    });

    const drawParticle = (particle: Particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 150;
      ctx.fill();
      ctx.closePath();
    };

    const updateParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 1;

        if (p.x - p.radius < 0 || p.x + p.radius > canvas.width) p.dx *= -1;
        if (p.y - p.radius < 0 || p.y + p.radius > canvas.height) p.dy *= -1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      if (particles.length < 150 && Math.random() > 0.9) {
        particles.push(createParticle());
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(drawParticle);
      updateParticles();
      requestAnimationFrame(animateParticles);
    };

    resizeCanvas();
    for (let i = 0; i < 50; i++) particles.push(createParticle());
    animateParticles();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const title = document.getElementById("welcome-title");
    if (!title) return;

    let angle = 0;
    const animateTitle = () => {
      angle += 0.05;
      const bounce = Math.sin(angle) * 10;
      const rotate = Math.sin(angle * 0.5) * 5;
      title.style.transform = `translateY(${bounce}px) rotate(${rotate}deg)`;
      requestAnimationFrame(animateTitle);
    };
    animateTitle();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-24 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center">
        <h1
          id="welcome-title"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6 drop-shadow-[0_3px_6px_rgba(0,0,0,0.2)] bg-gradient-to-r from-[#cfaeff] via-[#a8d5ff] to-[#ffcbc1] bg-clip-text text-transparent"
        >
          Riddle – Web3 Wordle Adventure
        </h1>
        <p className="text-base sm:text-lg md:text-xl max-w-xs sm:max-w-md animate-fade-in text-gray-700 font-medium leading-relaxed">
          Crack the code, unlock the blockchain fun! Connect below to play.
        </p>
        <div className="mt-4 sm:mt-6">
          <WalletAuth />
        </div>
      </div>
    </main>
  );
}
