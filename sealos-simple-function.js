// Sealos云函数 - 简化版TODO API
// 适用于Sealos HTTP触发器

// 内存存储（注意：重启后数据会丢失）
let todos = [
  {
    id: '1',
    title: '示例待办事项',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 2;

// 生成唯一ID
function generateId() {
  return (nextId++).toString();
}

// 主函数 - Sealos HTTP触发器入口
exports.main = async (event) => {
  // 设置CORS头
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    // 处理OPTIONS预检请求
    if (event.method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // 解析路径和方法
    let path = event.path || '/';
    let method = event.method || 'GET';
    
    // 检查是否是前端发送的包装请求
    if (event.method === 'POST' && event.body) {
      try {
        const requestData = JSON.parse(event.body);
        if (requestData.method && requestData.path) {
          method = requestData.method;
          path = requestData.path;
          // 如果有body数据，解析它
          if (requestData.body) {
            event.body = requestData.body;
          }
        }
      } catch (e) {
        // 如果解析失败，继续使用原始请求
      }
    }
    
    const pathParts = path.split('/').filter(p => p);
    console.log('Request:', { method, path, pathParts });

    // 根路径 - API信息
    if (pathParts.length === 0 && path === '/') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'TODO API is running',
          version: '1.0.0',
          endpoints: {
            'GET /todos': '获取所有待办事项',
            'GET /todos/:id': '获取单个待办事项',
            'POST /todos': '创建新待办事项',
            'PUT /todos/:id': '更新待办事项',
            'DELETE /todos/:id': '删除待办事项'
          },
          currentTodos: todos.length
        })
      };
    }

    // 处理 /todos 路径
    if (pathParts[0] === 'todos' || pathParts[0] === 'api' && pathParts[1] === 'todos') {
      const isApiPath = pathParts[0] === 'api';
      const todoId = pathParts[isApiPath ? 2 : 1];

      switch (method) {
        case 'GET':
          if (todoId) {
            // 获取单个todo
            const todo = todos.find(t => t.id === todoId);
            if (!todo) {
              return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: '待办事项未找到' })
              };
            }
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(todo)
            };
          } else {
            // 获取所有todos
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(todos)
            };
          }

        case 'POST':
          // 创建新todo
          const createData = JSON.parse(event.body || '{}');
          const { title } = createData;
          
          if (!title || title.trim().length === 0) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: '标题不能为空' })
            };
          }

          const newTodo = {
            id: generateId(),
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          todos.push(newTodo);
          
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(newTodo)
          };

        case 'PUT':
          // 更新todo
          if (!todoId) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: '缺少todo ID' })
            };
          }

          const updateData = JSON.parse(event.body || '{}');
          const todoIndex = todos.findIndex(t => t.id === todoId);
          
          if (todoIndex === -1) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: '待办事项未找到' })
            };
          }

          // 更新字段
          if (updateData.title !== undefined) {
            todos[todoIndex].title = updateData.title.trim();
          }
          if (updateData.completed !== undefined) {
            todos[todoIndex].completed = updateData.completed;
          }
          todos[todoIndex].updatedAt = new Date().toISOString();

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(todos[todoIndex])
          };

        case 'DELETE':
          // 删除todo
          if (!todoId) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: '缺少todo ID' })
            };
          }

          const deleteIndex = todos.findIndex(t => t.id === todoId);
          if (deleteIndex === -1) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: '待办事项未找到' })
            };
          }

          todos.splice(deleteIndex, 1);
          
          return {
            statusCode: 204,
            headers,
            body: ''
          };

        default:
          return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: '方法不允许' })
          };
      }
    }

    // 未知路径
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: '路径未找到',
        path: path,
        availablePaths: ['/todos', '/api/todos']
      })
    };

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '服务器内部错误',
        message: error.message 
      })
    };
  }
};

// 兼容性导出
exports.handler = exports.main;