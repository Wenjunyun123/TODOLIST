import React, { useState, useCallback } from 'react';
import { useTodos } from '../hooks/useTodos';
import './AddTodo.css';

/**
 * 添加待办事项组件
 * 提供输入框和提交按钮，支持表单验证和加载状态
 */
const AddTodo: React.FC = () => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createTodo } = useTodos();

  /**
   * 处理表单提交
   * 验证输入内容，创建待办事项，处理加载状态
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert('请输入待办事项内容');
      return;
    }

    setIsLoading(true);
    try {
      await createTodo({ title: trimmedTitle });
      setTitle(''); // 清空输入框
    } catch (error) {
      console.error('创建待办事项失败:', error);
      alert('创建失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [title, createTodo]);

  /**
   * 处理输入框内容变化
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  return (
    <form 
      onSubmit={handleSubmit} 
      className="add-todo"
      role="form"
      aria-label="添加新的待办事项"
    >
      <div className="add-todo-input-group">
        <input
          type="text"
          value={title}
          onChange={handleInputChange}
          placeholder="输入新的待办事项..."
          className="add-todo-input"
          disabled={isLoading}
          maxLength={200}
          aria-label="待办事项内容"
        />
        <button 
          type="submit" 
          className="add-todo-btn"
          disabled={isLoading || !title.trim()}
          aria-label={isLoading ? '正在添加待办事项' : '添加待办事项'}
        >
          {isLoading ? '添加中...' : '添加'}
        </button>
      </div>
    </form>
  );
};

export default AddTodo;