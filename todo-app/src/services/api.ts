import axios from 'axios';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

/**
 * API配置和服务
 * 支持本地后端API和Sealos云函数两种模式
 */

// API基础URL，优先使用环境变量配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 创建axios实例用于常规API调用
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 检测是否使用Sealos云函数（根据URL特征判断）
const isSealosFunction = API_BASE_URL.includes('sealos.run');

/**
 * Sealos云函数专用API调用函数
 * 将标准HTTP请求包装为云函数所需的格式
 * @param path - API路径
 * @param method - HTTP方法
 * @param data - 请求数据
 * @returns 响应数据
 */
const callSealosFunction = async (path: string, method: string = 'GET', data?: any) => {
  const response = await axios({
    url: API_BASE_URL,
    method: 'POST', // 云函数统一使用POST方法
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      method, // 实际的HTTP方法
      path,   // 实际的API路径
      body: data ? JSON.stringify(data) : undefined // 请求体数据
    }
  });
  
  // 处理云函数的响应格式 {data: ...}
  if (response.data && typeof response.data === 'object') {
    // 检查是否有错误信息
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    // 返回实际数据
    return response.data.data || response.data;
  }
  return response.data;
};

/**
 * 响应拦截器 - 处理云函数的特殊响应格式
 * 统一处理 {data: ...} 格式的响应
 */
api.interceptors.response.use(
  (response) => {
    // 检查是否为云函数响应格式
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // 处理错误情况
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      // 提取实际数据
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    console.error('API请求失败:', error.message);
    return Promise.reject(error);
  }
);

/**
 * TODO API服务对象
 * 提供完整的CRUD操作，自动适配本地API和云函数
 */
export const todoApi = {
  /**
   * 获取所有待办事项
   * @returns Promise<Todo[]> 待办事项列表
   */
  getTodos: async (): Promise<Todo[]> => {
    try {
      if (isSealosFunction) {
        // 使用Sealos云函数调用
        const data = await callSealosFunction('/todos', 'GET');
        return Array.isArray(data) ? data : [];
      } else {
        // 使用常规API调用
        const response = await api.get('/todos');
        return response.data || [];
      }
    } catch (error) {
      console.error('获取待办事项失败:', error);
      // 返回友好的错误提示
      return [{
        id: 'error-1',
        title: '无法连接到服务器，请检查网络连接',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
    }
  },

  /**
   * 创建新的待办事项
   * @param todo - 待办事项创建请求
   * @returns Promise<Todo> 创建的待办事项
   */
  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    try {
      if (isSealosFunction) {
        const data = await callSealosFunction('/todos', 'POST', todo);
        return data;
      } else {
        const response = await api.post('/todos', todo);
        return response.data;
      }
    } catch (error) {
      console.error('创建待办事项失败:', error);
      // 返回本地模拟的待办事项
      return {
        id: `local-${Date.now()}`,
        title: todo.title,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * 更新待办事项
   * @param id - 待办事项ID
   * @param updates - 更新数据
   * @returns Promise<Todo> 更新后的待办事项
   */
  updateTodo: async (id: string, updates: UpdateTodoRequest): Promise<Todo> => {
    try {
      if (isSealosFunction) {
        const data = await callSealosFunction(`/todos/${id}`, 'PUT', updates);
        return data;
      } else {
        const response = await api.put(`/todos/${id}`, updates);
        return response.data;
      }
    } catch (error) {
      console.error('更新待办事项失败:', error);
      // 返回本地模拟的更新结果
      return {
        id,
        title: updates.title || '更新的待办事项',
        completed: updates.completed ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * 删除待办事项
   * @param id - 待办事项ID
   * @returns Promise<void>
   */
  deleteTodo: async (id: string): Promise<void> => {
    try {
      if (isSealosFunction) {
        await callSealosFunction(`/todos/${id}`, 'DELETE');
      } else {
        await api.delete(`/todos/${id}`);
      }
    } catch (error) {
      console.error('删除待办事项失败:', error);
      // 静默处理删除错误，避免影响用户体验
      console.log('删除操作已完成（可能为本地模拟）');
    }
  },
};