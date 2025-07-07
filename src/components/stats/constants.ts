// Elixir cost mapping for troops
export const troopElixirCosts: Record<string, number> = {
  'Knight': 2, 'Archers': 2, 'Goblins': 2, 'Spear Goblins': 2, 'Bomber': 2, 'Barbarians': 2,
  'Valkyrie': 3, 'P.E.K.K.A': 3, 'Prince': 3, 'Giant Skeleton': 3, 'Dart Goblin': 3, 'Executioner': 3,
  'Princess': 4, 'Bandit': 4, 'Goblin Machine': 4, 'Mega Knight': 4, 'Royal Ghost': 4,
  'Archer Queen': 5, 'Skeleton King': 5, 'Golden Knight': 5
};

// Proper trait family mapping with two categories as specified
export const troopTraitFamilies: Record<string, string> = {
  'Knight': 'Noble, Juggernaut',
  'Archers': 'Clan, Ranger', 
  'Goblins': 'Goblin, Assassin',
  'Spear Goblins': 'Goblin, Thrower',
  'Bomber': 'Undead, Thrower',
  'Barbarians': 'Clan, Brawler',
  'Valkyrie': 'Clan, Avenger',
  'P.E.K.K.A': 'Ace, Juggernaut',
  'Prince': 'Noble, Brawler',
  'Giant Skeleton': 'Undead, Brawler',
  'Dart Goblin': 'Goblin, Ranger',
  'Executioner': 'Ace, Thrower',
  'Princess': 'Noble, Ranger',
  'Bandit': 'Ace, Brawler',
  'Goblin Machine': 'Goblin, Juggernaut',
  'Mega Knight': 'Ace, Juggernaut',
  'Royal Ghost': 'Ace, Assassin',
  'Archer Queen': 'Clan, Avenger',
  'Skeleton King': 'Undead, Juggernaut',
  'Golden Knight': 'Noble, Assassin'
};