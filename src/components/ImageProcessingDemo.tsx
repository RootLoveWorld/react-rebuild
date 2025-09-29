import React, { useState, useRef, useCallback } from 'react';
import { ImageProcessor as wasmImageProcessor } from '../pkg/my_wasm_lib';

const ImageProcessingDemo = ({ wasm }) => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null); // 修改此处
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img); // 现在类型匹配
          const canvas = originalCanvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
            }
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processImage = useCallback(async (operation) => {
    if (!originalImage || !wasm) return;

    setProcessing(true);
    const startTime = performance.now();

    try {
      const canvas = originalCanvasRef.current;
      if (!canvas) {
        throw new Error('原始画布不存在');
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('无法获取原始画布上下文');
      }
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const processor = new wasmImageProcessor(
        imageData.data,
        canvas.width,
        canvas.height
      );

      switch (operation) {
        case 'grayscale':
          processor.grayscale();
          break;
        case 'blur':
          processor.gaussian_blur(5);
          break;
        case 'edge':
          processor.edge_detection();
          break;
        default:
          break;
      }

      const processedData = processor.get_data();
      
      const outputCanvas = canvasRef.current;
      if (!outputCanvas) {
        throw new Error('输出画布不存在');
      }
      
      const outputCtx = outputCanvas.getContext('2d');
      if (!outputCtx) {
        throw new Error('无法获取输出画布上下文');
      }
      
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      
      const newImageData = new ImageData(
        new Uint8ClampedArray(processedData),
        canvas.width,
        canvas.height
      );
      
      outputCtx.putImageData(newImageData, 0, 0);
      setProcessedImage(outputCanvas.toDataURL());
      
    } catch (error) {
      console.error('Image processing failed:', error);
    } finally {
      setProcessing(false);
      setProcessingTime(performance.now() - startTime);
    }
  }, [originalImage, wasm]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>高级图像处理</h3>
      
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {originalImage && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div>
            <h4>原图</h4>
            <canvas 
              ref={originalCanvasRef} 
              style={{ maxWidth: '400px', border: '1px solid #ddd' }} 
            />
          </div>
          
          <div>
            <h4>处理后</h4>
            <canvas 
              ref={canvasRef} 
              style={{ maxWidth: '400px', border: '1px solid #ddd' }} 
            />
          </div>
        </div>
      )}

      {originalImage && (
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => processImage('grayscale')}
            disabled={processing}
          >
            灰度化
          </button>
          <button 
            onClick={() => processImage('blur')}
            disabled={processing}
          >
            高斯模糊
          </button>
          <button 
            onClick={() => processImage('edge')}
            disabled={processing}
          >
            边缘检测
          </button>
        </div>
      )}

      {processingTime > 0 && (
        <p>处理时间: {processingTime.toFixed(2)}ms</p>
      )}
    </div>
  );
};

export default ImageProcessingDemo;