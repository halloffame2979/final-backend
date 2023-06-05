import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger';
import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger("AttachmentAPI");
export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const todoId = event.pathParameters.todoId
            const userId = getUserId(event);
            const uploadUrl = await createAttachmentPresignedUrl(userId, todoId);
            return {
                statusCode: 200,
                body: JSON.stringify({ uploadUrl })
            }
        } catch (error) {
            logger.error(error);
            return { statusCode: 500, body: error.message || "Internal server error" }

        }

    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
