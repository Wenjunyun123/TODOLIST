import cloud from '@lafjs/cloud'

/**
 * Sealos云函数 - TODO应用后端API
 * 提供完整的CRUD操作，支持MongoDB数据库持久化存储
 * 支持跨域请求和前端包装请求格式
 */
export default async function (ctx: FunctionContext) {
  // 设置CORS头，允许跨域访问
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    // 处理OPTIONS预检请求（CORS预检）
    if (ctx.method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // 获取Sealos云数据库连接
    const db = cloud.database();
    const todosCollection = db.collection('todos');

    // 解析请求路径和HTTP方法
    let path = ctx.request.url || '/';
    let method = ctx.method || 'GET';
    
    // 处理前端包装请求格式
    // 前端可能会将真实的method和path包装在POST请求的body中
    if (ctx.method === 'POST' && ctx.body) {
      try {
        const requestData = typeof ctx.body === 'string' ? JSON.parse(ctx.body) : ctx.body;
        if (requestData.method && requestData.path) {
          method = requestData.method;
          path = requestData.path;
          // 提取实际的请求体数据
          if (requestData.body) {
            ctx.body = requestData.body;
          }
        }
      } catch (e) {
        // 解析失败时使用原始请求格式
        console.warn('Failed to parse wrapped request:', e.message);
      }
    }
    
    // 解析URL路径为数组，过滤空字符串
    const pathParts = path.split('/').filter(p => p);
    console.log('Processing request:', { method, path, pathParts });

    // 根路径处理 - 返回API信息和状态
    if (pathParts.length === 0 && path === '/') {
      const count = await todosCollection.count();
      return {
        data: {
          message: 'TODO API is running',
          version: '1.0.0',
          endpoints: {
            'GET /todos': '获取所有待办事项',
            'GET /todos/:id': '获取单个待办事项',
            'POST /todos': '创建新待办事项',
            'PUT /todos/:id': '更新待办事项',
            'DELETE /todos/:id': '删除待办事项'
          },
          currentTodos: count.total
        }
      };
    }

    // 处理TODO相关的API路径 (/todos 或 /api/todos)
    if (pathParts[0] === 'todos' || (pathParts[0] === 'api' && pathParts[1] === 'todos')) {
      const isApiPath = pathParts[0] === 'api';
      const todoId = pathParts[isApiPath ? 2 : 1]; // 提取TODO ID

      switch (method) {
        case 'GET':
          if (todoId) {
            // 获取单个待办事项
            const todo = await todosCollection.doc(todoId).get();
            if (!todo.data) {
              return {
                error: '待办事项未找到',
                statusCode: 404
              };
            }
            // 将MongoDB的_id字段转换为前端需要的id字段
            const todoData = { ...todo.data, id: todo.data._id };
            delete todoData._id;
            return { data: todoData };
          } else {
            // 获取所有待办事项列表
            const result = await todosCollection.get();
            const todos = result.data.map(todo => ({
              ...todo,
              id: todo._id // 转换_id为id
            }));
            // 清理MongoDB的_id字段
            todos.forEach(todo => delete todo._id);
            return { data: todos };
          }

        case 'POST':
          // 创建新的待办事项
          const createData = typeof ctx.body === 'string' ? JSON.parse(ctx.body || '{}') : (ctx.body || {});
          const { title } = createData;
          
          // 验证输入数据
          if (!title || title.trim().length === 0) {
            return {
              error: '标题不能为空',
              statusCode: 400
            };
          }

          // 构建新待办事项对象
          const newTodo = {
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // 保存到数据库
          const createResult = await todosCollection.add(newTodo);
          
          return {
            data: {
              ...newTodo,
              id: createResult.id // 返回数据库生成的ID
            },
            statusCode: 201
          };

        case 'PUT':
          // 更新待办事项
          if (!todoId) {
            return {
              error: '缺少todo ID',
              statusCode: 400
            };
          }

          const updateData = typeof ctx.body === 'string' ? JSON.parse(ctx.body || '{}') : (ctx.body || {});
          
          // 验证待办事项是否存在
          const existingTodo = await todosCollection.doc(todoId).get();
          if (!existingTodo.data) {
            return {
              error: '待办事项未找到',
              statusCode: 404
            };
          }

          // 构建更新字段对象
          const updateFields = {
            updatedAt: new Date().toISOString()
          };
          
          // 只更新提供的字段
          if (updateData.title !== undefined) {
            updateFields.title = updateData.title.trim();
          }
          if (updateData.completed !== undefined) {
            updateFields.completed = updateData.completed;
          }

          // 执行数据库更新操作
          await todosCollection.doc(todoId).update(updateFields);
          
          // 获取更新后的完整数据
          const updatedTodo = await todosCollection.doc(todoId).get();
          const todoData = { ...updatedTodo.data, id: updatedTodo.data._id };
          delete todoData._id;

          return { data: todoData };

        case 'DELETE':
          // 删除待办事项
          if (!todoId) {
            return {
              error: '缺少todo ID',
              statusCode: 400
            };
          }

          // 验证待办事项是否存在
          const todoToDelete = await todosCollection.doc(todoId).get();
          if (!todoToDelete.data) {
            return {
              error: '待办事项未找到',
              statusCode: 404
            };
          }

          // 执行数据库删除操作
          await todosCollection.doc(todoId).remove();
          
          return {
            data: { message: '删除成功' },
            statusCode: 204
          };

        default:
          // 不支持的HTTP方法
          return {
            error: '方法不允许',
            statusCode: 405
          };
      }
    }

    // 处理未知路径请求
    return {
      error: '路径未找到',
      path: path,
      availablePaths: ['/todos', '/api/todos'],
      statusCode: 404
    };

  } catch (error) {
    // 全局错误处理
    console.error('处理请求时发生错误:', error);
    return {
      error: '服务器内部错误',
      message: error.message,
      statusCode: 500
    };
  }
}