import { Todo } from '../models/todo';
import { v4 as uuidv4 } from 'uuid';

/**
 * 待办事项存储管理
 * 
 * 注意：当前使用内存存储，仅用于开发和演示
 * 生产环境应该使用持久化数据库（如 MongoDB、PostgreSQL 等）
 */

// 内存存储 - 应用重启后数据会丢失
let todos: Todo[] = [
  {
    id: uuidv4(),
    title: '学习React',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    title: '构建TODO应用',
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * 待办事项存储类
 * 提供所有数据操作方法
 */
export class TodoStorage {
  /**
   * 获取所有待办事项
   * @returns 按创建时间倒序排列的待办事项数组
   */
  static getAllTodos(): Todo[] {
    console.log(`获取所有待办事项，当前总数: ${todos.length}`);
    return todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * 根据ID获取单个待办事项
   * @param id - 待办事项ID
   * @returns 找到的待办事项或undefined
   */
  static getTodoById(id: string): Todo | undefined {
    const todo = todos.find(todo => todo.id === id);
    console.log(`查找待办事项 ID: ${id}, 结果: ${todo ? '找到' : '未找到'}`);
    return todo;
  }

  /**
   * 创建新的待办事项
   * @param title - 待办事项标题
   * @returns 新创建的待办事项
   */
  static createTodo(title: string): Todo {
    const newTodo: Todo = {
      id: uuidv4(),
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    todos.push(newTodo);
    console.log(`创建新待办事项: ${newTodo.title} (ID: ${newTodo.id})`);
    return newTodo;
  }

  /**
   * 更新待办事项
   * @param id - 待办事项ID
   * @param updates - 要更新的字段
   * @returns 更新后的待办事项或null（如果未找到）
   */
  static updateTodo(id: string, updates: { title?: string; completed?: boolean }): Todo | null {
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      console.log(`更新失败: 未找到ID为 ${id} 的待办事项`);
      return null;
    }

    const originalTodo = todos[todoIndex];
    const updatedTodo = {
      ...originalTodo,
      ...updates,
      updatedAt: new Date()
    };

    todos[todoIndex] = updatedTodo;
    console.log(`更新待办事项: ${originalTodo.title} -> ${updatedTodo.title || originalTodo.title} (ID: ${id})`);
    return updatedTodo;
  }

  /**
   * 删除待办事项
   * @param id - 待办事项ID
   * @returns 是否成功删除
   */
  static deleteTodo(id: string): boolean {
    const initialLength = todos.length;
    const todoToDelete = todos.find(todo => todo.id === id);
    
    todos = todos.filter(todo => todo.id !== id);
    const deleted = todos.length < initialLength;
    
    if (deleted && todoToDelete) {
      console.log(`删除待办事项: ${todoToDelete.title} (ID: ${id})`);
    } else {
      console.log(`删除失败: 未找到ID为 ${id} 的待办事项`);
    }
    
    return deleted;
  }

  /**
   * 清空所有待办事项
   * 主要用于测试或重置数据
   */
  static clearAllTodos(): void {
    const count = todos.length;
    todos = [];
    console.log(`清空所有待办事项，共删除 ${count} 个`);
  }

  /**
   * 获取待办事项统计信息
   * @returns 包含总数和完成数的统计对象
   */
  static getStats(): { total: number; completed: number; pending: number } {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  }
}