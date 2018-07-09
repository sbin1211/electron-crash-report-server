import "dotenv/config";
import App from "./App.html";
import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
import massive from "massive";
import { routes } from "./manifest/server.js";
import sapper from "sapper";
import sirv from "sirv";

const server = express();

massive(process.env.DATABASE_URL)
  .then(db => {
    server.set("db", db);
    server.use(bodyParser());
    server.use(compression({ threshold: 0 }));
    server.use(sirv("assets"));
    server.use(sapper({ App, routes }));
    server.listen(process.env.PORT);
  })
  .catch(error => {
    console.error(error);
    throw error;
  });
