import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent, Alert, Skeleton, Grid, Box } from '@mui/material';
import * as echarts from 'echarts';

const ChartPanel = ({ chartOptions, isLoading, chartInfo }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [containerHeight, setContainerHeight] = useState('calc(100vh - 280px)');

  // 初始化echarts实例
  const initChart = () => {
    if (chartRef.current && !chartInstance.current) {
      // 销毁旧实例（如果存在）
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      
      // 创建新实例
      chartInstance.current = echarts.init(chartRef.current, null, {
        renderer: 'canvas',
        useDirtyRect: true
      });
      
      // 如果有配置，立即设置
      if (chartOptions && Object.keys(chartOptions).length > 0) {
        chartInstance.current.setOption(chartOptions, true);
      }
    }
  };

  // 初始化和清理图表实例
  useEffect(() => {
    // 确保DOM已就绪后初始化图表
    initChart();

    // 组件卸载时清理图表实例
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      // 设置一个最小高度，确保在小屏幕上也有足够的空间
      const vh = window.innerHeight;
      const minHeight = Math.max(400, vh - 280);
      setContainerHeight(`${minHeight}px`);
      
      // 图表实例大小调整
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    // 初始调整大小
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 当图表选项变化时更新图表
  useEffect(() => {
    if (chartOptions && Object.keys(chartOptions).length > 0) {
      // 确保图表实例存在
      if (!chartInstance.current && chartRef.current) {
        initChart();
      }
      
      // 设置选项
      if (chartInstance.current) {
        try {
          chartInstance.current.setOption(chartOptions, true);
          // 强制resize确保图表填满容器
          setTimeout(() => {
            if (chartInstance.current) {
              chartInstance.current.resize();
            }
          }, 100);
        } catch (error) {
          console.error('设置图表选项失败:', error, chartOptions);
        }
      }
    }
  }, [chartOptions]);

  return (
    <Card sx={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <CardHeader title="图表预览" />
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: containerHeight,
        p: 2
      }}>
        <div style={{ 
          position: 'relative', 
          width: '100%',
          flex: 1 
        }}>
          {isLoading ? (
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%" 
              animation="wave" 
              sx={{ minHeight: '400px' }} 
            />
          ) : (
            <div 
              ref={chartRef} 
              style={{ 
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                width: 'auto'
              }} 
            />
          )}
        </div>
        
        {chartInfo && (
          <Alert severity="info" sx={{ mt: 'auto' }}>
            {chartInfo}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartPanel;