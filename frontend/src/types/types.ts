export interface Page {
	render: (container: HTMLElement, params?: { [key: string]: string }) => void;
}

export type AIDifficulty = "easy" | "medium" | "hard";