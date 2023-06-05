import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger';
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger("CreateAPI");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const newTodo: CreateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event);
      const response = await createTodo(newTodo, userId);
      return {
        statusCode: 200,
        body: JSON.stringify(response)
      }
    } catch (error) {
      logger.error(error);
      return { statusCode: 500, body: error.message || "Internal server error" }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
