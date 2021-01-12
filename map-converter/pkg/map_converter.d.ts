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
* @param {Uint8Array} source
* @param {Size} size
* @returns {Uint8Array}
*/
export function parse_vec(source: Uint8Array, size: Size): Uint8Array;
/**
*/
export enum Cell {
  Dead,
  Alive,
}
/**
*/
export class Size {
  free(): void;
/**
* @param {number} width
* @param {number} height
* @returns {Size}
*/
  static new(width: number, height: number): Size;
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
