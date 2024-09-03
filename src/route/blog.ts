import { Hono } from "hono";
import {PrismaClient} from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {decode,sign,verify} from 'hono/jwt'

export const BlogRoute= new Hono<{
    Bindings:{
      DATABASE_URL:string;
      JWT_SECRET: string;
    
   
    },
    Variables:{
      userId:String;
    }
  
  }>();


 BlogRoute.use("/*",async (c,next)=>{
  const authHeader= c.req.header("authorization")||"";
 const user=await  verify(authHeader,c.env.JWT_SECRET);

 if(user){
     // @ts-ignore: Unreachable code error
     c.set("userId",user.id);
 await next();
 }
 else{
    c.status(403);
    return c.json({
      message:"You are not logged in"
    })
 }
 })

BlogRoute.post('/post', async(c) => {
  const body = await c.req.json();
  console.log('Request Body:', body); // Log the body for debugging

  const authorId=c.get("userId");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());
 const blog= await prisma.blog.create({
    data:{
      title:body.title,
      content:body.content,
      authorId: Number(authorId)
    }
  })
   return c.json({
    id:blog.id
   })
  })

  //---------------------------------------
  
  
  
  
 BlogRoute.put('/update', async(c) => {
  const body = await c.req.json();
  console.log('Request Body:', body); // Log the body for debugging

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());
 const blog= await prisma.blog.update({
   where:{
       id:body.id
   },  
  data:{
      title:body.title,
      content:body.content,
     
    }
  })
   return c.json({
    id:blog.id,
    messgage:"update done"
   })
  })
  
  
  BlogRoute.get('/blogpost/:id', async(c)=>{
   
    const id = await c.req.param("id");
 

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  try{
 const blog= await prisma.blog.findFirst({
    where:{
      id:Number(id)
    }
  })
   return c.json({
    blog
   })}
   catch(e){
     return c.json({
      message:"Error while fetching"
     })
   }
  })
  
  
  
BlogRoute.get('/bulk',async (c)=>{

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());

  const blogs =await prisma.blog.findMany();

  return c.json({
    blogs
  })
  })
  