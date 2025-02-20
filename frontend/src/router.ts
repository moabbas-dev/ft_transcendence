import HomePage from "./pages/home.js";
import RegisterPage from "./pages/register.js";
import PlayPage from "./pages/play.js";
import LocalPongPage from "./pages/localPong";
import NotFound from "./pages/notfound.js";
import ChatPage from "./pages/chat.js";
import { Page } from "./types/types.js";
import { Lang, setLanguage } from "./languages/LanguageController.js";

const routes: { [key: string]: Page } = {
  "/": HomePage,
  "/register": RegisterPage,
  "/play": PlayPage,
  "/play/local-multi": LocalPongPage,
  "/chat": ChatPage,
};

export function refreshRouter() {
  const path = window.location.pathname;
  const page = routes[path] || NotFound;
  const appContainer = document.getElementById("app")!;
  appContainer.innerHTML = "";

  const savedLanguage = localStorage.getItem("selectedLanguage");
  if (savedLanguage) {
    setLanguage(savedLanguage as Lang);
  }

  page.render(appContainer);
}

export function navigate(path: string) {
  window.history.pushState({}, "", path);
  refreshRouter();
}

window.addEventListener("popstate", refreshRouter);
document.addEventListener("DOMContentLoaded", refreshRouter);
