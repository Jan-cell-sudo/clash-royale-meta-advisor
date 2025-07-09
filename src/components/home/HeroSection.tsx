export const HeroSection = () => {
  return (
    <div className="text-center space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-6xl font-game-title text-game-title text-foreground animate-bounce-subtle">
          Merge
        </h1>
        <h2 className="text-5xl sm:text-7xl font-game-title text-accent drop-shadow-lg">
          Tactics
        </h2>
        <div className="text-2xl sm:text-3xl font-game-title text-accent bg-gradient-winner px-4 py-2 rounded-xl border-2 border-accent inline-block">
          VICTORY
        </div>
      </div>
      
      <p className="text-lg sm:text-xl font-game-body text-foreground/90 leading-relaxed px-2">
        Upload screenshots to discover the best troops for your league.
      </p>
    </div>
  );
};