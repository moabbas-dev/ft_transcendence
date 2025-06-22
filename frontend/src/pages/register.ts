import { SignIn } from '../components/register/SignIn.js';
import { SignUp } from '../components/register/SignUp.js';
import { PongAnimation } from '../components/partials/PingPongAnimation.js';
import { SendEmail } from '../components/register/SendEmail.js';
import { ResetPass } from '../components/register/ResetPass.js';
import { TwoFactorSend } from '../components/register/TwoFactor.js';

export default {
	render: (container: HTMLElement, params?: { [key: string]: string }) => {
		container.innerHTML = `
		<div class="loaded-div fixed inset-0 overflow-hidden">
			<canvas id="pongCanvas" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:top-0 sm:left-0 z-0 w-[100vh] h-[100vw] sm:w-[100vw] sm:h-[100vh] inset-0 rotate-90 origin-center sm:rotate-0"></canvas>
			<div class="relative z-10 flex items-center justify-center">
				<section class="flex items-center justify-center h-[100dvh] opacity-90">
					<div class="bg-white shadow-[0_0_15px_rgba(0,0,0,0.15)] shadow-pongpink rounded-lg">
						<aside class="transition-opacity duration-400">
						</aside>
						<!-- SignIn, SignUp Forms Here -->
					</div>
				</section>
			</div>
		</div>
		`;

		const animateTransition = (newComponentFn: any) => {
			section.classList.add('opacity-0');
			setTimeout(() => {
				section.innerHTML = '';
				section.appendChild(newComponentFn());
				section.classList.remove('opacity-0');
			}, 400);
		};

		const section: HTMLElement = container.querySelector('aside')!;
		const renderSignIn = () => {
			animateTransition(() =>
				SignIn({
					styles: 'mx-auto',
					onSwitchToSignUp: renderSignUp,
					onSwitchToResetPass: renderSendEmaiForReset,
				})
			);
		};

		const renderSignUp = () => {
			animateTransition(() =>
				SignUp({
					styles: 'mx-auto',
					onSwitchToSignIn: renderSignIn,
				})
			);
		};

		const renderSendEmaiForReset = () => {
			animateTransition(() =>
				SendEmail({
					onSwitchToSignIn: renderSignIn,
				})
			)
		}

		const renderResetPass = (params?: { [key: string]: string | number }) => {
			animateTransition(() =>
				ResetPass(params)
			)
		}

		const renderTwoFactor = () => {
			animateTransition(() =>
				TwoFactorSend()
			)
		}

		if (params?.uuid && window.location.pathname.startsWith("/reset_password")) {
			renderResetPass(params);
		} else if (window.location.pathname === "/register/twofactor") {
			renderTwoFactor();
		} else {
			renderSignIn();
		}

		const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
		if (canvas)
			new PongAnimation(canvas);
	}
}