import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './index.css';

// 创建自定义主题
const theme = createTheme({
    palette: {
        primary: {
            main: '#409EFF',
        },
        secondary: {
            main: '#79bbff',
        },
        background: {
            default: '#f5f7fa',
        },
    },
    typography: {
        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
    },
});

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);