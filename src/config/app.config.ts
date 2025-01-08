export const AppConfig = () => ({
  port: parseInt(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'picnic',
  salts: parseInt(process.env.SALTS) || 5,
  env: process.env.NODE_ENV || 'DEVELOPMENT',
});
