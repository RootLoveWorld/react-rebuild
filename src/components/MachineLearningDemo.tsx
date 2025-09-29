import React, { useState, useEffect, useRef } from 'react';

const MachineLearningDemo = ({ wasm }) => {
  const [regression, setRegression] = useState(null);
  const [trainingData, setTrainingData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const canvasRef = useRef(null);

  // 生成训练数据
  const generateTrainingData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 200;
      const y = 2 * x + 50 + (Math.random() - 0.5) * 100; // y = 2x + 50 + 噪声
      data.push({ x, y });
    }
    return data;
  };

  // 训练模型
  const trainModel = () => {
    if (!wasm) return;

    setIsTraining(true);
    
    setTimeout(() => {
      const data = generateTrainingData();
      setTrainingData(data);
      
      const x = data.map(point => point.x);
      const y = data.map(point => point.y);
      
      const model = new wasm.LinearRegression();
      model.fit(x, y);
      
      setRegression(model);
      setIsTraining(false);
      
      // 生成预测
      const testX = Array.from({ length: 200 }, (_, i) => i);
      const predY = model.predict_batch(testX);
      
      const newPredictions = testX.map((x, i) => ({ x, y: predY[i] }));
      setPredictions(newPredictions);
      
      drawChart(data, newPredictions);
    }, 100);
  };

  // 绘制图表
  const drawChart = (data, predictions) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 清除画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 绘制预测线
    if (predictions.length > 0) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(predictions[0].x, predictions[0].y);
      
      for (let i = 1; i < predictions.length; i++) {
        ctx.lineTo(predictions[i].x, predictions[i].y);
      }
      ctx.stroke();
    }
    
    // 绘制数据点
    ctx.fillStyle = 'blue';
    data.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // 绘制图例
    if (regression) {
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.fillText(`线性回归: y = ${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)}`, 10, 20);
    }
  };

  // 单点预测
  const predictValue = (x) => {
    if (regression) {
      return regression.predict(x);
    }
    return 0;
  };

  useEffect(() => {
    if (trainingData.length > 0) {
      drawChart(trainingData, predictions);
    }
  }, [trainingData, predictions]);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>机器学习演示 - 线性回归</h3>
      
      <button onClick={trainModel} disabled={isTraining || !wasm}>
        {isTraining ? '训练中...' : '训练模型'}
      </button>
      
      {regression && (
        <div style={{ marginTop: '10px' }}>
          <p>模型参数: y = {regression.slope.toFixed(2)}x + {regression.intercept.toFixed(2)}</p>
          
          <div>
            <label>输入 x 值预测: </label>
            <input 
              type="number" 
              defaultValue="100"
              onChange={(e) => {
                const x = parseFloat(e.target.value);
                const y = predictValue(x);
                console.log(`预测结果: x=${x}, y=${y}`);
              }}
            />
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <canvas 
          ref={canvasRef}
          width={600}
          height={400}
          style={{ border: '1px solid #ccc', background: 'white' }}
        />
      </div>
    </div>
  );
};

export default MachineLearningDemo;