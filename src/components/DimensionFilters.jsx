import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const DimensionFilters = ({ headers, sourceData, onDimensionFiltersChanged, onAxisConfigChanged }) => {
  const [filters, setFilters] = useState([]);
  const [axisConfig, setAxisConfig] = useState({
    mode: 'single',
    secondAxisType: 'value',
    secondAxisFields: []
  });

  // 获取所有维度字段
  const dimensionKeys = Object.keys(headers || {})
    .filter(key => headers[key]?.columnType === 'dimension');

  // 获取所有指标字段
  const metricKeys = Object.keys(headers || {})
    .filter(key => {
      // 显式标记为metric或metrics的字段
      if (headers[key]?.columnType === 'metric' || headers[key]?.columnType === 'metrics') 
        return true;
      
      // 显式标记为dimension的字段排除
      if (headers[key]?.columnType === 'dimension') 
        return false;
      
      // 其他字段都视为指标字段
      return true;
    });

  // 获取第二轴可选项
  const secondAxisOptions = metricKeys;

  // 当筛选条件变化时，通知父组件
  useEffect(() => {
    onDimensionFiltersChanged(filters);
  }, [filters, onDimensionFiltersChanged]);

  // 当坐标轴配置变化时，通知父组件
  useEffect(() => {
    if (onAxisConfigChanged) {
      onAxisConfigChanged(axisConfig);
    }
  }, [axisConfig, onAxisConfigChanged]);

  // 添加筛选条件
  const addFilter = () => {
    if (dimensionKeys.length === 0) return;
    
    const newFilter = {
      dimension: dimensionKeys[0],
      operator: '=',
      value: ''
    };
    
    setFilters([...filters, newFilter]);
  };

  // 移除筛选条件
  const removeFilter = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  // 处理筛选条件变化
  const handleFilterChange = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index] = {
      ...newFilters[index],
      [field]: value
    };
    setFilters(newFilters);
  };

  // 获取维度的可选值
  const getValuesForDimension = (dimension) => {
    if (!sourceData || !sourceData.data || !dimension) return [];
    
    const values = [...new Set(sourceData.data.map(item => item[dimension]))];
    return values;
  };

  // 处理轴模式变化
  const handleAxisModeChange = (event) => {
    const mode = event.target.value;
    setAxisConfig({
      ...axisConfig,
      mode,
      // 如果从双轴切换到单轴，清空第二轴字段
      secondAxisFields: mode === 'single' ? [] : axisConfig.secondAxisFields
    });
  };

  // 处理第二轴类型变化
  const handleSecondAxisTypeChange = (event) => {
    setAxisConfig({
      ...axisConfig,
      secondAxisType: event.target.value
    });
  };

  // 处理第二轴字段变化
  const handleSecondAxisChange = (event) => {
    setAxisConfig({
      ...axisConfig,
      secondAxisFields: event.target.value
    });
  };

  // 获取字段的显示名称
  const getDisplayName = (key) => {
    return headers[key]?.aliasName || key;
  };

  return (
    <Box sx={{ mt: 2 }}>
      {dimensionKeys.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2">暂无可筛选的维度</Typography>
        </Box>
      ) : (
        <>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={addFilter}
            size="small"
            sx={{ mb: 2 }}
          >
            添加筛选条件
          </Button>
          
          {filters.map((filter, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>维度字段</InputLabel>
                  <Select
                    value={filter.dimension}
                    label="维度字段"
                    onChange={(e) => handleFilterChange(index, 'dimension', e.target.value)}
                  >
                    {dimensionKeys.map(key => (
                      <MenuItem key={key} value={key}>
                        {getDisplayName(key)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>筛选条件</InputLabel>
                  <Select
                    value={filter.operator}
                    label="筛选条件"
                    onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                  >
                    <MenuItem value="=">等于</MenuItem>
                    <MenuItem value="!=">不等于</MenuItem>
                    <MenuItem value="contains">包含</MenuItem>
                    <MenuItem value="not_contains">不包含</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>筛选值</InputLabel>
                  <Select
                    value={filter.value}
                    label="筛选值"
                    onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                  >
                    {getValuesForDimension(filter.dimension).map(value => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="error" 
                  onClick={() => removeFilter(index)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </>
      )}

      {/* 坐标轴配置 */}
      <Divider sx={{ my: 2 }}>坐标轴配置</Divider>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel>显示模式</InputLabel>
            <Select
              value={axisConfig.mode}
              label="显示模式"
              onChange={handleAxisModeChange}
            >
              <MenuItem value="single">单轴</MenuItem>
              <MenuItem value="double">双轴</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {axisConfig.mode === 'double' && (
          <>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>第二轴类型</InputLabel>
                <Select
                  value={axisConfig.secondAxisType}
                  label="第二轴类型"
                  onChange={handleSecondAxisTypeChange}
                >
                  <MenuItem value="percentage">百分比</MenuItem>
                  <MenuItem value="value">数值</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>第二轴指标</InputLabel>
                <Select
                  multiple
                  value={axisConfig.secondAxisFields}
                  label="第二轴指标"
                  onChange={handleSecondAxisChange}
                  renderValue={(selected) => selected.map(key => getDisplayName(key)).join(', ')}
                >
                  {secondAxisOptions.map(key => (
                    <MenuItem key={key} value={key}>
                      {getDisplayName(key)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default DimensionFilters;