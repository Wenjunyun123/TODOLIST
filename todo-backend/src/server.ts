import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRoutes from './routes/todoRoutes';
import { corsMiddleware } from './middleware/cors';

/**
 * TODO应用后端服务器
 * 提供RESTful API接口，支持待办事项的CRUD操作
 */

// 加载环境变量配置
dotenv.config();

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3002;

/**
 * 配置中间件
 */
// CORS跨域处理
app.use(corsMiddleware);

// JSON请求体解析（限制10MB）
app.use(express.json({ limit: '10mb' }));

// URL编码请求体解析
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件 - 记录所有API请求
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * 路由配置
 */
// 健康检查端点 - 用于监控服务状态
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 挂载API路由到 /api 路径
app.use('/api', todoRoutes);

/**
 * 错误处理中间件
 */
// 404错误处理 - 处理未匹配的路由
app.use('*', (req, res) => {
  console.warn(`404 - 路由未找到: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: '路由未找到',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理中间件 - 捕获所有未处理的错误
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试',
    timestamp: new Date().toISOString()
  });
});

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log('\n=================================');
  console.log('🚀 TODO Backend 服务器启动成功!');
  console.log('=================================');
  console.log(`📍 服务器地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 API基础路径: http://localhost:${PORT}/api`);
  console.log(`🌍 运行环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
  console.log('=================================\n');
});

export default app;