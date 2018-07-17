import "dotenv/config";
import App from "./app.html";
import compression from "compression";
import express from "express";
import massive from "massive";
import { routes } from "./manifest/server.js";
import sapper from "sapper";
import sirv from "sirv";
import { Store } from "svelte/store.js";

const server = express();
const store = () =>
  new Store({
    application: "",
    applications: [],
    closed: false,
    devicePixelRatio: 1,
    report: {},
    reports: [],
  });

massive(process.env.DATABASE_URL)
  .then(db => {
    server.set("db", db);
    server.use(express.json());
    server.use(compression({ threshold: 0 }));
    server.use(sirv("assets"));
    server.use(sapper({ App, routes, store }));
    server.listen(process.env.PORT);
  })
  .catch(error => {
    console.error(error);
    throw error;
  });
