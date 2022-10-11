import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.DB_URI).then(() => {
  console.log(`[+] DB CONNECTION ESTABLISHED...`);
  const HTTP_SERVER = app.listen(process.env.PORT, () => {
    console.log(`[+] SERVER STARTED ON PORT: ${process.env.PORT}`);
  });
});
