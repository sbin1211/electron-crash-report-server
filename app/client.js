/* global document */
import App from "./app.html";
import { init } from "sapper/runtime.js";
import { routes } from "./manifest/client.js";
import { Store } from "svelte/store.js";

const store = data => new Store(data);

init({
  App,
  routes,
  store,
  target: document.querySelector("#sapper"),
});
