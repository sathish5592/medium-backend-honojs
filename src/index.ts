import { Hono } from 'hono'

import { UserRoute } from './route/user';
import { BlogRoute } from './route/blog';

const app = new Hono<{
  Bindings:{
    DATABASE_URL:string;
    JWT_SECRET: string;
  }}>();
  
  app.route("/api/v1/user",UserRoute);
  app.route("/api/v1/blog",BlogRoute);

 export default app


