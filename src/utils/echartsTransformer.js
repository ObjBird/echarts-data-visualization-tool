/**
 * 将数据转换为 ECharts 配置
 * @param {Object} data - 包含 headers 和 data 的数据对象
 * @param {Object} config - 图表配置对象
 * @returns {Object} ECharts 配置对象
 */
export function transformToECharts(data, config) {
  const { headers, data: rawData } = data;
  const {
    chartType,
    xAxisKey,
    seriesKeys,
    lineStyle = 'solid',
    lineShape = 'polyline',
    dimensionFilters = [],
    crossDimensions = []
  } = config;

  // 应用维度筛选
  let filteredData = applyDimensionFilters(rawData, dimensionFilters);

  // 如果有交叉维度，处理数据交叉
  if (crossDimensions.length > 0) {
    return handleCrossDimensions(filteredData, headers, config);
  }

  // 获取 X 轴数据
  const xAxisData = [...new Set(filteredData.map(item => item[xAxisKey]))];

  // 根据图表类型生成配置
  switch (chartType) {
    case 'line':
      return generateLineChart(filteredData, headers, xAxisData, xAxisKey, seriesKeys, lineStyle, lineShape);
    case 'bar':
      return generateBarChart(filteredData, headers, xAxisData, xAxisKey, seriesKeys);
    case 'pie':
      return generatePieChart(filteredData, headers, xAxisKey, seriesKeys[0]);
    case 'scatter':
      return generateScatterChart(filteredData, headers, xAxisKey, seriesKeys);
    default:
      throw new Error(`不支持的图表类型: ${chartType}`);
  }
}

/**
 * 应用维度筛选
 */
function applyDimensionFilters(data, filters) {
  return data.filter(item => {
    return filters.every(filter => {
      const { dimension, operator, value } = filter;
      const itemValue = item[dimension];

      switch (operator) {
        case '=':
          return itemValue === value;
        case '!=':
          return itemValue !== value;
        case 'contains':
          return String(itemValue).includes(String(value));
        case 'not_contains':
          return !String(itemValue).includes(String(value));
        default:
          return true;
      }
    });
  });
}

/**
 * 处理交叉维度
 */
