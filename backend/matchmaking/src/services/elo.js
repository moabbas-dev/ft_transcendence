class EloService {
  constructor() {
    this.kFactor = 32;      // Standard K-factor
    this.baseRating = 1000; // Starting ELO
  }

  /**
   * Calculate new ratings for both players.
   * @param {number} playerRating    - Current player rating
   * @param {number} opponentRating  - Current opponent rating
   * @param {number} result          - 1 = win, 0.5 = draw, 0 = loss
   * @returns {number}               - New player rating
   */
  calculateNewRatings(playerRating, opponentRating, result) {
    // 1. Expected score based on current ratings
    const expectedScore = this.getExpectedScore(playerRating, opponentRating);

    // 2. Actual score: result can be 1, 0.5, or 0
    const actualScore = result;

    // 3. New rating calculation
    const newRating = Math.round(
      playerRating + this.kFactor * (actualScore - expectedScore)
    );

    return newRating;
  }

  // Calculates the expected probability of winning
  getExpectedScore(playerRating, opponentRating) {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  // Initial rating for new users
  getInitialRating() {
    return this.baseRating;
  }
}

export default new EloService();
