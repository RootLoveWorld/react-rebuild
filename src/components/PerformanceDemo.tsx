import React, { useState, useCallback } from 'react';

const PerformanceDemo = ({ wasm }) => {
  const [jsTime, setJsTime] = useState(0);
  const [wasmTime, setWasmTime] = useState(0);
  const [result, setResult] = useState({ js: 0, wasm: 0 });
  const [matrixSize, setMatrixSize] = useState(100);

  // JavaScript 实现的斐波那契
  const fibonacciJS = useCallback((n) => {
    if (n <= 1) return n;
    return fibonacciJS(n - 1) + fibonacciJS(n - 2);
  }, []);

  // JavaScript 矩阵乘法
  const matrixMultiplyJS = useCallback((a, b, size) => {
    const result = new Array(size * size).fill(0);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          result[i * size + j] += a[i * size + k] * b[k * size + j];
        }
      }
    }
    return result;
  }, []);

  // 性能测试：斐波那契
  const testFibonacci = useCallback(() => {
    const n = 35;
    
    // 测试 JavaScript 版本
    const jsStart = performance.now();
    const jsResult = fibonacciJS(n);
    const jsEnd = performance.now();
    
    // 测试 WebAssembly 版本
    const wasmStart = performance.now();
    const wasmResult = wasm.fibonacci(n);
    const wasmEnd = performance.now();
    
    setResult({ js: jsResult, wasm: wasmResult });
    setJsTime(jsEnd - jsStart);
    setWasmTime(wasmEnd - wasmStart);
  }, [wasm, fibonacciJS]);

  // 性能测试：矩阵乘法
  const testMatrixMultiplication = useCallback(() => {
    const size = matrixSize;
    const a = new Array(size * size).fill(0).map((_, i) => Math.random());
    const b = new Array(size * size).fill(0).map((_, i) => Math.random());
    
    // 测试 JavaScript 版本
    const jsStart = performance.now();
    const jsResult = matrixMultiplyJS(a, b, size);
    const jsEnd = performance.now();
    
    // 测试 WebAssembly 版本
    const wasmStart = performance.now();
    const wasmResult = wasm.matrix_multiply(a, b, size);
    const wasmEnd = performance.now();
    
    setJsTime(jsEnd - jsStart);
    setWasmTime(wasmEnd - wasmStart);
  }, [wasm, matrixMultiplyJS, matrixSize]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>性能对比演示</h3>
      
      <div>
        <h4>斐波那契数列 (n=35)</h4>
        <button onClick={testFibonacci}>测试性能</button>
        <p>JavaScript 耗时: {jsTime.toFixed(2)}ms</p>
        <p>WebAssembly 耗时: {wasmTime.toFixed(2)}ms</p>
        <p>加速比: {(jsTime / wasmTime).toFixed(2)}x</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>矩阵乘法</h4>
        <label>
          矩阵大小: 
          <input 
            type="number" 
            value={matrixSize}
            onChange={(e) => setMatrixSize(parseInt(e.target.value))}
            min="10"
            max="500"
          />
        </label>
        <button onClick={testMatrixMultiplication}>测试矩阵乘法</button>
        <p>JavaScript 耗时: {jsTime.toFixed(2)}ms</p>
        <p>WebAssembly 耗时: {wasmTime.toFixed(2)}ms</p>
        {wasmTime > 0 && (
          <p>加速比: {(jsTime / wasmTime).toFixed(2)}x</p>
        )}
      </div>
    </div>
  );
};

export default PerformanceDemo;