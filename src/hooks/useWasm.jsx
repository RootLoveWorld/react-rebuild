import { useState, useEffect } from 'react';
import init from '../pkg/my_wasm_lib'

export const useWasm = () => {
  const [wasm, setWasm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        setLoading(true);
        // 动态导入 wasm 模块
        const wasmModule = await init().then((instance) => instance);
       // console.log('wasmModule', wasmModule);
        // 初始化 WebAssembly 实例
        setWasm(wasmModule);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load WebAssembly module:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWasm();
  }, []);

  return { wasm, loading, error };
};