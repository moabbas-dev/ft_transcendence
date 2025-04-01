class EloService {
    // Default K-factor (determines how much ratings change)
    constructor(kFactor = 32) {
      this.kFactor = kFactor;
    }
  
    // Calculate expected score (probability of winning)
    calculateExpectedScore(playerRating, opponentRating) {
      return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }
  
    // Calculate new ELO rating
    calculateNewRating(playerRating, expectedScore, actualScore) {
      return Math.round(playerRating + this.kFactor * (actualScore - expectedScore));
    }
  
    // Calculate rating changes for both players after a match
    calculateRatingChanges(player1Rating, player2Rating, player1Won) {
      const player1ExpectedScore = this.calculateExpectedScore(player1Rating, player2Rating);
      const player2ExpectedScore = this.calculateExpectedScore(player2Rating, player1Rating);
      
      const player1ActualScore = player1Won ? 1 : 0;
      const player2ActualScore = player1Won ? 0 : 1;
      
      const player1NewRating = this.calculateNewRating(player1Rating, player1ExpectedScore, player1ActualScore);
      const player2NewRating = this.calculateNewRating(player2Rating, player2ExpectedScore, player2ActualScore);
      
      return {
        player1Change: player1NewRating - player1Rating,
        player2Change: player2NewRating - player2Rating,
        player1NewRating,
        player2NewRating
      };
    }
  }
  
  export default new EloService();
  