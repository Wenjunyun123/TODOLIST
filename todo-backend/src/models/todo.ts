/**
 * 待办事项数据模型和类型定义
 * 定义了所有与待办事项相关的接口和类型
 */

/**
 * 待办事项核心数据模型
 * 用于内部数据存储和处理
 */
export interface Todo {
  /** 唯一标识符 */
  id: string;
  /** 待办事项标题 */
  title: string;
  /** 完成状态 */
  completed: boolean;
  /** 创建时间 */
  createdAt: Date;
  /** 最后更新时间 */
  updatedAt: Date;
}

/**
 * 创建待办事项请求接口
 * 用于POST /api/todos请求体验证
 */
export interface CreateTodoRequest {
  /** 待办事项标题，必填字段 */
  title: string;
}

/**
 * 更新待办事项请求接口
 * 用于PUT /api/todos/:id请求体验证
 */
export interface UpdateTodoRequest {
  /** 待办事项标题，可选更新 */
  title?: string;
  /** 完成状态，可选更新 */
  completed?: boolean;
}

/**
 * 待办事项API响应接口
 * 用于统一API响应格式，将Date转换为ISO字符串
 */
export interface TodoResponse {
  /** 唯一标识符 */
  id: string;
  /** 待办事项标题 */
  title: string;
  /** 完成状态 */
  completed: boolean;
  /** 创建时间（ISO字符串格式） */
  createdAt: string;
  /** 最后更新时间（ISO字符串格式） */
  updatedAt: string;
}

/**
 * API错误响应接口
 * 统一错误响应格式
 */
export interface ErrorResponse {
  /** 错误信息 */
  error: string;
  /** 详细错误描述（可选） */
  message?: string;
  /** 错误发生时间戳（可选） */
  timestamp?: string;
}

/**
 * 待办事项统计信息接口
 * 用于统计相关API响应
 */
export interface TodoStats {
  /** 总数 */
  total: number;
  /** 已完成数量 */
  completed: number;
  /** 待完成数量 */
  pending: number;
}