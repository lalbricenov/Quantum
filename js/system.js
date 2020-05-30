"use strict";
import {
  electronMass,
  baseTime,
  baseLength,
  hBar,
  kgToUMass,
  sToUTime,
  mToULength,
} from "./units.js";
// import nerdamer from "./nerdamer/nerdamer.core.js";
import { hermite, hermiteString } from "./hermite.js";
import { factorials } from "./factorials.js";
// class System {
//   constructor(m, type, params) {
//     this.m = m;
//   }
// }

class SHO {
  // Simple harmonic oscillator
  /**
   * @param {number} m - Mass of the particle in mass units
   * @param {number} w - Frequency of the oscillator in time units
   * @param {number} maxN - N of the maximum state to be calculated. 0 means only the ground state.
   */
  constructor(m, w, maxN = 10) {
    this.m = m;
    this.w = w;
    this.maxN = maxN + 1;
    this.etaCoef = Math.sqrt((m * w) / hBar);
    this.coefBefHermite = Math.pow((m * w) / (Math.PI * hBar), 0.25);
    this.calculateBaseStateStrings();
  }

  V = function (x) {
    return (this.m * Math.pow(this.w * x, 2)) / 2;
  };

  psiN = function (n, x) {
    // stationary state n for the harmonic oscillator
    let eta = this.etaCoef * x;
    return (
      (this.coefBefHermite *
        hermite(n, eta) *
        Math.exp(-Math.pow(eta, 2) / 2)) /
      Math.sqrt(Math.pow(2, n) * factorials[n])
    );
  };
  energy = function (n) {
    return hBar * this.w * (n + 0.5);
  };

  calculateBaseStateStrings() {
    // Strings that correspond to the time independent base states
    this.psiStrings = [];
    this.generalPsiString =
      "\\left(\\frac{m\\omega}{\\pi\\hbar}\\right)^{1/4}\\frac{1}{\\sqrt{2^nn!}}H_n(\\xi)e^{-\\xi^2/2}";
    for (let n = 0; n < this.maxN; n++) {
      let hermiteN = hermiteString(n);
      let numTerms = (hermiteN.match(/ /g) || []).length;
      let str = "\\left(\\frac{m\\omega}{\\pi\\hbar}\\right)^{1/4}";
      let denom = Math.pow(2, n) * factorials[n];
      if (denom != 1) str += "\\frac{1}{\\sqrt{" + denom + "}}";
      if (numTerms > 1) {
        str += "\\left(" + hermiteN + "\\right)";
      } else {
        if (hermiteN != " 1") {
          str += hermiteN;
        }
      }
      str += " e^{-\\xi^2/2}";
      this.psiStrings.push(str);
    }
    this.energyStrings = [];
    this.generalEnergyString = "\\left(n+\\frac{1}{2}\\right) \\hbar\\omega";
    for (let n = 0; n < this.maxN; n++) {
      let num = 2 * n + 1;
      let str = "\\frac{" + num + "}{2}\\hbar\\omega";
      this.energyStrings.push(str);
    }
    this.VString = "\\frac{1}{2}m\\omega^2x^2";
  }
}

class WELL {
  // Infinite potential well
  /**
   * @param {number} m - Mass of the particle in mass units
   * @param {number} a - Width of the well
   * @param {number} maxN - N of the maximum state to be calculated. 0 means only the ground state.
   */
  constructor(m, a, maxN = 10) {
    this.m = m;
    this.a = a;
    this.k = 2000;
    this.h = 400;
    this.maxN = maxN + 1;
    this.coefBefSine = Math.sqrt(2 / this.a);
    this.factorEnergy =
      (Math.pow(hBar, 2) * Math.pow(Math.PI, 2)) /
      (2 * this.m * Math.pow(this.a, 2));
    this.calculateBaseStateStrings();
  }

  V = function (x) {
    return (
      this.h *
      (1 / (1 + Math.exp(-2 * this.k * (x - this.a))) +
        1 / (1 + Math.exp(2 * this.k * x)))
    );
  };

  psiN = function (n, x) {
    // stationary state n for the infinite potential well
    if (x < 0 || x > this.a) {
      return 0;
    } else {
      return this.coefBefSine * Math.sin((n * x * Math.PI) / this.a);
    }
  };
  energy = function (n) {
    return this.factorEnergy * Math.pow(n, 2);
  };

  calculateBaseStateStrings() {
    // Strings that correspond to the time independent base states
    this.psiStrings = [];
    this.generalPsiString =
      "\\sqrt{\\frac{2}{a}}\\sin{\\left(\\frac{n\\pi}{a}x\\right)}";

    this.energyStrings = [];
    this.generalEnergyString = "\\frac{n^2\\pi^2\\hbar^2}{2ma^2}";
    for (let n = 0; n < this.maxN; n++) {
      if (n == 0) {
        this.psiStrings.push("0");
        this.energyStrings.push("0");
        continue;
      }
      let strPsi = this.generalPsiString.replace(/{n/g, "{" + n);
      let strE = this.generalEnergyString.replace(/n/g, n);
      this.psiStrings.push(strPsi);
      this.energyStrings.push(strE);
    }

    this.VString = "0";
  }
}
export { SHO, WELL };
// class INFW extends System {
//   constructor(m, a) {
//     // a is the width of the well
//     super(m);
//     this.a = a;
//   }
// }
