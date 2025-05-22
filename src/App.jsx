import React, { useState, useRef, useEffect } from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import ChartPanel from './components/ChartPanel';
import ConfigPanel from './components/ConfigPanel';
import { transformToECharts } from './utils/echartsTransformer';
import { sampleData } from './utils/sampleData';

function App() {
  const [sourceData, setSourceData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartInfo, setChartInfo] = useState('');
  const [outputCode, setOutputCode] = useState('');
  
  // 维度筛选和交叉状态
  const [dimensionFilters, setDimensionFilters] = useState([]);
  const [crossDimensions, setCrossDimensions] = useState([]);
  
  const configPanelRef = useRef(null);
  
  // 检测窗口大小以确定是否为移动视图
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 更新源数据
  const handleUpdateSourceData = (data) => {
    setSourceData(data);
  };

  // 更新维度筛选
  const handleDimensionFiltersChanged = (filters) => {
    setDimensionFilters(filters);
  };

  // 更新交叉维度
  const handleCrossDimensionsChanged = (dimensions) => {
    setCrossDimensions(dimensions);
  };

  // 生成图表
  const handleGenerateChart = async (options) => {
    setIsLoading(true);
    setChartInfo('');
    
    try {
      const data = sourceData;

      if (!data || !data.data || !data.headers) {
        throw new Error('无效的数据源格式');
      }

      // 合并选项和状态
      const chartConfig = {
        ...options,
        dimensionFilters: dimensionFilters,
        crossDimensions: crossDimensions,
      };

      // 转换为ECharts配置
      const echartsOptions = transformToECharts(data, chartConfig);
      
      // 根据屏幕尺寸调整图表大小和配置
      if (isMobileView) {
        // 针对移动设备的优化
        if (echartsOptions.grid) {
          echartsOptions.grid.left = '5%';
          echartsOptions.grid.right = '5%';
          echartsOptions.grid.bottom = '15%';
        }
        
        // 调整字体大小
        if (echartsOptions.title && echartsOptions.title.textStyle) {
          echartsOptions.title.textStyle.fontSize = 14;
        }
        
        // 简化图例显示
        if (echartsOptions.legend) {
          echartsOptions.legend.itemWidth = 10;
          echartsOptions.legend.itemHeight = 10;
          echartsOptions.legend.textStyle = { fontSize: 12 };
          
          // 如果图例项目过多，改为滚动显示
          if (echartsOptions.legend.data && echartsOptions.legend.data.length > 5) {
            echartsOptions.legend.type = 'scroll';
          }
        }
      }
      
      setChartOptions(echartsOptions);

      // 生成图表信息
      const chartTypeNames = {
        line: '线图',
        bar: '柱状图',
        pie: '饼图',
        scatter: '散点图',
      };

      let infoText = `已生成${chartTypeNames[options.chartType]}`;
      infoText += `，数据包含 ${data.data.length} 条记录`;

      if (dimensionFilters.length > 0) {
        infoText += `，应用了 ${dimensionFilters.length} 个筛选条件`;
      }

      if (crossDimensions.length > 0) {
        infoText += `，使用了 ${crossDimensions.length} 个维度进行交叉`;
      }

      setChartInfo(infoText);

      // 生成代码输出
      const echartsOptionStr = JSON.stringify(echartsOptions, null, 2);

      let usageCode = `// 1. 导入或引用转换函数\n`;
      usageCode += `// import { transformToECharts } from './echartsTransformer.js';\n\n`;
      usageCode += `// 2. 准备数据\nconst data = ${JSON.stringify(data, null, 2)};\n\n`;
      usageCode += `// 3. 设置选项\nconst options = ${JSON.stringify(chartConfig, null, 2)};\n\n`;
      usageCode += `// 4. 调用转换函数\nconst echartsOptions = transformToECharts(data, options);\n\n`;
      usageCode += `// 5. 使用ECharts渲染图表\nconst chart = echarts.init(document.getElementById('chart'), null, {\n  renderer: 'canvas',\n  useDirtyRect: true,\n  devicePixelRatio: window.devicePixelRatio // 适配高清屏\n});\nchart.setOption(echartsOptions);\n\n`;
      usageCode += `// 6. 自适应调整\nwindow.addEventListener('resize', () => {\n  chart.resize();\n});\n\n`;
      usageCode += `// 7. 完整的ECharts配置对象\nconst option = ${echartsOptionStr};`;

      setOutputCode(usageCode);

    } catch (error) {
      console.error('生成图表出错:', error);
      if (configPanelRef.current) {
        configPanelRef.current.setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box className="app-header">
        <Typography variant="h4" component="h1">
          查询服务数据解析工具
        </Typography>
      </Box>
      
      <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 3 }}>
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid item xs={12} md={4} lg={3} sx={{ display: 'flex' }}>
            <ConfigPanel
              ref={configPanelRef}
              sourceData={sourceData}
              outputCode={outputCode}
              onUpdateSourceData={handleUpdateSourceData}
              onGenerateChart={handleGenerateChart}
              onDimensionFiltersChanged={handleDimensionFiltersChanged}
              onCrossDimensionsChanged={handleCrossDimensionsChanged}
            />
          </Grid>
          
          <Grid item xs={12} md={7} lg={8} sx={{ display: 'flex' }}>
            <ChartPanel
              chartOptions={chartOptions}
              isLoading={isLoading}
              chartInfo={chartInfo}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;