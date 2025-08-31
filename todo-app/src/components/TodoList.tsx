import React, { FC } from 'react';
import { useTodoContext } from '../context/TodoContext';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';
import './TodoList.css';

/**
 * 待办事项列表组件
 * 负责渲染所有待办事项，处理加载状态和错误状态
 */
const TodoList: FC = () => {
  const { state } = useTodoContext();
  const { todos, loading, error } = state;

  // 加载状态显示
  if (loading) {
    return (
      <div className="loading" role="status" aria-label="正在加载待办事项">
        加载中...
      </div>
    );
  }

  // 错误状态显示
  if (error) {
    return (
      <div className="error" role="alert" aria-label="加载错误">
        错误: {error}
      </div>
    );
  }

  // 空状态显示
  if (todos.length === 0) {
    return (
      <div className="empty-state" role="status">
        暂无待办事项，添加一个开始吧！
      </div>
    );
  }

  // 渲染待办事项列表
  return (
    <div className="todo-list" role="list" aria-label="待办事项列表">
      {todos.map((todo: Todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;