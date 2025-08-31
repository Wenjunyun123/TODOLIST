import { Router } from 'express';
import { TodoController } from '../controllers/todoController';

/**
 * 待办事项路由配置
 * 定义所有与待办事项相关的API端点
 * 
 * 基础路径: /api
 * 所有路由都会被挂载到 /api 前缀下
 */

const router = Router();

/**
 * 待办事项相关路由
 */

// GET /api/todos - 获取所有待办事项
router.get('/todos', TodoController.getAllTodos);

// GET /api/todos/:id - 根据ID获取单个待办事项
router.get('/todos/:id', TodoController.getTodoById);

// POST /api/todos - 创建新的待办事项
router.post('/todos', TodoController.createTodo);

// PUT /api/todos/:id - 更新指定ID的待办事项
router.put('/todos/:id', TodoController.updateTodo);

// DELETE /api/todos/:id - 删除指定ID的待办事项
router.delete('/todos/:id', TodoController.deleteTodo);

/**
 * 导出路由器
 * 将在 server.ts 中被挂载到 /api 路径下
 */
export default router;