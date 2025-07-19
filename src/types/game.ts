// Core game types

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface TerrainCell {
  x: number;
  y: number;
  height: number;
  type: TerrainType;
  moisture: number;
  temperature: number;
  fertility: number;
  hasWater: boolean;
  hasBuilding: boolean;
  buildingId?: string;
  ownerId?: string;
  walkable: boolean;
  buildable: boolean;
}

export enum TerrainType {
  WATER = 'water',
  SHALLOW_WATER = 'shallow_water',
  BEACH = 'beach',
  SAND = 'sand',
  GRASS = 'grass',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  ROCK = 'rock',
  SNOW = 'snow',
  DESERT = 'desert',
  TUNDRA = 'tundra',
  SWAMP = 'swamp',
  VOLCANIC = 'volcanic',
}

export interface Building {
  id: string;
  type: BuildingType;
  position: Vector3;
  level: number;
  health: number;
  maxHealth: number;
  civilizationId: string;
  constructionProgress: number;
  isActive: boolean;
  isCompleted: boolean;
  workforce: number;
  maxWorkforce: number;
}

export enum BuildingType {
  // Basic Buildings
  HUT = 'hut',
  HOUSE = 'house',
  VILLA = 'villa',
  PALACE = 'palace',
  
  // Resource Buildings
  FARM = 'farm',
  LUMBERMILL = 'lumbermill',
  QUARRY = 'quarry',
  MINE = 'mine',
  FISHERY = 'fishery',
  WORKSHOP = 'workshop',
  
  // Religious Buildings
  SHRINE = 'shrine',
  TEMPLE = 'temple',
  CATHEDRAL = 'cathedral',
  
  // Military Buildings
  WATCHTOWER = 'watchtower',
  BARRACKS = 'barracks',
  FORTRESS = 'fortress',
  WALL = 'wall',
  TOWER = 'tower',
  
  // Special Buildings
  MARKET = 'market',
  SCHOOL = 'school',
  HOSPITAL = 'hospital',
  MONUMENT = 'monument',
  WONDER = 'wonder',
}

export interface Unit {
  id: string;
  type: UnitType;
  position: Vector3;
  destination?: Vector3;
  path?: Vector3[];
  health: number;
  maxHealth: number;
  civilizationId: string;
  state: UnitState;
  targetPosition: Vector3 | null;
  currentAction: string | null;
  level: number;
  experience: number;
  carryingResource?: ResourceType;
  carryingAmount?: number;
}

export enum UnitType {
  WORKER = 'worker',
  VILLAGER = 'villager',
  FARMER = 'farmer',
  LUMBERJACK = 'lumberjack',
  MINER = 'miner',
  BUILDER = 'builder',
  PRIEST = 'priest',
  WARRIOR = 'warrior',
  SCOUT = 'scout',
  MERCHANT = 'merchant',
  HERO = 'hero',
}

export enum UnitState {
  IDLE = 'idle',
  MOVING = 'moving',
  WORKING = 'working',
  BUILDING = 'building',
  FIGHTING = 'fighting',
  PRAYING = 'praying',
  FLEEING = 'fleeing',
}

export enum CivilizationAlignment {
  GOOD = 'good',
  NEUTRAL = 'neutral',
  EVIL = 'evil',
}

export interface Civilization {
  id: string;
  name: string;
  color: string | number;
  isPlayer: boolean;
  resources: Resources;
  population: number;
  maxPopulation: number;
  faith: number;
  technology: Technology[];
  buildings: Building[];
  units: Unit[];
  happiness: number;
  culture: number;
  military: number;
  alignment: CivilizationAlignment;
}

export interface Resources {
  food: number;
  wood: number;
  stone: number;
  gold: number;
  faith: number;
  knowledge: number;
}

export enum ResourceType {
  FOOD = 'food',
  WOOD = 'wood',
  STONE = 'stone',
  GOLD = 'gold',
  FAITH = 'faith',
  KNOWLEDGE = 'knowledge',
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: Partial<Resources>;
  prerequisites: string[];
  unlocks: string[];
  researchTime: number;
  effects: TechEffect[];
}

export interface TechEffect {
  type: 'resource_bonus' | 'unit_unlock' | 'building_unlock' | 'stat_boost';
  target: string;
  value: number;
}

