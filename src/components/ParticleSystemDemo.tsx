import React, { useState, useEffect, useRef } from 'react';
import { ParticleSystem as wasmParticleSystem } from '../pkg/my_wasm_lib';

interface WasmModule {
  // 根据实际的 wasm 模块结构定义类型
  [key: string]: any;
}

const ParticleSystemDemo = ({ wasm }: { wasm: WasmModule }) => {
  const [particleSystem, setParticleSystem] = useState<InstanceType<typeof wasmParticleSystem> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (wasm && canvas) {
      console.log('canvasRef.current', canvas, wasm);
      console.log('wasm keys:', Object.keys(wasm));

      try {
        const system = new wasmParticleSystem(canvas.width, canvas.height);
        setParticleSystem(system);
        console.log('ParticleSystem created:', system);
        console.log('particleSystem methods:', Object.keys(system));
        console.log('particleSystem prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(system)));
      } catch (error) {
        console.error('Error creating ParticleSystem:', error);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [wasm]);

  const startSimulation = () => {
    if (!particleSystem || isRunning || !canvasRef.current) return;
    // console.log('Starting particle system'); // 生产环境下应删除或由环境开关控制
    setIsRunning(true);
  
    const animate = () => {
      if ( !particleSystem || !canvasRef.current) return;
  
      // 随机添加新粒子
      if (Math.random() < 0.3) {
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;
  
        const x = Math.random() * width;
        const vx = (Math.random() - 0.5) * 200;
        const vy = -Math.random() * 200 - 100;
        const life = 2 + Math.random() * 3;
  
        particleSystem.addParticle(x, height - 10, vx, vy, life);
      }
  
      // 更新粒子系统
      particleSystem.update(1 / 60);
      setParticleCount(particleSystem.getParticleCount());
  
      // 渲染粒子
      renderParticles();
      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
  
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    clearCanvas();
  };

  const renderParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas || !particleSystem) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除画布
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const particles = particleSystem.getParticles();
    
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      
      // 根据生命周期设置颜色（从红色到黄色）
      const lifeRatio = particle.life;
      const r = 255;
      const g = Math.floor(255 * lifeRatio);
      const b = 0;
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制粒子轨迹
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 8, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const explode = () => {
    if (!particleSystem || !canvasRef.current) return;
    
    const PARTICLE_COUNT = 50;
    const BASE_SPEED = 100;
    const SPEED_RANGE = 150;
    const PARTICLE_LIFETIME = 3;
    const TWO_PI = 2 * Math.PI;
    
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * TWO_PI;
      const speed = BASE_SPEED + Math.random() * SPEED_RANGE;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      particleSystem.addParticle(centerX, centerY, vx, vy, PARTICLE_LIFETIME);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>物理粒子系统</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={startSimulation} disabled={isRunning || !particleSystem}>
          启动粒子系统
        </button>
        <button onClick={stopSimulation} disabled={!isRunning}>
          停止
        </button>
        <button onClick={explode} disabled={!particleSystem}>
          创建爆炸
        </button>
        <button onClick={clearCanvas}>
          清除画布
        </button>
      </div>
      
      <p>粒子数量: {particleCount}</p>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{ border: '1px solid #ccc', background: 'white' }}
      />
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>说明：</p>
        <ul>
          <li>红色粒子表示新创建的粒子</li>
          <li>黄色粒子表示即将消失的粒子</li>
          <li>粒子会受到重力影响</li>
          <li>粒子与边界会发生碰撞</li>
        </ul>
      </div>
    </div>
  );
};

export default ParticleSystemDemo;