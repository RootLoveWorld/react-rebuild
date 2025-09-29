import React, { useState, useEffect, useCallback } from 'react';

const PerformanceMonitor = ({ wasm }) => {
  const [metrics, setMetrics] = useState({
    jsExecutionTime: 0,
    wasmExecutionTime: 0,
    memoryUsage: 0,
    speedup: 1
  });
  const [testRunning, setTestRunning] = useState(false);

  // 性能测试：大规模矩阵运算
  const runPerformanceTest = useCallback(async () => {
    if (!wasm || testRunning) return;

    setTestRunning(true);
    
    const size = 200; // 200x200 矩阵
    const matrixSize = size * size;
    
    // 生成测试数据
    const matrixA = new Array(matrixSize).fill(0).map(() => Math.random());
    const matrixB = new Array(matrixSize).fill(0).map(() => Math.random());
    
    // JavaScript 版本性能测试
    const jsStart = performance.now();
    const jsResult = matrixMultiplyJS(matrixA, matrixB, size);
    const jsEnd = performance.now();
    
    // WebAssembly 版本性能测试
    const wasmStart = performance.now();
    const wasmResult = wasm.matrix_multiply(matrixA, matrixB, size);
    const wasmEnd = performance.now();
    
    const jsTime = jsEnd - jsStart;
    const wasmTime = wasmEnd - wasmStart;
    const speedup = jsTime / wasmTime;
    
    // 获取内存使用情况
    const memory = performance.memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : 0;
    
    setMetrics({
      jsExecutionTime: jsTime,
      wasmExecutionTime: wasmTime,
      memoryUsage,
      speedup
    });
    
    setTestRunning(false);
  }, [wasm, testRunning]);

  // JavaScript 矩阵乘法实现
  const matrixMultiplyJS = (a, b, size) => {
    const result = new Array(size * size).fill(0);
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          result[i * size + j] += a[i * size + k] * b[k * size + j];
        }
      }
    }
    
    return result;
  };

  // 自动运行性能测试
  useEffect(() => {
    if (wasm) {
      runPerformanceTest();
    }
  }, [wasm, runPerformanceTest]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>性能监控面板</h3>
      
      <button onClick={runPerformanceTest} disabled={testRunning}>
        {testRunning ? '测试中...' : '重新运行性能测试'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <div style={metricStyle}>
          <span>JavaScript 执行时间:</span>
          <span>{metrics.jsExecutionTime.toFixed(2)} ms</span>
        </div>
        
        <div style={metricStyle}>
          <span>WebAssembly 执行时间:</span>
          <span>{metrics.wasmExecutionTime.toFixed(2)} ms</span>
        </div>
        
        <div style={metricStyle}>
          <span>性能加速比:</span>
          <span style={{ color: metrics.speedup > 1 ? 'green' : 'red' }}>
            {metrics.speedup.toFixed(2)}x
          </span>
        </div>
        
        <div style={metricStyle}>
          <span>内存使用:</span>
          <span>{metrics.memoryUsage.toFixed(2)} MB</span>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h4>性能分析:</h4>
        {metrics.speedup > 2 ? (
          <p style={{ color: 'green' }}>
            ✅ WebAssembly 表现出优异的性能，适合计算密集型任务
          </p>
        ) : metrics.speedup > 1 ? (
          <p style={{ color: 'orange' }}>
            ⚠️ WebAssembly 有一定性能提升，建议在复杂场景下使用
          </p>
        ) : (
          <p style={{ color: 'red' }}>
            ❌ 在这个任务中 JavaScript 性能更好，考虑优化 Wasm 代码或使用 JavaScript
          </p>
        )}
      </div>
    </div>
  );
};

const metricStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '5px 0',
  borderBottom: '1px solid #eee'
};

export default PerformanceMonitor;