function handleCrossDimensions(data, headers, config) {
  const { chartType, xAxisKey, seriesKeys, crossDimensions, lineStyle, lineShape } = config;

  // 获取所有交叉维度的组合
  const crossCombinations = getCrossCombinations(data, crossDimensions);
  
  // 获取 X 轴数据
  const xAxisData = [...new Set(data.map(item => item[xAxisKey]))];
  
  // 为每个组合和每个指标生成系列
  const series = [];
  const legend = [];

  crossCombinations.forEach(combination => {
    seriesKeys.forEach(seriesKey => {
      const combinationLabel = crossDimensions.map(dim => combination[dim]).join('-');
      const seriesName = `${headers[seriesKey]?.aliasName || seriesKey}-${combinationLabel}`;
      
      // 过滤出当前组合的数据
      const combinationData = data.filter(item => 
        crossDimensions.every(dim => item[dim] === combination[dim])
      );

      // 生成系列数据
      const seriesData = xAxisData.map(xValue => {
        const dataItem = combinationData.find(item => item[xAxisKey] === xValue);
        return dataItem ? dataItem[seriesKey] : 0;
      });

      // 添加系列配置
      const seriesConfig = {
        name: seriesName,
        type: chartType === 'scatter' ? 'scatter' : chartType,
        data: seriesData
      };

      if (chartType === 'line') {
        seriesConfig.lineStyle = { type: lineStyle };
        if (lineShape === 'smooth') {
          seriesConfig.smooth = true;
        } else if (lineShape === 'step') {
          seriesConfig.step = 'end';
        }
      }

      series.push(seriesConfig);
      legend.push(seriesName);
    });
  });

  return {
    title: {
      text: '交叉分析图表',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: legend,
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: headers[xAxisKey]?.aliasName || xAxisKey
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
}

/**
 * 获取交叉维度的所有组合
 */
function getCrossCombinations(data, crossDimensions) {
  const combinations = new Map();

  data.forEach(item => {
    const key = crossDimensions.map(dim => item[dim]).join('|');
    if (!combinations.has(key)) {
      const combination = {};
      crossDimensions.forEach(dim => {
        combination[dim] = item[dim];
      });
      combinations.set(key, combination);
    }
  });

  return Array.from(combinations.values());
}

/**
 * 生成线图配置
 */
function generateLineChart(data, headers, xAxisData, xAxisKey, seriesKeys, lineStyle, lineShape) {
  const series = seriesKeys.map(key => {
    const seriesData = xAxisData.map(xValue => {
      const items = data.filter(item => item[xAxisKey] === xValue);
      return items.reduce((sum, item) => sum + (item[key] || 0), 0);
    });

    const seriesConfig = {
      name: headers[key]?.aliasName || key,
      type: 'line',
      data: seriesData,
      lineStyle: {
        type: lineStyle
      }
    };

    if (lineShape === 'smooth') {
      seriesConfig.smooth = true;
    } else if (lineShape === 'step') {
      seriesConfig.step = 'end';
    }

    return seriesConfig;
  });

  return {
    title: {
      text: '线图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: seriesKeys.map(key => headers[key]?.aliasName || key),
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: headers[xAxisKey]?.aliasName || xAxisKey
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
}

/**
 * 生成柱状图配置
 */
function generateBarChart(data, headers, xAxisData, xAxisKey, seriesKeys) {
  const series = seriesKeys.map(key => {
    const seriesData = xAxisData.map(xValue => {
      const items = data.filter(item => item[xAxisKey] === xValue);
      return items.reduce((sum, item) => sum + (item[key] || 0), 0);
    });

    return {
      name: headers[key]?.aliasName || key,
      type: 'bar',
      data: seriesData
    };
  });

  return {
    title: {
      text: '柱状图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: seriesKeys.map(key => headers[key]?.aliasName || key),
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: headers[xAxisKey]?.aliasName || xAxisKey
    },
    yAxis: {
      type: 'value'
    },
    series: series
  };
}

/**
 * 生成饼图配置
 */
function generatePieChart(data, headers, xAxisKey, seriesKey) {
  const pieData = data.map(item => ({
    name: item[xAxisKey],
    value: item[seriesKey] || 0
  }));

  // 合并相同名称的数据
  const mergedData = new Map();
  pieData.forEach(item => {
    if (mergedData.has(item.name)) {
      mergedData.set(item.name, mergedData.get(item.name) + item.value);
    } else {
      mergedData.set(item.name, item.value);
    }
  });

  const finalData = Array.from(mergedData.entries()).map(([name, value]) => ({
    name,
    value
  }));

  return {
    title: {
      text: '饼图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: finalData.map(item => item.name)
    },
    series: [
      {
        name: headers[seriesKey]?.aliasName || seriesKey,
        type: 'pie',
        radius: '50%',
        data: finalData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
}

/**
 * 生成散点图配置
 */
function generateScatterChart(data, headers, xAxisKey, seriesKeys) {
  if (seriesKeys.length < 2) {
    throw new Error('散点图需要至少两个数值字段');
  }

  const scatterData = data.map(item => [
    item[seriesKeys[0]] || 0,
    item[seriesKeys[1]] || 0
  ]);

  return {
    title: {
      text: '散点图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `${params.seriesName}<br/>${headers[seriesKeys[0]]?.aliasName || seriesKeys[0]}: ${params.data[0]}<br/>${headers[seriesKeys[1]]?.aliasName || seriesKeys[1]}: ${params.data[1]}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: headers[seriesKeys[0]]?.aliasName || seriesKeys[0]
    },
    yAxis: {
      type: 'value',
      name: headers[seriesKeys[1]]?.aliasName || seriesKeys[1]
    },
    series: [
      {
        name: '数据点',
        type: 'scatter',
        data: scatterData,
        symbolSize: 8
      }
    ]
  };
}