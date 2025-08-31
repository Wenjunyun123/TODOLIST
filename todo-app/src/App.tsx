import React, { useEffect } from 'react';
import { TodoProvider } from './context/TodoContext';
import { useTodos } from './hooks/useTodos';
import Header from './components/Header';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import './App.css';

const TodoApp: React.FC = () => {
  const { fetchTodos } = useTodos();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <div className="app">
      <div className="container">
        <Header />
        <AddTodo />
        <TodoList />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <TodoProvider>
      <TodoApp />
    </TodoProvider>
  );
};

export default App;