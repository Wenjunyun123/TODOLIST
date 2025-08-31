import React, { useMemo } from 'react';
import { useTodoContext } from '../context/TodoContext';
import './Header.css';

/**
 * 头部组件
 * 显示待办事项的总数、完成数量和进度条
 */
const Header: React.FC = () => {
  const { state } = useTodoContext();
  const { todos } = state;
  
  // 使用 useMemo 优化计算性能
  const { totalCount, completedCount, progressPercentage } = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      totalCount: total,
      completedCount: completed,
      progressPercentage: percentage
    };
  }, [todos]);

  return (
    <header className="app-header" role="banner">
      <h1 className="app-title">我的待办清单</h1>
      <div className="todo-stats" role="region" aria-label="待办事项统计">
        <span className="stats-text" aria-live="polite">
          已完成 {completedCount} / {totalCount} 项
        </span>
        {totalCount > 0 && (
          <div 
            className="progress-bar"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`完成进度 ${Math.round(progressPercentage)}%`}
            title={`已完成 ${completedCount} 个，共 ${totalCount} 个待办事项`}
          >
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;