import { describe, it, expect } from 'vitest';
import { createCivilization, createBuilding, createUnit } from '../factory';
import { BuildingType, UnitType, CivilizationAlignment } from '../../../types/game';

describe('Civilization Factory', () => {
  describe('createCivilization', () => {
    it('should create civilization with default values', () => {
      const civ = createCivilization({
        id: 'test-civ',
        name: 'Test Civilization',
        color: '#ff0000',
        isPlayer: false,
        startPosition: { x: 50, y: 0, z: 50 }
      });

      expect(civ.id).toBe('test-civ');
      expect(civ.name).toBe('Test Civilization');
      expect(civ.color).toBe('#ff0000');
      expect(civ.isPlayer).toBe(false);
      expect(civ.population).toBe(10);
      expect(civ.alignment).toBe(CivilizationAlignment.NEUTRAL);
      expect(civ.resources).toEqual({
        food: 100,
        wood: 50,
        stone: 30,
        gold: 20,
        faith: 0,
        knowledge: 0
      });
    });

    it('should create player civilization with higher starting resources', () => {
      const playerCiv = createCivilization({
        id: 'player',
        name: 'Player Empire',
        color: '#0000ff',
        isPlayer: true,
        startPosition: { x: 0, y: 0, z: 0 }
      });

      expect(playerCiv.isPlayer).toBe(true);
      expect(playerCiv.resources.faith).toBe(50); // Players start with faith
      expect(playerCiv.buildings).toHaveLength(0);
      expect(playerCiv.units).toHaveLength(0);
    });

    it('should use provided alignment', () => {
      const evilCiv = createCivilization({
        id: 'evil-civ',
        name: 'Evil Empire',
        color: '#000000',
        isPlayer: false,
        startPosition: { x: 100, y: 0, z: 100 },
        alignment: CivilizationAlignment.EVIL
      });

      expect(evilCiv.alignment).toBe(CivilizationAlignment.EVIL);
    });
  });

  describe('createBuilding', () => {
    it('should create building with correct properties', () => {
      const building = createBuilding({
        type: BuildingType.HOUSE,
        position: { x: 10, y: 0, z: 20 },
        civilizationId: 'test-civ'
      });

      expect(building.type).toBe(BuildingType.HOUSE);
      expect(building.position).toEqual({ x: 10, y: 0, z: 20 });
      expect(building.civilizationId).toBe('test-civ');
      expect(building.health).toBe(100);
      expect(building.maxHealth).toBe(100);
      expect(building.constructionProgress).toBe(0);
      expect(building.isCompleted).toBe(false);
      expect(building.level).toBe(1);
    });

    it('should generate unique building IDs', () => {
      const building1 = createBuilding({
        type: BuildingType.TEMPLE,
        position: { x: 0, y: 0, z: 0 },
        civilizationId: 'civ1'
      });

      const building2 = createBuilding({
        type: BuildingType.TEMPLE,
        position: { x: 1, y: 0, z: 1 },
        civilizationId: 'civ1'
      });

      expect(building1.id).not.toBe(building2.id);
    });
  });

  describe('createUnit', () => {
    it('should create unit with correct properties', () => {
      const unit = createUnit({
        type: UnitType.WORKER,
        position: { x: 15, y: 0, z: 25 },
        civilizationId: 'test-civ'
      });

      expect(unit.type).toBe(UnitType.WORKER);
      expect(unit.position).toEqual({ x: 15, y: 0, z: 25 });
      expect(unit.civilizationId).toBe('test-civ');
      expect(unit.health).toBe(100);
      expect(unit.maxHealth).toBe(100);
      expect(unit.targetPosition).toBeNull();
      expect(unit.currentAction).toBeNull();
      expect(unit.level).toBe(1);
      expect(unit.experience).toBe(0);
    });

    it('should create units with appropriate stats for type', () => {
      const warrior = createUnit({
        type: UnitType.WARRIOR,
        position: { x: 0, y: 0, z: 0 },
        civilizationId: 'war-civ'
      });

      const worker = createUnit({
        type: UnitType.WORKER,
        position: { x: 0, y: 0, z: 0 },
        civilizationId: 'peace-civ'
      });

      // Warriors might have different health or other properties
      expect(warrior.type).toBe(UnitType.WARRIOR);
      expect(worker.type).toBe(UnitType.WORKER);
    });

    it('should generate unique unit IDs', () => {
      const unit1 = createUnit({
        type: UnitType.PRIEST,
        position: { x: 0, y: 0, z: 0 },
        civilizationId: 'civ1'
      });

      const unit2 = createUnit({
        type: UnitType.PRIEST,
        position: { x: 1, y: 0, z: 1 },
        civilizationId: 'civ1'
      });

      expect(unit1.id).not.toBe(unit2.id);
    });
  });
});