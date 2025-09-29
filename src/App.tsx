import React from 'react';
import './App.css';
import { useWasm } from './hooks/useWasm';
import PerformanceDemo from './components/PerformanceDemo';
import ImageProcessingDemo from './components/ImageProcessingDemo';
import MachineLearningDemo from './components/MachineLearningDemo';
import ParticleSystemDemo from './components/ParticleSystemDemo';
import PerformanceMonitor from './components/PerformanceMonitor';
import ErrorBoundary from './components/ErrorBoundary';



function App() {

  const { wasm, loading, error } = useWasm();
  console.log('App 组件渲染', wasm, loading, error);
  console.log('wasm 模块', wasm);
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>React + WebAssembly 演示</h1>
          <p>正在加载 WebAssembly 模块...</p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>React + WebAssembly 演示</h1>
          <p style={{ color: 'red' }}>错误: {error}</p>
          <p>请确保已运行: <code>wasm-pack build --target web</code></p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + WebAssembly 从零开始</h1>
        <p>WebAssembly 模块已成功加载!</p>
        
        {wasm && (
          <div style={{ textAlign: 'left', maxWidth: '1200px', margin: '0 auto' }}>
            {/* 基础功能演示 */}
            <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
              <h3>基础功能测试</h3>
              <p>1 + 2 = {wasm.add(BigInt(1000000), BigInt(2000000))}</p> 
              <p>斐波那契(30) = {wasm.fibonacci(30)}</p> 
            </div>
            {/* 性能监控 */}
            <PerformanceMonitor wasm={wasm} />
            {/* 性能演示 */}
            <PerformanceDemo wasm={wasm} />
            {/* 图像处理 */}
            <ImageProcessingDemo wasm={wasm} />
            {/* 机器学习 */}
            <MachineLearningDemo wasm={wasm} />
            {/* 物理系统 */}
            <ErrorBoundary fallback={<div style={{ color: 'red' }}>物理系统演示出错</div>}>
              <ParticleSystemDemo wasm={wasm} />
            </ErrorBoundary>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
