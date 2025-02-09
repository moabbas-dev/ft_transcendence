import HomePage from './pages/home.js';
import AboutPage from './pages/about.js';
import RegisterPage from './pages/register.js';
import NotFound from './pages/notfound.js'
import { Page } from './types/types.js';
import { Lang, setLanguage } from './languages/LanguageController.js';

const routes = {
  '/': HomePage,
  '/register': RegisterPage,
  // '/about': AboutPage,
};

export function router() {
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
  router();
}

window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', router);
