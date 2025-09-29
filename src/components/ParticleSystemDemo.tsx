import React, { useState, useEffect, useRef } from 'react';

const ParticleSystemDemo = ({ wasm, ParticleSystem }) => {
  const [particleSystem, setParticleSystem] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (wasm && canvas) {
      console.log('canvasRef.current', canvas, wasm);
      
      // 检查 wasm 对象及其方法
      console.log('wasm object:', wasm);
     // console.log('ParticleSystem available:', typeof wasm.ParticleSystem);
     console.log('ParticleSystem', ParticleSystem);

     try {
       // Always use 'new' keyword with class constructors
       const system = new ParticleSystem(canvas.width, canvas.height);
       setParticleSystem(system);
     } catch (error) {
       console.error('Error creating ParticleSystem:', error);
     }
      
      // 检查是否是函数而不是构造函数
/*       if (typeof wasm.ParticleSystem === 'function') {
        try {
          const system = new wasm.ParticleSystem(canvas.width, canvas.height);
          setParticleSystem(system);
        } catch (error) {
          console.error('Error creating ParticleSystem:', error);
          
          // 尝试作为普通函数调用
          try {
            const system = wasm.ParticleSystem(canvas.width, canvas.height);
            setParticleSystem(system);
          } catch (innerError) {
            console.error('Error calling ParticleSystem as function:', innerError);
          }
        }
      } else if (wasm.ParticleSystem) {
        // 可能是已经实例化的对象
        setParticleSystem(wasm.ParticleSystem);
      } else {
        console.log('ParticleSystem=',ParticleSystem)
        console.error('ParticleSystem not found in wasm module');
      } */
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [wasm]);

  const startSimulation = () => {
    if (!particleSystem || isRunning) return;
    
    setIsRunning(true);
    
    const animate = (timestamp) => {
      if (!isRunning) return;
      
      // 随机添加新粒子
      if (Math.random() < 0.3) {
        const x = Math.random() * canvasRef.current.width;
        const vx = (Math.random() - 0.5) * 200;
        const vy = -Math.random() * 200 - 100;
        const life = 2 + Math.random() * 3;
        
        particleSystem.add_particle(x, canvasRef.current.height - 10, vx, vy, life);
      }
      
      // 更新粒子系统
      particleSystem.update(1/60);
      setParticleCount(particleSystem.get_particle_count());
      
      // 渲染粒子
      renderParticles();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const renderParticles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 清除画布
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!particleSystem) return;
    
    const particles = particleSystem.get_particles();
    
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
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const explode = () => {
    if (!particleSystem) return;
    
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * 2 * Math.PI;
      const speed = 100 + Math.random() * 150;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      particleSystem.add_particle(centerX, centerY, vx, vy, 3);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>物理粒子系统</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={startSimulation} disabled={isRunning}>
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