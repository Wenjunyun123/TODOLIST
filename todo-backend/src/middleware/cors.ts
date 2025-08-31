import { Request, Response, NextFunction } from 'express';

/**
 * CORS跨域资源共享中间件
 * 处理跨域请求，允许前端应用访问后端API
 */

/**
 * CORS中间件函数
 * @param req - Express请求对象
 * @param res - Express响应对象
 * @param next - Express下一个中间件函数
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  /**
   * 允许的源地址列表
   * 包含开发环境和生产环境的域名
   */
  const allowedOrigins = [
    // 开发环境 - localhost
    'http://localhost:3000',  // React开发服务器默认端口
    'http://localhost:3001',  // React应用端口
    'http://localhost:3002',  // 后端API端口
    'http://localhost:3003',  // 备用端口
    
    // 开发环境 - 127.0.0.1
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    
    // 生产环境域名
    'https://todo-app.cloud.sealos.io', // Sealos云平台域名
    'https://your-frontend-domain.com'  // 自定义生产环境域名
  ];

  // 获取请求来源
  const origin = req.headers.origin;
  
  // 验证并设置允许的源
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`CORS: 允许来源 ${origin}`);
  } else if (origin) {
    console.warn(`CORS: 拒绝来源 ${origin}`);
  }

  // 设置允许的HTTP方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // 设置允许的请求头
  res.setHeader('Access-Control-Allow-Headers', [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ].join(', '));
  
  // 允许携带凭证（cookies等）
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 设置预检请求的缓存时间（24小时）
  res.setHeader('Access-Control-Max-Age', '86400');

  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    console.log(`CORS: 处理预检请求 ${req.url}`);
    res.status(200).end();
    return;
  }

  // 继续处理请求
  next();
};