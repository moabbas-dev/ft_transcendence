import HomePage from './pages/home.js';
import AboutPage from './pages/about.js';
import RegisterPage from './pages/register.js';
import NotFound from './pages/notfound.js'
import ChatPage from './pages/chat.js'
import { Page } from './types/types.js';
import { Lang, setLanguage } from './languages/LanguageController.js';

const routes = {
  '/': HomePage,
  '/register': RegisterPage,
  '/chat': ChatPage,
  // '/about': AboutPage,
};

export function refreshRouter() {
  const path:string = window.location.pathname;
  const page: Page = routes[path as keyof typeof routes] || NotFound;
  const appContainer:HTMLElement = document.getElementById('app')!;
  appContainer.innerHTML = '';
  const savedLanguage = localStorage.getItem("selectedLanguage");
  if (savedLanguage) {
    setLanguage(savedLanguage as Lang)
  }
  page.render(appContainer);
}

export function navigate(path: string) {
  window.history.pushState({}, '', path);
  refreshRouter();
}

window.addEventListener('popstate', refreshRouter);
document.addEventListener('DOMContentLoaded', refreshRouter);
