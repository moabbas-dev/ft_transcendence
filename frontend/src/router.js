import HomePage from './pages/home.js';
import AboutPage from './pages/about.js';
import RegisterPage from './pages/register.js';
import NotFound from './pages/notfound.js'

const routes = {
  // '/': HomePage,
  // '/about': AboutPage,
  '/': RegisterPage,
};

function router() {
  const path = window.location.pathname;
  const page = routes[path] || NotFound;
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = '';
  page.render(appContainer);
}

export function navigate(path) {
  window.history.pushState({}, '', path);
  router();
}

window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', router);
