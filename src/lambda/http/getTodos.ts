import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger';
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger("GetAPI");
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    try {
      let userId = getUserId(event);
      const todos = await getTodosForUser(userId);
      return { statusCode: 200, body: JSON.stringify(todos) }
    } catch (error) {
      logger.error(error);
      return { statusCode: 500, body: error.message || "Internal server error" }
    }

  })
handler.use(
  cors({
    credentials: true
  })
)
