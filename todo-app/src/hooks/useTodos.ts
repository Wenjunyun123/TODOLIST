import { useCallback } from 'react';
import { useTodoContext } from '../context/TodoContext';
import { todoApi } from '../services/api';
import { CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

export const useTodos = () => {
  const { state, dispatch } = useTodoContext();

  const fetchTodos = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const todos = await todoApi.getTodos();
      dispatch({ type: 'SET_TODOS', payload: todos });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '获取待办事项失败' });
      console.error('获取待办事项失败:', error);
    }
  }, [dispatch]);

  const createTodo = useCallback(async (todoData: CreateTodoRequest) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      dispatch({ type: 'ADD_TODO', payload: newTodo });
      return newTodo;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '创建待办事项失败' });
      console.error('创建待办事项失败:', error);
      throw error;
    }
  }, [dispatch]);

  const updateTodo = useCallback(async (id: string, updates: UpdateTodoRequest) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
      return updatedTodo;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '更新待办事项失败' });
      console.error('更新待办事项失败:', error);
      throw error;
    }
  }, [dispatch]);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      dispatch({ type: 'DELETE_TODO', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '删除待办事项失败' });
      console.error('删除待办事项失败:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
};