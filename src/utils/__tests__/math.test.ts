import { describe, it, expect } from 'vitest';
import { clamp, lerp, smoothstep, distance2D, distance3D, normalizeVector3, randomInRange } from '../math';

describe('Math Utils', () => {
  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(0.5, 0, 1)).toBe(0.5);
    });
  });

  describe('lerp', () => {
    it('should interpolate between values', () => {
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(-10, 10, 0.25)).toBe(-5);
    });
  });

  describe('smoothstep', () => {
    it('should provide smooth interpolation', () => {
      expect(smoothstep(0, 10, -1)).toBe(0);
      expect(smoothstep(0, 10, 0)).toBe(0);
      expect(smoothstep(0, 10, 5)).toBeCloseTo(0.5, 5);
      expect(smoothstep(0, 10, 10)).toBe(1);
      expect(smoothstep(0, 10, 11)).toBe(1);
    });
  });

  describe('distance2D', () => {
    it('should calculate 2D distance', () => {
      expect(distance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance2D({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(5);
      expect(distance2D({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });
  });

  describe('distance3D', () => {
    it('should calculate 3D distance', () => {
      expect(distance3D(
        { x: 0, y: 0, z: 0 }, 
        { x: 1, y: 0, z: 0 }
      )).toBe(1);
      
      expect(distance3D(
        { x: 0, y: 0, z: 0 }, 
        { x: 2, y: 3, z: 6 }
      )).toBe(7);
      
      expect(distance3D(
        { x: 1, y: 2, z: 3 }, 
        { x: 1, y: 2, z: 3 }
      )).toBe(0);
    });
  });

  describe('normalizeVector3', () => {
    it('should normalize vector to unit length', () => {
      const normalized = normalizeVector3({ x: 3, y: 0, z: 4 });
      expect(normalized.x).toBeCloseTo(0.6, 5);
      expect(normalized.y).toBe(0);
      expect(normalized.z).toBeCloseTo(0.8, 5);
      
      // Check magnitude is 1
      const magnitude = Math.sqrt(
        normalized.x ** 2 + normalized.y ** 2 + normalized.z ** 2
      );
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero vector', () => {
      const normalized = normalizeVector3({ x: 0, y: 0, z: 0 });
      expect(normalized).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('randomInRange', () => {
    it('should generate values within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInRange(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(20);
      }
    });

    it('should handle negative ranges', () => {
      for (let i = 0; i < 50; i++) {
        const value = randomInRange(-20, -10);
        expect(value).toBeGreaterThanOrEqual(-20);
        expect(value).toBeLessThanOrEqual(-10);
      }
    });
  });
});