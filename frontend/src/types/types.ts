export interface Page {
	render: (container: HTMLElement, params?: { [key: string]: string | number }) => void;
}

export type AIDifficulty = "easy" | "medium" | "hard";