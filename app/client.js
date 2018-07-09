/* global document */
import App from "./App.html";
import { init } from "sapper/runtime.js";
import { routes } from "./manifest/client.js";

init({
  App,
  routes,
  target: document.querySelector("#sapper"),
});
