import React, { useState, useEffect } from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

const DimensionCross = ({ headers, chartType, onCrossDimensionsChanged }) => {
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  
  // 判断是否为饼图
  const isPieChart = chartType === 'pie';

  // 获取维度列表
  const dimensions = Object.keys(headers || {})
    .filter(key => headers[key].columnType === 'dimension')
    .map(key => ({
      key,
      name: headers[key].aliasName || key
    }));

  // 当选择的维度改变时，通知父组件
  useEffect(() => {
    onCrossDimensionsChanged(selectedDimensions);
  }, [selectedDimensions, onCrossDimensionsChanged]);

  // 监听图表类型变化，如果是饼图则清空选择的维度
  useEffect(() => {
    if (chartType === 'pie' && selectedDimensions.length > 0) {
      setSelectedDimensions([]);
    }
  }, [chartType, selectedDimensions.length]);

  // 处理复选框变化
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    
    if (checked) {
      setSelectedDimensions(prev => [...prev, value]);
    } else {
      setSelectedDimensions(prev => prev.filter(dim => dim !== value));
    }
  };

  return (
    <Box 
      sx={{ 
        mt: 2, 
        p: 1, 
        border: '1px dashed #4361ee', 
        borderRadius: 1, 
        bgcolor: '#f0f4ff',
        opacity: isPieChart ? 0.7 : 1
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        选择要进行交叉的维度:
      </Typography>
      
      {dimensions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          数据中没有标记为维度的字段
        </Typography>
      ) : (
        <FormGroup row>
          {dimensions.map(dim => (
            <FormControlLabel
              key={dim.key}
              control={
                <Checkbox
                  value={dim.key}
                  checked={selectedDimensions.includes(dim.key)}
                  onChange={handleCheckboxChange}
                  disabled={isPieChart}
                />
              }
              label={dim.name}
            />
          ))}
        </FormGroup>
      )}
      
      {isPieChart && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          饼图不支持维度交叉
        </Typography>
      )}
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        勾选的维度之间将进行交叉，与指标数据叉乘生成多条线段
      </Typography>
    </Box>
  );
};

export default DimensionCross;