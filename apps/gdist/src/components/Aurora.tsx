import { useEffect, useRef } from "react";

const Aurora = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.6,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.002 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));

    // Mountain silhouette points
    const mountainPoints = [
      [0, 0.92], [0.05, 0.88], [0.1, 0.82], [0.15, 0.78], [0.18, 0.72],
      [0.22, 0.76], [0.25, 0.73], [0.3, 0.68], [0.33, 0.72], [0.37, 0.65],
      [0.4, 0.7], [0.42, 0.74], [0.45, 0.69], [0.48, 0.62], [0.5, 0.66],
      [0.53, 0.7], [0.55, 0.72], [0.58, 0.66], [0.6, 0.6], [0.63, 0.64],
      [0.65, 0.68], [0.68, 0.72], [0.7, 0.67], [0.73, 0.63], [0.75, 0.58],
      [0.78, 0.62], [0.8, 0.66], [0.82, 0.7], [0.85, 0.74], [0.88, 0.78],
      [0.92, 0.82], [0.95, 0.86], [1, 0.9],
    ];

    const waves = [
      { color: [0, 255, 136], speed: 0.00015, amplitude: 80, yOffset: 0.35, width: 0.55, opacity: 0.25, phaseOffset: 0 },
      { color: [139, 92, 246], speed: 0.00012, amplitude: 100, yOffset: 0.4, width: 0.5, opacity: 0.18, phaseOffset: 2 },
      { color: [0, 204, 106], speed: 0.0002, amplitude: 70, yOffset: 0.32, width: 0.45, opacity: 0.2, phaseOffset: 4 },
      { color: [168, 85, 247], speed: 0.00018, amplitude: 90, yOffset: 0.45, width: 0.6, opacity: 0.12, phaseOffset: 1 },
      { color: [6, 182, 212], speed: 0.00025, amplitude: 60, yOffset: 0.38, width: 0.4, opacity: 0.15, phaseOffset: 3 },
      { color: [0, 255, 136], speed: 0.0001, amplitude: 110, yOffset: 0.3, width: 0.65, opacity: 0.1, phaseOffset: 5 },
    ];

    const draw = (timestamp: number) => {
      time = timestamp;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Deep dark navy base
      ctx.fillStyle = "#050D1A";
      ctx.fillRect(0, 0, w, h);

      // Stars
      for (const star of stars) {
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * star.speed + star.phase));
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aurora waves
      for (const wave of waves) {
        const t = time * wave.speed + wave.phaseOffset;
        const centerY = h * wave.yOffset + Math.sin(t * 0.7) * wave.amplitude * 0.3;
        const centerX = w * 0.5 + Math.sin(t * 0.5) * w * 0.15;

        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, w * wave.width
        );

        const [r, g, b] = wave.color;
        gradient.addColorStop(0, `rgba(${r},${g},${b},${wave.opacity})`);
        gradient.addColorStop(0.3, `rgba(${r},${g},${b},${wave.opacity * 0.6})`);
        gradient.addColorStop(0.7, `rgba(${r},${g},${b},${wave.opacity * 0.2})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.sin(t * 0.3) * 0.12);
        ctx.scale(1, 0.5 + Math.sin(t * 0.4) * 0.15);
        ctx.translate(-centerX, -centerY);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Mountain silhouettes
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (const [px, py] of mountainPoints) {
        ctx.lineTo(px * w, py * h);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Bottom gradient fade for text readability
      const bottomGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
      bottomGrad.addColorStop(0, "rgba(5, 13, 26, 0)");
      bottomGrad.addColorStop(1, "rgba(5, 13, 26, 0.8)");
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
};

export default Aurora;
