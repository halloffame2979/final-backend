import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger';
import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
const logger = createLogger("UpdateAPI");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {
      const userId = getUserId(event);
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      await updateTodo(userId, todoId, updatedTodo);
      return {
        statusCode: 200,
        body: "Update successfully"
      }
    } catch (error) {
      logger.error(error);
      return { statusCode: 500, body: error.message || "Internal server error" }
    }

  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
