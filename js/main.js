import { SHO, WELL } from "./system.js";
import { PlotAnimation } from "./grafico.js";
import * as units from "./units.js";

let systemTypes = ["sho", "well", "barrier"];
let SYSTEM_TYPE = systemTypes[0]; //This variable will be used throughout the application
let maxN = 0;
let timeIndependentSystem;
let timeDependentSystem;
let animation;

let createTableStates = function (system) {
  let table =
    '<tr class="thead-light" ><th scope="col">\\[n\\]</th><th scope="col">\\[\\psi_n(x)=';
  table += system.generalPsiString;
  table += '\\]</th><th scope="col">\\[E_n=';
  table += system.generalEnergyString + "\\]</th></tr>";

  for (let n = 0; n < system.psiStrings.length; n++) {
    table += "<tr>";
    table += '<th scope="row">\\[' + n + "\\]</th>";
    table += "<td>\\[" + system.psiStrings[n] + "\\]</td>";
    table += "<td>\\[" + system.energyStrings[n] + "\\]</td>";
    table += "</tr>";
  }
  return table;
};

class TimeDependentSystem {
  /**
   * @param {system} system - System with time independent states and energies
   * @param {list} coefs - list of complex coefficients of the superposition
   */
  constructor(system, coefs) {
    this._coefs = coefs;
    this.normalize();
    this.system = system;
  }
  set coefs(coefs) {
    this._coefs = coefs;
    this.normalize();
  }
  get coefs() {
    return this._coefs;
  }
  squareMagnitude = function (x) {
    // Function that receives a complex number and calculates its magnitud squared
    return Math.pow(x.r, 2) + Math.pow(x.i, 2);
  };
  normalize() {
    // function that reescales coefficients to normalize the wave function
    // it is asumed that each mode in normalized
    let mag = 0;
    for (let c of this.coefs) {
      mag += this.squareMagnitude(c);
    }
    mag = Math.sqrt(mag);
    for (let i = 0; i < this._coefs.length; i++) {
      this._coefs[i] = { r: this._coefs[i].r / mag, i: this._coefs[i].i / mag };
    }
    // console.log(this._coefs);
  }
  PsiN = function (n, x, t) {
    // State n with time dependence included, returns an object with real and imaginary parts
    let argument = (-this.system.energy(n) * t) / units.hBar;
    let psi = this.system.psiN(n, x);
    let real = psi * Math.cos(argument);
    let imaginary = psi * Math.sin(argument);
    return { r: real, i: imaginary };
  };
  superpositionPsi = function (x, t) {
    // return the wave function for the superposition
    // recieves a list with the coefficients: [c0, c1, c2, ...]
    let real = 0;
    let imaginary = 0;
    for (let n = 0; n < this._coefs.length; n++) {
      let modeN = this.PsiN(n, x, t);
      real = real + this._coefs[n].r * modeN.r - this._coefs[n].i * modeN.i;
      imaginary =
        imaginary + this._coefs[n].r * modeN.i + this._coefs[n].i * modeN.r;
    }
    return { r: real, i: imaginary };
  };
  probDensity = function (x, t) {
    return this.squareMagnitude(this.superpositionPsi(x, t));
  };
}

let animationParameters = {
  x: { min: -10, max: 10, N: 500 },
  t: { min: 0, max: 10, N: 800 },
};

