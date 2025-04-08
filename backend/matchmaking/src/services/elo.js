class EloService {
  constructor() {
    this.kFactor = 32; // Standard K-factor
    this.baseRating = 1000; // Starting ELO
  }

  // Calculate ELO changes for both players
  calculateNewRatings(playerRating, opponentRating, playerWon) {
    // Expected score based on current ratings
    const expectedScore = this.getExpectedScore(playerRating, opponentRating);
    
    // Actual score (1 for win, 0 for loss)
    const actualScore = playerWon ? 1 : 0;
    
    // Calculate new rating
    const newRating = Math.round(playerRating + this.kFactor * (actualScore - expectedScore));
    
    return newRating;
  }

  // Calculate expected score (probability of winning)
  getExpectedScore(playerRating, opponentRating) {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  // For new users
  getInitialRating() {
    return this.baseRating;
  }
}

module.exports = EloService;
  