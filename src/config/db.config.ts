export const DatabaseConfig = () => ({
  mongo: { uri: process.env.MONGO_URI || 'mongodb://localhost:27017/picnic' },
});
