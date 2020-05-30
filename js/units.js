"use strict";
// Module that the defines the units that will be used throughout the application
const electronMass = 9.10938356e-31; // in kg
const baseTime = 1.350949e-16; //Period of 400 nm light in vacuum in seconds
const baseLength = 1e-10; // in m
const hBar = 1.5639616; // in units of : mass*length^2/time

let kgToUMass = function (m) {
  return m / electronMass;
};
let sToUTime = function (t) {
  return t / baseTime;
};
let mToULength = function (l) {
  return l / baseLength;
};
export {
  electronMass,
  baseTime,
  baseLength,
  hBar,
  kgToUMass,
  sToUTime,
  mToULength,
};
