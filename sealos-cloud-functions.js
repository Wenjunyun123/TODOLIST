// Sealos云函数 - TODO应用后端API
// 将此代码复制到Sealos云开发平台创建云函数

// 数据模型和类型定义
class Todo {
  constructor(title) {
    this.id = this.generateId();
    this.title = title.trim();
    this.completed = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 内存存储（Sealos云函数版本）
let todos = [
  {
    id: Date.now().toString(36) + '1',
    title: '学习React',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: Date.now().toString(36) + '2',
    title: '构建TODO应用',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 存储工具类
class TodoStorage {
  static getAllTodos() {
    return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static getTodoById(id) {
    return todos.find(todo => todo.id === id);
  }

  static createTodo(title) {
    const newTodo = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    todos.push(newTodo);
    return newTodo;
  }

  static updateTodo(id, updates) {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return null;
    }

    const updatedTodo = {
      ...todos[todoIndex],
      ...updates,
      updatedAt: new Date()
    };

    todos[todoIndex] = updatedTodo;
    return updatedTodo;
  }

  static deleteTodo(id) {
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== id);
    return todos.length < initialLength;
  }
}

// 格式化响应数据
const formatTodoResponse = (todo) => ({
  id: todo.id,
  title: todo.title,
  completed: todo.completed,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString()
});

// 设置CORS头
const setCorsHeaders = (response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// 主要的云函数处理器
exports.handler = async (event, context) => {
  const { httpMethod, path, body, queryStringParameters } = event;
  
  // 创建响应对象
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: ''
  };

  try {
    // 处理OPTIONS预检请求
    if (httpMethod === 'OPTIONS') {
      return response;
    }

    // 解析路径
    const pathParts = path.split('/').filter(p => p);
    const isApiPath = pathParts[0] === 'api';
    const resource = pathParts[isApiPath ? 1 : 0];
    const id = pathParts[isApiPath ? 2 : 1];

    // 处理根路径请求
    if (!resource || resource === '') {
      response.body = JSON.stringify({
        message: 'TODO API is running',
        version: '1.0.0',
        endpoints: {
          'GET /todos': '获取所有待办事项',
          'GET /todos/:id': '获取单个待办事项',
          'POST /todos': '创建新待办事项',
          'PUT /todos/:id': '更新待办事项',
          'DELETE /todos/:id': '删除待办事项'
        }
      });
      return response;
    }

    // 路由处理
    if (resource === 'todos') {
      switch (httpMethod) {
        case 'GET':
          if (id) {
            // 获取单个todo
            const todo = TodoStorage.getTodoById(id);
            if (!todo) {
              response.statusCode = 404;
              response.body = JSON.stringify({ error: '待办事项未找到' });
            } else {
              response.body = JSON.stringify(formatTodoResponse(todo));
            }
          } else {
            // 获取所有todos
            const todos = TodoStorage.getAllTodos();
            const formattedTodos = todos.map(formatTodoResponse);
            response.body = JSON.stringify(formattedTodos);
          }
          break;

        case 'POST':
          // 创建新todo
          const createData = JSON.parse(body || '{}');
          const { title } = createData;
          
          if (!title || title.trim().length === 0) {
            response.statusCode = 400;
            response.body = JSON.stringify({ error: '标题不能为空' });
          } else if (title.length > 200) {
            response.statusCode = 400;
            response.body = JSON.stringify({ error: '标题长度不能超过200个字符' });
          } else {
            const newTodo = TodoStorage.createTodo(title);
            response.statusCode = 201;
            response.body = JSON.stringify(formatTodoResponse(newTodo));
          }
          break;

        case 'PUT':
          // 更新todo
          if (!id) {
            response.statusCode = 400;
            response.body = JSON.stringify({ error: '缺少todo ID' });
            break;
          }

          const updateData = JSON.parse(body || '{}');
          
          // 验证更新数据
          if (updateData.title !== undefined) {
            if (typeof updateData.title !== 'string' || updateData.title.trim().length === 0) {
              response.statusCode = 400;
              response.body = JSON.stringify({ error: '标题不能为空' });
              break;
            }
            if (updateData.title.length > 200) {
              response.statusCode = 400;
              response.body = JSON.stringify({ error: '标题长度不能超过200个字符' });
              break;
            }
          }

          if (updateData.completed !== undefined && typeof updateData.completed !== 'boolean') {
            response.statusCode = 400;
            response.body = JSON.stringify({ error: '完成状态必须是布尔值' });
            break;
          }

          const updatedTodo = TodoStorage.updateTodo(id, updateData);
          if (!updatedTodo) {
            response.statusCode = 404;
            response.body = JSON.stringify({ error: '待办事项未找到' });
          } else {
            response.body = JSON.stringify(formatTodoResponse(updatedTodo));
          }
          break;

        case 'DELETE':
          // 删除todo
          if (!id) {
            response.statusCode = 400;
            response.body = JSON.stringify({ error: '缺少todo ID' });
            break;
          }

          const deleted = TodoStorage.deleteTodo(id);
          if (!deleted) {
            response.statusCode = 404;
            response.body = JSON.stringify({ error: '待办事项未找到' });
          } else {
            response.statusCode = 204;
            response.body = '';
          }
          break;

        default:
          response.statusCode = 405;
          response.body = JSON.stringify({ error: '方法不允许' });
      }
    } else {
      // 未知路径
      response.statusCode = 404;
      response.body = JSON.stringify({ error: '路径未找到' });
    }

  } catch (error) {
    console.error('处理请求时发生错误:', error);
    response.statusCode = 500;
    response.body = JSON.stringify({ error: '服务器内部错误' });
  }

  return response;
};

// 如果在Sealos中需要分别创建多个函数，可以使用以下单独的函数：

// 获取所有todos
exports.getAllTodos = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };

  try {
    const todos = TodoStorage.getAllTodos();
    const formattedTodos = todos.map(formatTodoResponse);
    response.body = JSON.stringify(formattedTodos);
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: '服务器内部错误' });
  }

  return response;
};

// 创建todo
exports.createTodo = async (event, context) => {
  const response = {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };

  try {
    const { title } = JSON.parse(event.body || '{}');
    
    if (!title || title.trim().length === 0) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: '标题不能为空' });
    } else if (title.length > 200) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: '标题长度不能超过200个字符' });
    } else {
      const newTodo = TodoStorage.createTodo(title);
      response.body = JSON.stringify(formatTodoResponse(newTodo));
    }
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: '服务器内部错误' });
  }

  return response;
};

// 更新todo
exports.updateTodo = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  };

  try {
    const { id } = event.pathParameters || {};
    const updateData = JSON.parse(event.body || '{}');
    
    if (!id) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: '缺少todo ID' });
      return response;
    }

    const updatedTodo = TodoStorage.updateTodo(id, updateData);
    if (!updatedTodo) {
      response.statusCode = 404;
      response.body = JSON.stringify({ error: '待办事项未找到' });
    } else {
      response.body = JSON.stringify(formatTodoResponse(updatedTodo));
    }
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: '服务器内部错误' });
  }

  return response;
};

// 删除todo
exports.deleteTodo = async (event, context) => {
  const response = {
    statusCode: 204,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  };

  try {
    const { id } = event.pathParameters || {};
    
    if (!id) {
      response.statusCode = 400;
      response.body = JSON.stringify({ error: '缺少todo ID' });
      return response;
    }

    const deleted = TodoStorage.deleteTodo(id);
    if (!deleted) {
      response.statusCode = 404;
      response.body = JSON.stringify({ error: '待办事项未找到' });
    }
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: '服务器内部错误' });
  }

  return response;
};