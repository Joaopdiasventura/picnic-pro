export const DatabaseConfig = (): DatabaseConfigInterface => ({
  mongo: { uri: process.env.MONGO_URI || "mongodb://localhost:27017/picnic" },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
  },
});

interface DatabaseConfigInterface {
  mongo: {
    uri: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  };
}
