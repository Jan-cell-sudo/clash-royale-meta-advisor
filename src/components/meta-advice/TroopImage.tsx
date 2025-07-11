// Mapping of troop names to their image paths - ONLY the troops that exist in the game
export const troopImages: Record<string, string> = {
  // Archers - both forms
  "Archers": "/lovable-uploads/961563d0-843e-42b4-b556-5a2481c5944d.png",
  "Archer": "/lovable-uploads/961563d0-843e-42b4-b556-5a2481c5944d.png",
  
  // Golden Knight - singular only
  "Golden Knight": "/lovable-uploads/e69e312b-db07-4ed8-a71f-4d5f522fbca4.png",
  
  // Royal Ghost - singular only
  "Royal Ghost": "/lovable-uploads/f5703c83-fb1b-49bf-8ed4-0ca65a40ff8c.png",
  
  // Goblin Machine - singular only
  "Goblin Machine": "/lovable-uploads/aeea76ad-687a-4bdb-b281-6d11fca59090.png",
  
  // Goblins - both forms
  "Goblins": "/lovable-uploads/85257d8e-6c03-410b-a5f5-862453f2d000.png",
  "Goblin": "/lovable-uploads/85257d8e-6c03-410b-a5f5-862453f2d000.png",
  
  // Princess - singular only
  "Princess": "/lovable-uploads/0e3c3f91-0e55-4e39-aca1-1bcc449728d5.png",
  
  // Barbarians - both forms
  "Barbarians": "/lovable-uploads/8556138e-0ed2-4b3b-864e-17f1e785125a.png",
  "Barbarian": "/lovable-uploads/8556138e-0ed2-4b3b-864e-17f1e785125a.png",
  
  // Valkyrie - singular only
  "Valkyrie": "/lovable-uploads/0cd1a832-161b-4a6c-96eb-be6a22085e4d.png",
  
  // Dart Goblin - singular only
  "Dart Goblin": "/lovable-uploads/95019dfc-f682-46d8-afd9-fd26ab1a4e4f.png",
  
  // Spear Goblins - both forms
  "Spear Goblins": "/lovable-uploads/9e7f937a-a785-4ca4-8450-f2e1629f070c.png",
  "Spear Goblin": "/lovable-uploads/9e7f937a-a785-4ca4-8450-f2e1629f070c.png",
  
  // P.E.K.K.A - both spellings
  "P.E.K.K.A": "/lovable-uploads/9e6fe728-786f-4127-aae2-1919a358a473.png",
  "PEKKA": "/lovable-uploads/9e6fe728-786f-4127-aae2-1919a358a473.png",
  
  // Knight - singular only
  "Knight": "/lovable-uploads/bf147abb-96c5-4a82-906c-8ff366e1a2b7.png",
  
  // Mega Knight - singular only
  "Mega Knight": "/lovable-uploads/86f45333-bdcc-4711-a4ed-053a01158621.png",
  
  // Skeleton King - singular only
  "Skeleton King": "/lovable-uploads/a27f5548-0e56-4470-9cd0-ce5447f720b5.png",
  
  // Giant Skeleton - singular only
  "Giant Skeleton": "/lovable-uploads/315738e6-58bf-4a1b-9284-1479c349399e.png",
  
  // Archer Queen - singular only
  "Archer Queen": "/lovable-uploads/a776d08f-c9aa-4d8f-b1ed-9f6585332aa0.png",
  
  // Bomber - singular only
  "Bomber": "/lovable-uploads/bd6c7d12-b17c-42c9-b4ac-0fbaf398179f.png",
  
  // Executioner - singular only
  "Executioner": "/lovable-uploads/defb6ef8-34b2-44b5-a243-1be8d7bada24.png",
  
  // Bandit - singular only
  "Bandit": "/lovable-uploads/9ffdddc4-780a-4361-91ca-6ed4be66efa5.png",
  
  // Prince - singular only
  "Prince": "/lovable-uploads/8f444803-fddf-4395-93ce-27fa09b12e08.png"
};

interface TroopImageProps {
  troopName: string;
  className?: string;
}

export function TroopImage({ troopName, className = "" }: TroopImageProps) {
  const imageSrc = troopImages[troopName];
  
  if (!imageSrc) {
    console.warn('TroopImage - No image found for troop:', troopName);
    return (
      <div className={`flex items-center justify-center bg-gradient-primary rounded-xl ${className}`}>
        <span className="text-lg font-game-title text-accent-foreground">{troopName}</span>
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={troopName}
      className={`rounded-xl object-cover shadow-lg ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}