import HomePage from './pages/home.js';
import AboutPage from './pages/about.js';

const routes = {
  '/': HomePage,
  '/about': AboutPage,
};

function router() {
  const path = window.location.pathname;
  const page = routes[path] || HomePage;
	console.log("YYYYYY");
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
document.body.addEventListener('change', router);