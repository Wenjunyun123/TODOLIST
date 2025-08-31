import React, { useState, useCallback } from 'react';
import { Todo } from '../types/todo';
import { useTodos } from '../hooks/useTodos';
import './TodoItem.css';

/**
 * 待办事项组件的属性接口
 */
interface TodoItemProps {
  todo: Todo;
}

/**
 * 单个待办事项组件
 * 支持完成状态切换、编辑和删除功能
 */
const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const { updateTodo, deleteTodo } = useTodos();

  /**
   * 切换待办事项完成状态
   */
  const handleToggleComplete = useCallback(async () => {
    await updateTodo(todo.id, { completed: !todo.completed });
  }, [todo.id, todo.completed, updateTodo]);

  /**
   * 删除待办事项（带确认提示）
   */
  const handleDelete = useCallback(async () => {
    if (window.confirm('确定要删除这个待办事项吗？')) {
      await deleteTodo(todo.id);
    }
  }, [todo.id, deleteTodo]);

  /**
   * 进入编辑模式
   */
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditTitle(todo.title); // 重置编辑内容
  }, [todo.title]);

  /**
   * 保存编辑内容
   */
  const handleSave = useCallback(async () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      await updateTodo(todo.id, { title: trimmedTitle });
    }
    setIsEditing(false);
  }, [editTitle, todo.id, todo.title, updateTodo]);

  /**
   * 取消编辑
   */
  const handleCancel = useCallback(() => {
    setEditTitle(todo.title);
    setIsEditing(false);
  }, [todo.title]);

  /**
   * 处理键盘事件（Enter保存，Escape取消）
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  return (
    <div 
      className={`todo-item ${todo.completed ? 'completed' : ''}`}
      role="listitem"
      aria-label={`待办事项: ${todo.title}`}
    >
      {/* 完成状态复选框 */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggleComplete}
        className="todo-checkbox"
        aria-label={`标记${todo.completed ? '未完成' : '已完成'}`}
      />
      
      {isEditing ? (
        // 编辑模式
        <div className="todo-edit">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            className="todo-edit-input"
            placeholder="请输入待办事项内容"
            autoFocus
            aria-label="编辑待办事项标题"
          />
          <div className="todo-edit-actions">
            <button 
              onClick={handleSave} 
              className="save-btn"
              disabled={!editTitle.trim()}
              aria-label="保存修改"
            >
              保存
            </button>
            <button 
              onClick={handleCancel} 
              className="cancel-btn"
              aria-label="取消编辑"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        // 显示模式
        <div className="todo-content">
          <span 
            className="todo-title" 
            onDoubleClick={handleEdit}
            title="双击编辑"
          >
            {todo.title}
          </span>
          <div className="todo-actions">
            <button 
              onClick={handleEdit} 
              className="edit-btn"
              aria-label="编辑待办事项"
            >
              编辑
            </button>
            <button 
              onClick={handleDelete} 
              className="delete-btn"
              aria-label="删除待办事项"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;