export interface ConnectionStatus {
	isOnline: boolean;
	lastError?: string;
	lastChecked?: Date;
}

class ConnectionManager {
	private status: ConnectionStatus = { isOnline: true };
	private popup: HTMLElement | null = null;
	private checkInterval: number | null = null;
	private listeners: ((status: ConnectionStatus) => void)[] = [];

	constructor() {
		window.addEventListener('online', () => this.setOnline());
		window.addEventListener('offline', () => this.setOffline('No internet connection'));
	}

	onStatusChange(callback: (status: ConnectionStatus) => void) {
		this.listeners.push(callback);
		return () => {
			this.listeners = this.listeners.filter(cb => cb !== callback);
		};
	}

	setOffline(error?: string) {
		if (this.status.isOnline) {
			this.status = {
				isOnline: false,
				lastError: error || 'Connection lost',
				lastChecked: new Date()
			};
			this.createAndShowPopup();
			this.notifyListeners();
		} else {
			this.status.lastError = error || this.status.lastError;
			this.updatePopupMessage();
		}
	}

	setOnline() {
		if (!this.status.isOnline) {
			this.status = {
				isOnline: true,
				lastChecked: new Date()
			};
			this.destroyPopup();
			this.stopAutoReconnect();
			this.notifyListeners();
		}
	}

	async testConnection(): Promise<boolean> {
		try {
			const response = await fetch('/authentication/', {
				method: 'GET',
				cache: 'no-cache',
				headers: {
					'Cache-Control': 'no-cache'
				}
			});

			if (response.ok) {
				this.setOnline();
				return true;
			} else {
				this.setOffline(`Server error: ${response.status}`);
				return false;
			}
		} catch (error: any) {
			this.setOffline(this.getErrorMessage(error));
			return false;
		}
	}

	startAutoReconnect(intervalMs: number = 5000) {
		this.stopAutoReconnect();
		this.checkInterval = window.setInterval(() => {
			if (!this.status.isOnline) {
				this.testConnection();
			}
		}, intervalMs);
	}

	stopAutoReconnect() {
		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = null;
		}
	}

	getStatus(): ConnectionStatus {
		return { ...this.status };
	}

	destroy() {
		this.stopAutoReconnect();
		this.destroyPopup();
		window.removeEventListener('online', () => this.setOnline());
		window.removeEventListener('offline', () => this.setOffline());
		this.listeners = [];
	}

	private getErrorMessage(error: any): string {
		if (error.name === 'TypeError' && error.message.includes('fetch')) {
			return 'Network connection failed';
		}
		if (error.code === 'NETWORK_ERROR') {
			return 'Network error';
		}
		return error.message || 'Connection error';
	}

	private notifyListeners() {
		this.listeners.forEach(callback => callback(this.status));
	}

	private createAndShowPopup() {
		// Don't create if popup already exists
		if (this.popup) {
			this.updatePopupMessage();
			return;
		}

		this.popup = document.createElement('div');
		this.popup.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-[9999] max-w-sm transform transition-transform duration-300';
		this.popup.innerHTML = `
		<div class="flex items-center gap-3">
		  <div class="flex-shrink-0">
			<i class="fas fa-wifi text-xl"></i>
		  </div>
		  <div class="flex-1">
			<h4 class="font-bold">Connection Lost</h4>
			<p class="text-sm opacity-90" id="connection-error-message">${this.status.lastError || 'Unable to connect to services'}</p>
		  </div>
		  <button id="reconnect-btn" class="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
			Reconnect
		  </button>
		</div>
		<div class="mt-2">
		  <div class="text-xs opacity-75" id="connection-status">Attempting to reconnect...</div>
		</div>
	  `;

		const reconnectBtn = this.popup.querySelector('#reconnect-btn');
		reconnectBtn?.addEventListener('click', () => {
			this.handleReconnectClick();
		});

		document.body.appendChild(this.popup);

		requestAnimationFrame(() => {
			if (this.popup) {
				this.popup.style.transform = 'translateX(0)';
			}
		});

		this.startAutoReconnect();
	}

	private updatePopupMessage() {
		if (this.popup) {
			const errorMessage = this.popup.querySelector('#connection-error-message');
			if (errorMessage) {
				errorMessage.textContent = this.status.lastError || 'Connection lost';
			}
		}
	}

	private destroyPopup() {
		if (this.popup) {
			this.popup.style.transform = 'translateX(100%)';

			setTimeout(() => {
				if (this.popup) {
					this.popup.remove();
					this.popup = null;
				}
			}, 300);
		}
	}

	private async handleReconnectClick() {
		const reconnectBtn = this.popup?.querySelector('#reconnect-btn') as HTMLButtonElement;
		const statusDiv = this.popup?.querySelector('#connection-status');

		if (reconnectBtn) {
			reconnectBtn.disabled = true;
			reconnectBtn.textContent = 'Testing...';
		}

		if (statusDiv) {
			statusDiv.textContent = 'Testing connection...';
		}

		const isConnected = await this.testConnection();

		if (reconnectBtn) {
			reconnectBtn.disabled = false;
			reconnectBtn.textContent = 'Reconnect';
		}

		if (!isConnected && statusDiv) {
			statusDiv.textContent = 'Connection failed. Will retry automatically.';
		}
	}
}

export default new ConnectionManager();