export interface GodPower {
  id: string;
  type: GodPowerType;
  name: string;
  description: string;
  faithCost: number;
  cooldown: number;
  radius: number;
  intensity: number;
  duration: number;
}

export enum GodPowerType {
  // Terrain Powers
  RAISE_LAND = 'raise_land',
  LOWER_LAND = 'lower_land',
  CREATE_WATER = 'create_water',
  CREATE_FOREST = 'create_forest',
  CREATE_MOUNTAIN = 'create_mountain',
  FLATTEN = 'flatten',
  
  // Weather Powers
  RAIN = 'rain',
  DROUGHT = 'drought',
  STORM = 'storm',
  
  // Civilization Powers
  SPAWN_CIVILIZATION = 'spawn_civilization',
  BLESS = 'bless',
  CURSE = 'curse',
  DIVINE_INSPIRATION = 'divine_inspiration',
  
  // Disaster Powers
  EARTHQUAKE = 'earthquake',
  VOLCANO = 'volcano',
  METEOR = 'meteor',
  FLOOD = 'flood',
  PLAGUE = 'plague',
}

export enum Weather {
  CLEAR = 'clear',
  RAIN = 'rain',
  STORM = 'storm',
  SNOW = 'snow',
  FOG = 'fog',
  SANDSTORM = 'sandstorm',
}

export interface WeatherState {
  type: Weather;
  intensity: number;
  duration: number;
  position?: Vector2;
  radius?: number;
}

export interface Effect {
  id: string;
  type: string;
  position: Vector3;
  radius?: number;
  intensity: number;
  duration: number;
  color?: number;
}

export interface GameState {
  // Core state
  terrain: TerrainCell[][];
  civilizations: Civilization[];
  weather: Weather;
  activeEffects: Effect[];
  
  // Game info
  mapSize: Vector2;
  turnNumber: number;
  gameTime: number;
  timeOfDay: number;
  isPaused: boolean;
  gameSpeed: number;
  speed: number;
  waterLevel: number;
  
  // Player state
  playerId: string;
  selectedPower: GodPowerType | null;
  faith: number;
  resources: Resources;
  cameraPosition: Vector3;
  selectedUnits: string[];
  selectedBuilding?: string;
  
  // Game configuration
  difficulty: Difficulty;
  gameMode: GameMode;
  victoryConditions: VictoryCondition[];
  
  // Statistics
  statistics: GameStatistics;
  achievements: Achievement[];
}

export interface GameStatistics {
  totalTime: number;
  terrainsModified: number;
  civilizationsCreated: number;
  buildingsConstructed: number;
  unitsCreated: number;
  disastersUnleashed: number;
  miraclesPerformed: number;
  highestPopulation: number;
  totalFaithGenerated: number;
}

export interface GameConfig {
  mapSize: Vector2;
  difficulty: Difficulty;
  gameMode?: GameMode;
  playerName?: string;
  seed?: number;
}

export enum Difficulty {
  easy = 'easy',
  normal = 'normal',
  hard = 'hard',
  divine = 'divine',
}

export enum GameMode {
  SANDBOX = 'sandbox',
  CAMPAIGN = 'campaign',
  SCENARIO = 'scenario',
  CHALLENGE = 'challenge',
}

export enum GamePhase {
  MENU = 'menu',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
}

export interface VictoryCondition {
  type: 'population' | 'faith' | 'culture' | 'military' | 'wonder' | 'time';
  value: number;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewards?: Partial<Resources>;
}

// Store types
export interface GameStore extends GameState {
  // Actions
  initializeGame: (config: GameConfig) => Promise<void>;
  setPhase: (phase: GamePhase) => void;
  phase: GamePhase;
  
  // Terrain actions
  modifyTerrain: (x: number, y: number, modification: Partial<TerrainCell>) => void;
  
  // Power actions
  setSelectedPower: (power: GodPowerType | null) => void;
  usePower: (power: GodPowerType, position: Vector2) => void;
  
  // Time actions
  setSpeed: (speed: number) => void;
  togglePause: () => void;
  
  // Update loop
  update: (deltaTime: number) => void;
}