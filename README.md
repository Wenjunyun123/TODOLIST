# TODO 应用项目

一个基于 React + TypeScript 前端和 Sealos 云函数后端的待办事项管理应用。

## 📁 项目结构

```
todo-project/
├── README.md                          # 项目说明文档
├── SEALOS_CLOUD_FUNCTION_GUIDE.md    # Sealos云函数部署指南
├── sealos-cloud-functions.js          # 云函数后端代码
├── todo-app/                          # React前端应用
│   ├── src/                          # 源代码目录
│   │   ├── components/               # React组件
│   │   ├── context/                  # React Context
│   │   ├── hooks/                    # 自定义Hooks
│   │   ├── services/                 # API服务
│   │   └── types/                    # TypeScript类型定义
│   ├── public/                       # 静态资源
│   └── package.json                  # 前端依赖配置
└── todo-backend/                      # Node.js后端应用（本地开发用）
    ├── src/                          # 源代码目录
    │   ├── controllers/              # 控制器
    │   ├── models/                   # 数据模型
    │   ├── routes/                   # 路由配置
    │   └── utils/                    # 工具函数
    └── package.json                  # 后端依赖配置
```

## 🚀 快速开始

### 前端开发

```bash
cd todo-app
npm install
npm start
```

前端应用将在 http://localhost:3000 启动

### 本地后端开发（可选）

```bash
cd todo-backend
npm install
npm run dev
```

后端API将在 http://localhost:3001 启动

### 云函数部署

1. 参考 `SEALOS_CLOUD_FUNCTION_GUIDE.md` 部署云函数
2. 获取云函数访问地址
3. 更新前端 `.env` 文件中的 `REACT_APP_API_URL`

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript + CSS3
- **后端**: Sealos 云函数 (Node.js)
- **状态管理**: React Context + Hooks
- **HTTP客户端**: Axios
- **构建工具**: Create React App

## 📝 功能特性

- ✅ 创建待办事项
- ✅ 查看待办事项列表
- ✅ 标记完成状态
- ✅ 编辑待办事项
- ✅ 删除待办事项
- ✅ 响应式设计
- ✅ 云原生部署

## 🔧 环境配置

### 前端环境变量 (todo-app/.env)

```env
REACT_APP_API_URL=https://your-cloud-function-url
```

### 后端环境变量 (todo-backend/.env)

```env
PORT=3001
NODE_ENV=development
```

## 📖 API 文档

### 待办事项接口

- `GET /api/todos` - 获取所有待办事项
- `GET /api/todos/:id` - 获取单个待办事项
- `POST /api/todos` - 创建新待办事项
- `PUT /api/todos/:id` - 更新待办事项
- `DELETE /api/todos/:id` - 删除待办事项

## 🎯 部署方式

### 推荐：Sealos 云函数部署
- 无服务器架构
- 自动扩缩容
- 按需付费
- 详见 `SEALOS_CLOUD_FUNCTION_GUIDE.md`

### 本地开发
- 前后端分离开发
- 热重载支持
- 完整的开发环境

---

🎉 **项目已优化完成，结构清晰，部署简单！**