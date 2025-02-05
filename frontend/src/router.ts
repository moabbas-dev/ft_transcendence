import HomePage from './pages/home.js';
import AboutPage from './pages/about.js';
import RegisterPage from './pages/register.js';
import NotFound from './pages/notfound.js'
import { Page } from './types/types.js';

const routes = {
  // '/': HomePage,
  // '/about': AboutPage,
  '/': RegisterPage,
};

function router() {
  const path:string = window.location.pathname;
  const page: Page = routes[path as keyof typeof routes] || NotFound;
  const appContainer:HTMLElement = document.getElementById('app')!;
  appContainer.innerHTML = '';
  page.render(appContainer);
}

export function navigate(path: string) {
  window.history.pushState({}, '', path);
  router();
}

window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', router);
