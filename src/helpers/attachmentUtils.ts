import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('Attachment')

const bucket = process.env.BUCKET_NAME;
export class AttachmentUtils {
    constructor(private readonly s3: AWS.S3 = new XAWS.S3({ signatureVersion: "v4" })) { }
    async createPresignedUrl(action: string) {
        const key = "image/" + uuid.v4();
        logger.info("key" + key);
        const uploadUrl = await this.s3.getSignedUrlPromise(action, {
            Bucket: bucket, Key: key, Expires: 60
        });
        return { key, uploadUrl }
    }
}