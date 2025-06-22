class AudioManager {
    private notificationSound: HTMLAudioElement | null;
    private isEnabled: boolean;
    private volume: number;

    constructor() {
        this.notificationSound = null;
        this.isEnabled = true;
        this.volume = 0.5;
        this.initializeAudio();
    }

    private initializeAudio(): void {
        try {
            this.notificationSound = new Audio('../../sounds/mixkit-positive-notification-951.wav');
            this.notificationSound.volume = this.volume;
            this.notificationSound.preload = 'auto';
        } catch (error) {
            console.error('Failed to load notification sound:', error);
        }
    }

    public async playNotificationSound(): Promise<void> {
        if (!this.isEnabled || !this.notificationSound) return;

        try {
            this.notificationSound.currentTime = 0;

            await this.notificationSound.play();
        } catch (error: any) {
            console.error('Failed to play notification sound:', error);
            if (error.name === 'NotAllowedError') {
                console.warn('Audio autoplay blocked by browser');
            }
        }
    }

    public setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.notificationSound) {
            this.notificationSound.volume = this.volume;
        }
    }

    public enable(): void {
        this.isEnabled = true;
    }

    public disable(): void {
        this.isEnabled = false;
    }

    public toggle(): boolean {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }

    public getVolume(): number {
        return this.volume;
    }

    public getIsEnabled(): boolean {
        return this.isEnabled;
    }
}

export const audioManager = new AudioManager();
export default audioManager;