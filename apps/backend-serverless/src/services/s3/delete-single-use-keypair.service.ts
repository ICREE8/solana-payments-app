import pkg from 'aws-sdk';
const { S3 } = pkg;

// This service method should upload the keypair to an encrypted s3 bucket for rent collection
// at a later time.

export const deleteSingleUseKeypair = async (key: string) => {
    const bucket = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_NAME;
    const region = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_REGION;

    if (bucket == null || region == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new S3({
        region: region,
    });

    try {
        // TODO: Log the successful upload in sentry
        await s3
            .deleteObject({
                Bucket: bucket,
                Key: key,
            })
            .promise();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Couldnt delete keypair in s3. Unknown reason.');
        }
    }
};
