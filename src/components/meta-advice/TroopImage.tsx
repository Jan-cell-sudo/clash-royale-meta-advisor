// Mapping of troop names to their image paths
export const troopImages: Record<string, string> = {
  "Spear Goblins": "/lovable-uploads/9e7f937a-a785-4ca4-8450-f2e1629f070c.png",
  "Valkyrie": "/lovable-uploads/0cd1a832-161b-4a6c-96eb-be6a22085e4d.png", 
  "Knight": "/lovable-uploads/bf147abb-96c5-4a82-906c-8ff366e1a2b7.png",
  "Royal Ghost": "/lovable-uploads/f5703c83-fb1b-49bf-8ed4-0ca65a40ff8c.png",
  "Prince": "/lovable-uploads/7fcbde97-787c-4706-bdce-1c97fc6241ce.png",
  "Goblin Machine": "/lovable-uploads/aeea76ad-687a-4bdb-b281-6d11fca59090.png",
  "Bandit": "/lovable-uploads/9ffdddc4-780a-4361-91ca-6ed4be66efa5.png", 
  "Mega Knight": "/lovable-uploads/86f45333-bdcc-4711-a4ed-053a01158621.png",
  "Princess": "/lovable-uploads/0e3c3f91-0e55-4e39-aca1-1bcc449728d5.png",
  "P.E.K.K.A": "/lovable-uploads/9e6fe728-786f-4127-aae2-1919a358a473.png"
};

interface TroopImageProps {
  troopName: string;
  className?: string;
}

export function TroopImage({ troopName, className = "" }: TroopImageProps) {
  const imageSrc = troopImages[troopName];
  
  if (!imageSrc) {
    return (
      <div className={`flex items-center justify-center bg-gradient-primary rounded-xl ${className}`}>
        <span className="text-2xl font-game-title text-accent-foreground">{troopName}</span>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={troopName}
      className={`rounded-xl object-cover ${className}`}
    />
  );
}