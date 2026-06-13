"use client";

import Image from "next/image";

export default function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes drift {
          0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
          33%  { transform: translate(-15px, 20px) rotate(2deg) scale(1.04); }
          66%  { transform: translate(10px, -12px) rotate(-1.5deg) scale(0.97); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        }
        .linhas-bg {
          animation: drift 18s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.18 }}>
        <div className="linhas-bg absolute inset-[-10%] w-[120%] h-[120%]">
          <Image src="/linhas-movimento.png" alt="" fill className="object-cover object-center" />
        </div>
      </div>
    </>
  );
}
