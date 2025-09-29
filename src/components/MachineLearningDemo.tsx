import React, { useState, useEffect, useRef, useCallback } from "react";
import { LinearRegression } from "../pkg/my_wasm_lib";

// 定义数据点类型
interface DataPoint {
  x: number;
  y: number;
}

// 定义回归模型类型（确保有必要的属性）
interface RegressionModel {
  slope: number;
  intercept: number;
  predict: (x: number) => number;
  predict_batch: (x: number[]) => number[];
}

const MachineLearningDemo: React.FC<{ wasm: any }> = ({ wasm }) => {
  const [regression, setRegression] = useState<RegressionModel | null>(null);
  const [trainingData, setTrainingData] = useState<DataPoint[]>([]);
  const [predictions, setPredictions] = useState<DataPoint[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 添加模型加载状态
  const [modelError, setModelError] = useState<string | null>(null);

  // 生成训练数据
  const generateTrainingData = useCallback((): DataPoint[] => {
    const data: DataPoint[] = [];
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 200;
      const y = 2 * x + 50 + (Math.random() - 0.5) * 100; // y = 2x + 50 + 噪声
      data.push({ x, y });
    }
    return data;
  }, []);

  // 训练模型
  const trainModel = useCallback(() => {
    if (!wasm) return;

    setIsTraining(true);

    setTimeout(() => {
      try {
        const data = generateTrainingData();
        setTrainingData(data);
        console.log("训练数据:", data);

        const x = Float64Array.from(data.map((point) => point.x));
        const y = Float64Array.from(data.map((point) => point.y));

        const model = new LinearRegression();

        model.fit(x, y);

        // 适配 LinearRegression 对象以匹配 RegressionModel 接口
        const adaptedModel: RegressionModel = {
          slope: (model as any).slope ?? 0,
          intercept: (model as any).intercept ?? 0,
          predict: (x: number) => model.predict(x),
          predict_batch: (x: number[]) => {
            const floatArray = new Float64Array(x);
            return Array.from(model.predict_batch(floatArray));
          },
        };

        setRegression(adaptedModel);
        setIsTraining(false);

        // 生成预测
        const testX = Array.from({ length: 200 }, (_, i) => i);
        const predY = Array.from(model.predict_batch(new Float64Array(testX)));

        const newPredictions = testX.map((x, i) => ({ x, y: predY[i] }));
        setPredictions(newPredictions);
      } catch (error) {
        console.error("训练模型时出错:", error);
        setModelError("模型训练失败");
        setIsTraining(false);
      }
    }, 100);
  }, [wasm, generateTrainingData]);

  // 绘制图表
  const drawChart = useCallback(
    (data: DataPoint[], predictions: DataPoint[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 清除画布
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格
      ctx.strokeStyle = "#f0f0f0";
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
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(predictions[0].x, predictions[0].y);

        for (let i = 1; i < predictions.length; i++) {
          ctx.lineTo(predictions[i].x, predictions[i].y);
        }
        ctx.stroke();
      }

      // 绘制数据点
      ctx.fillStyle = "blue";
      data.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // 绘制图例
      if (regression) {
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";
        const slope = regression.slope?.toFixed(2) || "N/A";
        const intercept = regression.intercept?.toFixed(2) || "N/A";
        ctx.fillText(`线性回归: y = ${slope}x + ${intercept}`, 10, 20);
        // ctx.fillText(`线性回归: y = ${regression.slope}x + ${regression.intercept}`, 10, 20);
      }
    },
    [regression]
  );

  // 单点预测
  const predictValue = useCallback(
    (x: number): number => {
      if (regression) {
        return regression.predict(x);
      }
      return 0;
    },
    [regression]
  );

  // 处理输入变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const x = parseFloat(e.target.value);
      if (!isNaN(x)) {
        const y = predictValue(x);
        console.log(`预测结果: x=${x}, y=${y}`);
      }
    },
    [predictValue]
  );

  useEffect(() => {
    if (trainingData.length > 0) {
      drawChart(trainingData, predictions);
    }
  }, [trainingData, predictions, drawChart]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "10px" }}>
      <h3>机器学习演示 - 线性回归</h3>

      <button onClick={trainModel} disabled={isTraining || !wasm}>
        {isTraining ? "训练中..." : "训练模型"}
      </button>

      {regression && (
        <div style={{ marginTop: "10px" }}>
          <p>
            模型参数: y = {regression.slope}x + {regression.intercept}
          </p>

          <div>
            <label>输入 x 值预测: </label>
            <input
              type="number"
              defaultValue="100"
              onChange={handleInputChange}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{ border: "1px solid #ccc", background: "white" }}
        />
      </div>
    </div>
  );
};

export default MachineLearningDemo;
