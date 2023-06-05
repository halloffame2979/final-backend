import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger';
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const todosAcess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
export async function getTodosForUser(userId: String) {
    const itemList = await todosAcess.getAllTodosOfUser(userId);
    return {
        items: itemList
    }
}

export async function createTodo(todoPayload: CreateTodoRequest, userId: string) {
    let todoId: string = uuid.v4();
    let createdAt = new Date().getTime().toString();
    const payload: TodoItem = {
        todoId,
        userId,
        createdAt,
        done: false,
        attachmentUrl:"",
        ...todoPayload
    }
    await todosAcess.createTodoForUser(payload);
    return {
        item: payload
    }
}

export async function updateTodo(userId: string, todoId: string, updatePayLoad: UpdateTodoRequest) {
    let item = await todosAcess.getTodoOfUser(userId, todoId);
    if (!item) throw new Error("Record doesn't exist or user is not allowed");
    return await todosAcess.updateTodoOfUser(userId, todoId, updatePayLoad);
}

export async function deleteTodo(userId: string, todoId: string) {
    let item = await todosAcess.getTodoOfUser(userId, todoId);
    if (!item) throw new Error("Record doesn't exist or user is not allowed");
    return await todosAcess.deleteTodoOfUser(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId, todoId) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const { uploadUrl, key } = await attachmentUtils.createPresignedUrl("putObject");
    const payload = {
        attachmentUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
    }
    await todosAcess.updateTodoOfUser(userId, todoId, payload);
    return uploadUrl;
}