import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Card, CardHeader, CardContent, Tabs, Tab, Box, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, Grid, IconButton,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
  BarChart as BarChartIcon, 
  Timeline as TimelineIcon, 
  PieChart as PieChartIcon,
  Code as CodeIcon,
  ContentCopy as ContentCopyIcon,
  ScatterPlot as ScatterPlotIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import DimensionFilters from './DimensionFilters';
import DimensionCross from './DimensionCross';
import { sampleData } from '../utils/sampleData';

const ConfigPanel = forwardRef(({ sourceData, outputCode, onUpdateSourceData, onGenerateChart, onDimensionFiltersChanged, onCrossDimensionsChanged }, ref) => {
  // Tab相关状态
  const [activeTab, setActiveTab] = useState('input-tab');
  
  // 数据输入相关状态
  const [dataInputValue, setDataInputValue] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState('');
  
  // 图表配置相关状态
  const [chartType, setChartType] = useState('line');
  const [xAxisKey, setXAxisKey] = useState('');
  const [seriesKeys, setSeriesKeys] = useState([]);
  const [lineStyle, setLineStyle] = useState('solid');
  const [lineShape, setLineShape] = useState('polyline');
  const [headers, setHeaders] = useState({});
  
  // 通知状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Ref for copying text
  const codeRef = useRef(null);
  
  // 向父组件暴露的方法
  useImperativeHandle(ref, () => ({
    loadSampleData,
    setError: (message) => {
      setErrorMessage(message);
      setErrorOpen(true);
    },
    activeTab
  }));

  // 初始化或更新headers
  useEffect(() => {
    if (sourceData && sourceData.headers) {
      setHeaders(sourceData.headers);
    }
  }, [sourceData]);
  
  // 当数据或头信息变化时，更新界面表单
  useEffect(() => {
    if (sourceData && sourceData.headers) {
      // 寻找第一个维度字段作为X轴
      const dimensions = Object.keys(sourceData.headers).filter(
        key => sourceData.headers[key].columnType === 'dimension'
      );
      
      const metrics = Object.keys(sourceData.headers).filter(
        key => sourceData.headers[key].columnType !== 'dimension'
      );
      
      if (dimensions.length > 0 && !xAxisKey) {
        setXAxisKey(dimensions[0]);
      }
      
      if (metrics.length > 0 && seriesKeys.length === 0) {
        setSeriesKeys([metrics[0]]);
      }
    }
  }, [sourceData, xAxisKey, seriesKeys]);

  // 处理Tab切换
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // 加载示例数据
  const loadSampleData = () => {
    try {
      // 将示例数据格式化为JSON字符串
      const formattedData = JSON.stringify(sampleData, null, 2);
      setDataInputValue(formattedData);
      setParsedData(sampleData);
      
      // 更新数据源
      onUpdateSourceData(sampleData);
      
      // 设置初始值
      if (sampleData.headers) {
        const dimensions = Object.keys(sampleData.headers).filter(
          key => sampleData.headers[key].columnType === 'dimension'
        );
        
        const metrics = Object.keys(sampleData.headers).filter(
          key => sampleData.headers[key].columnType !== 'dimension'
        );
        
        if (dimensions.length > 0) {
          setXAxisKey(dimensions[0]);
        }
        
        if (metrics.length > 0) {
          setSeriesKeys([metrics[0]]);
        }
      }
      
      // 切换到配置Tab
      setActiveTab('config-tab');
      
      // 显示成功消息
      setSnackbarMessage('示例数据已加载');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('加载示例数据失败:', error);
      setErrorMessage('加载示例数据失败: ' + error.message);
      setErrorOpen(true);
    }
  };
  
  // 清空数据
  const clearData = () => {
    setDataInputValue('');
    setParsedData(null);
    onUpdateSourceData(null);
    setXAxisKey('');
    setSeriesKeys([]);
  };

  // 解析JSON数据
  const parseInputData = () => {
    try {
      if (!dataInputValue.trim()) {
        throw new Error('请输入数据');
      }
      
      const parsed = JSON.parse(dataInputValue);
      
      // 验证数据格式
      if (!parsed.data || !Array.isArray(parsed.data) || !parsed.headers) {
        throw new Error('数据格式不正确，应包含headers和data数组');
      }
      
      setParsedData(parsed);
      onUpdateSourceData(parsed);
      setParseError('');
      
      // 自动切换到配置标签页
      setActiveTab('config-tab');
      
      // 显示成功消息
      setSnackbarMessage('数据解析成功');
      setSnackbarOpen(true);
      
      return true;
    } catch (error) {
      console.error('解析数据失败:', error);
      setParseError(error.message);
      return false;
    }
  };

  // 处理图表类型变化
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
  };

  // 生成图表
  const generateChart = () => {
    if (!parsedData) {
      if (!parseInputData()) {
        return;
      }
    }
    
    if (!xAxisKey) {
      setErrorMessage('请选择X轴数据字段');
      setErrorOpen(true);
      return;
    }
    
    if (seriesKeys.length === 0) {
      setErrorMessage('请选择至少一个指标数据字段');
      setErrorOpen(true);
      return;
    }
    
    // 创建图表配置
    const chartConfig = {
      chartType,
      xAxisKey,
      seriesKeys,
      lineStyle,
      lineShape
    };
    
    // 通知父组件生成图表
    onGenerateChart(chartConfig);
    
    // 如果是在数据输入标签页，切换到配置标签页
    if (activeTab === 'input-tab') {
      setActiveTab('config-tab');
    }
  };

  // 复制代码
  const copyCode = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.textContent)
        .then(() => {
          setSnackbarMessage('代码已复制到剪贴板');
          setSnackbarOpen(true);
        })
        .catch(err => {
          console.error('复制代码失败:', err);
          setErrorMessage('复制代码失败: ' + err.message);
          setErrorOpen(true);
        });
    }
  };

  // 获取字段的显示名称
  const getDisplayName = (headers, key) => {
    return headers[key]?.aliasName || key;
  };

  // 关闭Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // 关闭错误提示
  const handleCloseError = () => {
    setErrorOpen(false);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="配置面板" />
      <CardContent>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="config tabs">
          <Tab 
            label="数据输入" 
            value="input-tab" 
            id="input-tab"
            aria-controls="input-tab-panel"
          />
          <Tab 
            label="图表配置" 
            value="config-tab" 
            id="config-tab"
            aria-controls="config-tab-panel"
            disabled={!parsedData}
          />
          <Tab 
            label="配置代码" 
            value="code-tab" 
            id="code-tab"
            aria-controls="code-tab-panel"
            disabled={!outputCode}
          />
        </Tabs>

        {/* 数据输入面板 */}
        <TabPanel value={activeTab} index="input-tab">
          <TextField
            label="JSON 格式数据"
            multiline
            rows={10}
            value={dataInputValue}
            onChange={(e) => setDataInputValue(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="输入JSON格式的数据，例如月份、区域、销售额等维度和指标数据"
            error={!!parseError}
            helperText={parseError || ''}
          />

          <Alert severity="info" sx={{ mb: 2 }}>
            提示: 确保您的 JSON 格式正确，通过在 headers 中设置 "columnType": "dimension" 标记维度字段
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={loadSampleData}
              startIcon={<ContentCopyIcon />}
            >
              加载示例数据
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={clearData}
              startIcon={<DeleteIcon />}
            >
              清空
            </Button>
          </Box>

          <Button 
            variant="contained" 
            color="primary"
            onClick={parseInputData}
            disabled={!dataInputValue.trim()}
          >
            解析数据
          </Button>
        </TabPanel>

        {/* 图表配置面板 */}
        <TabPanel value={activeTab} index="config-tab">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>图表类型</InputLabel>
                <Select
                  value={chartType}
                  label="图表类型"
                  onChange={(e) => handleChartTypeChange(e.target.value)}
                >
                  <MenuItem value="line">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon />
                      <span>线图</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="bar">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BarChartIcon />
                      <span>柱状图</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="pie">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PieChartIcon />
                      <span>饼图</span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="scatter">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScatterPlotIcon />
                      <span>散点图</span>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>X轴数据字段</InputLabel>
                <Select
                  value={xAxisKey}
                  label="X轴数据字段"
                  onChange={(e) => setXAxisKey(e.target.value)}
                >
                  {Object.keys(headers).map(key => (
                    <MenuItem key={key} value={key}>
                      {getDisplayName(headers, key)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* 线图的线条样式 */}
          {chartType === 'line' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>线条类型</InputLabel>
                  <Select
                    value={lineStyle}
                    label="线条类型"
                    onChange={(e) => setLineStyle(e.target.value)}
                  >
                    <MenuItem value="solid">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="line-style-preview solid"></span>
                        <span>实线</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="dashed">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="line-style-preview dashed"></span>
                        <span>虚线</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="dotted">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="line-style-preview dotted"></span>
                        <span>点线</span>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>线条形状</InputLabel>
                  <Select
                    value={lineShape}
                    label="线条形状"
                    onChange={(e) => setLineShape(e.target.value)}
                  >
                    <MenuItem value="polyline">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="line-shape-preview polyline"></span>
                        <span>折线</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="smooth">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="line-shape-preview smooth"></span>
                        <span>弧线</span>
                      </Box>
                    </MenuItem>
                    <MenuItem value="step">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span className="line-shape-preview step"></span>
                        <span>阶梯线</span>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>指标数据字段 (可多选)</InputLabel>
            <Select
              multiple
              value={seriesKeys}
              label="指标数据字段 (可多选)"
              onChange={(e) => setSeriesKeys(e.target.value)}
              renderValue={(selected) => selected.map(key => getDisplayName(headers, key)).join(', ')}
            >
              {Object.keys(headers)
                .filter(key => headers[key].columnType !== 'dimension')
                .map(key => (
                  <MenuItem key={key} value={key}>
                    {getDisplayName(headers, key)}
                  </MenuItem>
                ))
              }
            </Select>
            <Typography variant="caption" color="text.secondary">
              按住 Ctrl 键(Mac 上为 Cmd 键)可选择多个指标
            </Typography>
          </FormControl>

          {/* 维度筛选和交叉组件 */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>高级设置</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DimensionFilters
                headers={headers}
                sourceData={parsedData}
                onDimensionFiltersChanged={onDimensionFiltersChanged}
                onAxisConfigChanged={config => console.log('坐标轴配置变更:', config)}
              />

              <DimensionCross
                headers={headers}
                chartType={chartType}
                onCrossDimensionsChanged={onCrossDimensionsChanged}
              />
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={generateChart}
              disabled={!xAxisKey || seriesKeys.length === 0}
              fullWidth
            >
              生成图表
            </Button>
          </Box>
        </TabPanel>

        {/* 配置代码面板 */}
        <TabPanel value={activeTab} index="code-tab">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">ECharts 配置代码</Typography>
            <Button 
              variant="outlined" 
              startIcon={<ContentCopyIcon />} 
              onClick={copyCode}
              size="small"
            >
              复制代码
            </Button>
          </Box>
          
          <Box 
            ref={codeRef}
            sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1,
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: '400px',
              whiteSpace: 'pre',
              fontSize: '0.875rem'
            }}
          >
            {outputCode}
          </Box>
        </TabPanel>

        {/* 提示信息 */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
        
        <Snackbar
          open={errorOpen}
          autoHideDuration={4000}
          onClose={handleCloseError}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
});

// Tab面板组件
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ paddingTop: '16px' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default ConfigPanel;