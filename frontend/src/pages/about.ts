import moabbasImg from '/src/assets/moabbas.jpg';
import afarachiImg from '/src/assets/afarachi.jpg';
import jfatfatImg from '/src/assets/jfatfat.jpg';
import { t } from '../languages/LanguageController';

export default {
	render: (container: HTMLElement) => {
	  container.innerHTML = `
		<section class="min-h-screen flex items-center justify-center bg-pongdark py-12 px-4 sm:px-6 lg:px-8">
		  <div class="max-w-4xl mx-auto text-center flex flex-col gap-12">
			<h2 class="text-3xl font-extrabold text-white sm:text-4xl">
			  ${t('about.title')}
			</h2>
			
			<div class="flex flex-col md:flex-row justify-center items-center gap-8 lg:gap-12">
			  <!-- Moabbas - Frontend -->
			  <div class="flex flex-col items-center bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255)] hover:shadow-[0_0_60px_rgba(255,255,255)] transition-shadow duration-300 animate-fade-left">
				<img 
				  src="${moabbasImg}" 
				  alt="Moabbas - Frontend Developer"
				  class="w-32 h-32 rounded-full object-cover ring-4 ring-pongblue mb-4"
				>
				<h3 class="text-2xl font-bold text-gray-900 mb-1">Moabbas</h3>
				<p class="text-pongblue font-medium mb-2">Frontend ${t('about.developer')}</p>
				<p class="text-gray-600 text-center max-w-xs">
				  ${t('about.moabbasInfo')}
				</p>
			  </div>
  
			  <!-- Afarachi - Fullstack -->
			  <div class="flex flex-col items-center bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255)] hover:shadow-[0_0_60px_rgba(255,255,255)] transition-shadow duration-300 animate-fade">
				<img 
				  src="${afarachiImg}" 
				  alt="Afarachi - Fullstack Developer"
				  class="w-32 h-32 rounded-full object-cover ring-4 ring-pongblue mb-4"
				>
				<h3 class="text-2xl font-bold text-gray-900 mb-1">Afarachi</h3>
				<p class="text-pongblue font-medium mb-2">Fullstack ${t('about.developer')}</p>
				<p class="text-gray-600 text-center max-w-xs">
				${t('about.afarachiInfo')}
				</p>
			  </div>
  
			  <!-- Jfatfat - Backend -->
			  <div class="flex flex-col items-center bg-white p-6 rounded-2xl shadow-[0_0_30px_rgba(255,255,255)] hover:shadow-[0_0_60px_rgba(255,255,255)] transition-shadow duration-300 animate-fade-right">
				<img 
				  src="${jfatfatImg}" 
				  alt="Jfatfat - Backend Developer"
				  class="w-32 h-32 rounded-full object-cover ring-4 ring-pongblue mb-4"
				>
				<h3 class="text-2xl font-bold text-gray-900 mb-1">Jfatfat</h3>
				<p class="text-pongblue font-medium mb-2">Backend ${t('about.developer')}</p>
				<p class="text-gray-600 text-center max-w-xs">
				${t('about.jfatfatInfo')}
				</p>
			  </div>
			</div>
  
			<div class="text-gray-400 max-w-2xl mx-auto">
			  <p class="text-lg">
			  	${t('about.conclusion')}
			  </p>
			  <p class="text-pongdark">Mr. Walid please 125 :)</p>
			</div>
		  </div>
		</section>
	  `;
	},
  };