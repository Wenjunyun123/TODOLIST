# Sealos 云函数部署指南

## 🚀 快速部署

### 1. 登录 Sealos 平台
访问 [Sealos 云开发平台](https://cloud.sealos.io) 并登录

### 2. 创建云函数
1. 进入「云开发」应用
2. 点击「创建函数」
3. 选择「HTTP 触发器」
4. 函数名称：`todo-api`
5. 运行时：`Node.js 18`

### 3. 部署函数代码

**推荐使用简化版本：**

复制 `sealos-simple-function.js` 文件内容到云函数编辑器中。

**或者使用完整版本：**

复制 `sealos-cloud-functions.js` 文件内容到云函数编辑器中。

### 4. 配置触发器
- 触发器类型：HTTP
- 请求方法：ALL（允许所有HTTP方法）
- 路径：`/` （根路径）

### 5. 部署并获取URL
1. 点击「部署」按钮
2. 等待部署完成
3. 复制生成的访问URL

## 🧪 测试 API

### 测试步骤

1. **测试根路径**（检查函数是否正常运行）：
   ```
   GET https://your-function-url/
   ```
   应该返回API信息和端点列表

2. **测试获取所有待办事项**：
   ```
   GET https://your-function-url/todos
   ```

3. **测试创建待办事项**：
   ```
   POST https://your-function-url/todos
   Content-Type: application/json
   
   {
     "title": "测试待办事项"
   }
   ```

4. **测试更新待办事项**：
   ```
   PUT https://your-function-url/todos/1
   Content-Type: application/json
   
   {
     "title": "更新的待办事项",
     "completed": true
   }
   ```

5. **测试删除待办事项**：
   ```
   DELETE https://your-function-url/todos/1
   ```

### PowerShell 测试命令

```powershell
# 测试根路径
Invoke-WebRequest -Uri "https://your-function-url/" -Method GET

# 测试获取所有todos
Invoke-WebRequest -Uri "https://your-function-url/todos" -Method GET

# 测试创建todo
$body = @{ title = "测试待办事项" } | ConvertTo-Json
Invoke-WebRequest -Uri "https://your-function-url/todos" -Method POST -Body $body -ContentType "application/json"

# 测试更新todo
$updateBody = @{ title = "更新的待办事项"; completed = $true } | ConvertTo-Json
Invoke-WebRequest -Uri "https://your-function-url/todos/1" -Method PUT -Body $updateBody -ContentType "application/json"

# 测试删除todo
Invoke-WebRequest -Uri "https://your-function-url/todos/1" -Method DELETE
```

## 🔧 前端配置

### 更新 API 地址

1. **方法一：环境变量**（推荐）
   
   编辑 `todo-app/.env` 文件：
   ```env
   REACT_APP_API_URL=https://your-function-url
   ```

2. **方法二：直接修改代码**
   
   编辑 `todo-app/src/services/api.ts` 文件：
   ```typescript
   const API_BASE_URL = 'https://your-function-url';
   ```

### 重启前端应用

```bash
cd todo-app
npm start
```

## 📋 支持的 API 端点

| 方法 | 路径 | 描述 | 请求体 |
|------|------|------|--------|
| GET | `/` | API信息 | - |
| GET | `/todos` | 获取所有待办事项 | - |
| GET | `/todos/:id` | 获取单个待办事项 | - |
| POST | `/todos` | 创建新待办事项 | `{"title": "string"}` |
| PUT | `/todos/:id` | 更新待办事项 | `{"title": "string", "completed": boolean}` |
| DELETE | `/todos/:id` | 删除待办事项 | - |

## 🐛 常见问题

### 1. "Function Not Found" 错误
- 检查函数是否部署成功
- 确认访问URL是否正确
- 检查触发器配置

### 2. CORS 错误
- 云函数已配置CORS头，如果仍有问题，检查浏览器控制台

### 3. 数据丢失
- 当前使用内存存储，函数重启后数据会丢失
- 生产环境建议使用数据库存储

### 4. 路径问题
- 支持 `/todos` 和 `/api/todos` 两种路径格式
- 前端默认使用 `/api/todos`，云函数会自动处理

## 🔄 重新部署

如果当前云函数有问题：

1. 删除现有云函数
2. 使用 `sealos-simple-function.js` 重新创建
3. 确保触发器配置正确
4. 测试所有API端点
5. 更新前端配置

## 📊 监控和日志

在Sealos云函数控制台中：
- 查看函数调用日志
- 监控函数性能
- 检查错误信息

---

🎉 **部署完成后，记得更新前端API地址并重启应用！**