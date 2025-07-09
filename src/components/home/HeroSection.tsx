export const HeroSection = () => {
  return (
    <div className="text-center space-y-8 max-w-lg mx-auto">
      <div className="space-y-4">
        <h1 className="text-5xl sm:text-7xl font-game-title text-game-title text-foreground animate-bounce-subtle">
          Merge
        </h1>
        <h2 className="text-6xl sm:text-8xl font-game-title text-accent drop-shadow-lg">
          Tactics
        </h2>
        <div className="text-xl sm:text-2xl font-game-title text-accent-foreground bg-gradient-winner px-6 py-3 rounded-xl border-2 border-accent inline-block shadow-game">
          VICTORY
        </div>
      </div>
      
      <p className="text-lg sm:text-xl font-game-body text-foreground/90 leading-relaxed px-4">
        Upload screenshots to discover the best troops for your league.
      </p>
    </div>
  );
};