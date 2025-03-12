export interface Page {
	render: (container: HTMLElement) => void;
}

export type AIDifficulty = "easy" | "medium" | "hard";