import { Request, Response } from 'express';
import { TodoStorage } from '../utils/storage';
import { CreateTodoRequest, UpdateTodoRequest, TodoResponse } from '../models/todo';

/**
 * 待办事项控制器
 * 处理所有与待办事项相关的HTTP请求
 */

/**
 * 转换Todo对象为API响应格式
 * @param todo - 原始Todo对象
 * @returns 格式化的TodoResponse对象
 */
const formatTodoResponse = (todo: any): TodoResponse => ({
  id: todo.id,
  title: todo.title,
  completed: todo.completed,
  createdAt: todo.createdAt.toISOString(),
  updatedAt: todo.updatedAt.toISOString()
});

export class TodoController {
  /**
   * 获取所有待办事项
   * @route GET /api/todos
   */
  static async getAllTodos(req: Request, res: Response): Promise<void> {
    try {
      console.log('获取所有待办事项请求');
      const todos = TodoStorage.getAllTodos();
      const formattedTodos = todos.map(formatTodoResponse);
      
      console.log(`成功获取 ${formattedTodos.length} 个待办事项`);
      res.json(formattedTodos);
    } catch (error) {
      console.error('获取待办事项失败:', error);
      res.status(500).json({ 
        error: '服务器内部错误',
        message: '获取待办事项列表时发生错误'
      });
    }
  }

  /**
   * 根据ID获取单个待办事项
   * @route GET /api/todos/:id
   */
  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`获取待办事项请求 - ID: ${id}`);
      
      const todo = TodoStorage.getTodoById(id);
      
      if (!todo) {
        console.warn(`待办事项未找到 - ID: ${id}`);
        res.status(404).json({ 
          error: '待办事项未找到',
          message: `ID为 ${id} 的待办事项不存在`
        });
        return;
      }

      console.log(`成功获取待办事项 - ID: ${id}`);
      res.json(formatTodoResponse(todo));
    } catch (error) {
      console.error('获取待办事项失败:', error);
      res.status(500).json({ 
        error: '服务器内部错误',
        message: '获取待办事项时发生错误'
      });
    }
  }

  /**
   * 创建新的待办事项
   * @route POST /api/todos
   */
  static async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const { title }: CreateTodoRequest = req.body;
      console.log(`创建待办事项请求 - 标题: ${title}`);
      
      // 验证标题
      if (!title || title.trim().length === 0) {
        console.warn('创建失败: 标题为空');
        res.status(400).json({ 
          error: '标题不能为空',
          message: '请提供有效的待办事项标题'
        });
        return;
      }

      if (title.length > 200) {
        console.warn(`创建失败: 标题过长 (${title.length} 字符)`);
        res.status(400).json({ 
          error: '标题长度不能超过200个字符',
          message: `当前标题长度: ${title.length} 字符`
        });
        return;
      }

      const newTodo = TodoStorage.createTodo(title.trim());
      console.log(`成功创建待办事项 - ID: ${newTodo.id}`);
      res.status(201).json(formatTodoResponse(newTodo));
    } catch (error) {
      console.error('创建待办事项失败:', error);
      res.status(500).json({ 
        error: '服务器内部错误',
        message: '创建待办事项时发生错误'
      });
    }
  }

  /**
   * 更新待办事项
   * @route PUT /api/todos/:id
   */
  static async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: UpdateTodoRequest = req.body;
      console.log(`更新待办事项请求 - ID: ${id}, 更新内容:`, updates);

      // 验证更新数据
      if (updates.title !== undefined) {
        if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
          console.warn('更新失败: 标题为空或类型错误');
          res.status(400).json({ 
            error: '标题不能为空',
            message: '标题必须是非空字符串'
          });
          return;
        }
        if (updates.title.length > 200) {
          console.warn(`更新失败: 标题过长 (${updates.title.length} 字符)`);
          res.status(400).json({ 
            error: '标题长度不能超过200个字符',
            message: `当前标题长度: ${updates.title.length} 字符`
          });
          return;
        }
        // 去除首尾空格
        updates.title = updates.title.trim();
      }

      if (updates.completed !== undefined && typeof updates.completed !== 'boolean') {
        console.warn('更新失败: 完成状态类型错误');
        res.status(400).json({ 
          error: '完成状态必须是布尔值',
          message: 'completed字段只能是true或false'
        });
        return;
      }

      const updatedTodo = TodoStorage.updateTodo(id, updates);
      
      if (!updatedTodo) {
        console.warn(`更新失败: 待办事项未找到 - ID: ${id}`);
        res.status(404).json({ 
          error: '待办事项未找到',
          message: `ID为 ${id} 的待办事项不存在`
        });
        return;
      }

      console.log(`成功更新待办事项 - ID: ${id}`);
      res.json(formatTodoResponse(updatedTodo));
    } catch (error) {
      console.error('更新待办事项失败:', error);
      res.status(500).json({ 
        error: '服务器内部错误',
        message: '更新待办事项时发生错误'
      });
    }
  }

  /**
   * 删除待办事项
   * @route DELETE /api/todos/:id
   */
  static async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`删除待办事项请求 - ID: ${id}`);
      
      const deleted = TodoStorage.deleteTodo(id);
      
      if (!deleted) {
        console.warn(`删除失败: 待办事项未找到 - ID: ${id}`);
        res.status(404).json({ 
          error: '待办事项未找到',
          message: `ID为 ${id} 的待办事项不存在`
        });
        return;
      }

      console.log(`成功删除待办事项 - ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      console.error('删除待办事项失败:', error);
      res.status(500).json({ 
        error: '服务器内部错误',
        message: '删除待办事项时发生错误'
      });
    }
  }
}