let showLoader = function () {
  let loader = document.getElementsByClassName("loader")[0];
  loader.style.display = "block";
};
let hideLoader = function () {
  let loader = document.getElementsByClassName("loader")[0];
  loader.style.display = "none";
};
let enableButtons = function () {
  document.getElementById("startButton").disabled = false;
  document.getElementById("stopButton").disabled = false;
};
let calculateClicked = function () {
  showLoader();
  setTimeout(function () {
    calculate();
    hideLoader();
    hideLoader();
    enableButtons();
  }, 20);
};
let calculate = function () {
  let m = parseFloat(document.getElementById("mass").value);
  maxN = parseFloat(document.getElementById("maxN").value);

  // Read coefficients
  let myCoefs = [];
  for (let n = 0; n <= maxN; n++) {
    let cN = {
      r: parseFloat(document.getElementById("c" + n + "R").value),
      i: parseFloat(document.getElementById("c" + n + "I").value),
    };
    myCoefs.push(cN);
  }
  console.log(myCoefs);

  if (SYSTEM_TYPE == "sho") {
    let w = parseFloat(document.getElementById("frequency").value);
    timeIndependentSystem = new SHO(m, w, maxN);
    timeDependentSystem = new TimeDependentSystem(
      timeIndependentSystem,
      myCoefs
    );
  } else if (SYSTEM_TYPE == "well") {
    console.log("well selected");
    let a = parseFloat(document.getElementById("anchoWell").value);
    timeIndependentSystem = new WELL(m, a, maxN);
    timeDependentSystem = new TimeDependentSystem(
      timeIndependentSystem,
      myCoefs
    );
  }

  document.getElementById("baseStatesTable").innerHTML = createTableStates(
    timeIndependentSystem
  );
  document.getElementById("baseStatesTable").style.display = "block";
  MathJax.typeset();
  animation = new PlotAnimation(
    "plotContainer",
    timeDependentSystem.probDensity.bind(timeDependentSystem),
    timeDependentSystem.system.V.bind(timeDependentSystem.system),
    animationParameters
  );
  animation.generateFrames();
  animation.createPlot();

  document.getElementById("plotContainer").style.display = "block";

  // event listeners for play and stop buttons
  document.getElementById(
    "startButton"
  ).onclick = animation.startAnimation.bind(animation);
  document.getElementById("stopButton").onclick = animation.stopAnimation.bind(
    animation
  );
};
document.getElementById("calculateButton").onclick = calculateClicked;

/// MENUS INTERACTIVITY

let showCoefficientsMenu = function () {
  console.log("max state changed");
  let newMaxN = parseFloat(document.getElementById("maxN").value);
  let coefsInput = document.getElementById("coefsInputs");
  if (newMaxN > maxN) {
    for (let n = maxN + 1; n <= newMaxN; n++) {
      let stringCn =
        '<div class="form-group">\\(c_{' +
        n +
        '} = \\) <input class="smallNumberInput" type="number" id="c' +
        n +
        'R" required value="0" step="any" /> \\( +\\quad i\\) <input type="number" class="smallNumberInput" id="c' +
        n +
        'I" required value="0" step="any"/>    </div>';

      coefsInput.insertAdjacentHTML("beforeend", stringCn);
    }
    MathJax.typeset();
  } else {
    for (let n = maxN; n >= newMaxN + 1; n--) {
      coefsInput.querySelector("div:nth-child(" + (n + 1) + ")").remove();
    }
  }
  maxN = newMaxN;

  return false;
};

let systemsIds = [];
for (let id of systemTypes) {
  systemsIds.push({ image: id, params: id + "Parameters" });
}
// console.log(systemsIds);
let mostrar = function (idAMostrar) {
  console.log(idAMostrar);
  SYSTEM_TYPE = idAMostrar;
  for (let systemId of systemsIds) {
    console.log(systemId);
    if (systemId.image == idAMostrar) {
      console.log(systemId.params);
      document.getElementById(systemId.params).style.display = "block";
    } else {
      document.getElementById(systemId.params).style.display = "none";
    }
  }
  let c0R = document.getElementById("c0R");
  let c0I = document.getElementById("c0I");
  if (idAMostrar == "well") {
    c0R.disabled = true;
    c0I.disabled = true;
    c0R.value = "0";
    c0I.value = "0";
  } else {
    c0R.disabled = false;
    c0I.disabled = false;
    c0R.value = "1";
    c0I.value = "0";
    document.getElementById("maxN").value = maxN > 1 ? maxN : 1;
    showCoefficientsMenu();
  }
};

// add event listeners
for (let id of systemTypes) {
  document.getElementById(id).onclick = () => mostrar(id);
}
//show SHO at the beggining
mostrar("sho");

document.getElementById("maxN").onchange = showCoefficientsMenu;
console.log(document.getElementById("maxN"));
