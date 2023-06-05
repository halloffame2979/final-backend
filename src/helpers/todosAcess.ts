import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const TableName = process.env.TODOS_TABLE;
export class TodosAccess {
    //@ts-ignore
    constructor(private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()) {
    }
    async getTodoOfUser(userId: string, todoId: string) {
        logger.info("Get todo " + todoId + " of user " + userId);
        let item = (await this.documentClient.get({
            TableName,
            Key: {
                userId, todoId
            }
        }).promise()).Item;
        return item;
    }
    async getAllTodosOfUser(userId: String): Promise<TodoItem[]> {
        logger.info("Get all todos of user " + userId);
        let response: DocumentClient.QueryOutput = await this.documentClient.query({
            TableName,
            IndexName: process.env.USERID_INDEX,
            KeyConditionExpression: "userId=:userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();
        return response.Items as TodoItem[];
    }

    async createTodoForUser(todoPayload: Object) {
        await this.documentClient.put({
            TableName,
            Item: todoPayload
        }).promise();
        logger.info("Create successfully");
    }

    async updateTodoOfUser(userId: string, todoId: string, payload) {
        let serializedCondition = Object.keys(payload).map((k, index) => `attribute_exists(#k${index})`).join(" AND ");
        let serializeParam = Object.keys(payload).map((k, index) => `#k${index} = :v${index}`).join(", ");
        const keys = {};
        const values = {};
        for (let i = 0; i < Object.keys(payload).length; i++) {
            keys[`#k${i}`] = Object.keys(payload)[i];
            values[`:v${i}`] = payload[Object.keys(payload)[i]];
        }
        let serializedUpdate = "SET " + Object.keys(payload).map(k => `${k} = '${payload[k]}'`).join(", ");

        await this.documentClient.update({
            TableName,
            Key: {
                userId, todoId
            },
            UpdateExpression: "SET " + serializeParam,
            ConditionExpression: serializedCondition,
            ExpressionAttributeNames: keys,
            ExpressionAttributeValues: values
        }).promise();
        logger.info("Update successfully");
    }

    async deleteTodoOfUser(userId: string, todoId: string) {
        await this.documentClient.delete({
            TableName,
            Key: {
                userId, todoId
            },
        }).promise();
        logger.info("Delete successfully");
    }
}