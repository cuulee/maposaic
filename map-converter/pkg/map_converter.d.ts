/* tslint:disable */
/* eslint-disable */
/**
*/
export function run(): void;
/**
* @param {number} coucou
*/
export function convert(coucou: number): void;
/**
*/
export enum Cell {
  Dead,
  Alive,
}
/**
*/
export class Universe {
  free(): void;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @returns {number}
*/
  cells(): number;
/**
*/
  tick(): void;
/**
* @returns {Universe}
*/
  static new(): Universe;
/**
* @returns {string}
*/
  render(): string;
}
