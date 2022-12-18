let carRed = document.getElementById('carRed');
let carYellow = document.getElementById('carYellow');
let carGreen = document.getElementById('carGreen');
let pedestrianRed = document.getElementById('pedestrianRed');
let pedestrianGreen = document.getElementById('pedestrianGreen');
let buttonLight = document.getElementById('buttonsLight');

let buttonPressed = false;
let isWaitingToCross = false;
let prevCycleMode = 'night';
let cycleMode = 'night';
let prevGreenMode = "off";
let greenMode = "off";
let state = 0;
let currentTime;
let prevTime = 0;
let blinkCurrentTime;
let prevBlinkTime;
let intervalID;
let blinkingDone = false;
let blinksCounter = 0;

let totalDuration_MS = 20000;
let twoGroupsDuration_MS = 8000;
let totalGreenDuration_MS = totalDuration_MS - twoGroupsDuration_MS;
let carsGreenDuration_MS = 8000;
let pedestriansGreenDuration_MS = 4000;
let zeroStateDuration_MS = 1000;
let greenWaveDistance = 0;
let prevGreenWaveDistance = 0;
let isGreenWaveDelayDone = true;

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrImOnwkKaURJinrIyUwBwx8HZPBf69EA",
  authDomain: "asjade-internet-marilii.firebaseapp.com",
  databaseURL: "https://asjade-internet-marilii-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "asjade-internet-marilii",
  storageBucket: "asjade-internet-marilii.appspot.com",
  messagingSenderId: "430481645317",
  appId: "1:430481645317:web:747bb1eb5b1044cab8616c"
}

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const dbTraffic = ref(db, "traffic");

onValue(dbTraffic, display);

function display(reference) {
  let data = reference.val();
  prevCycleMode = cycleMode;
  cycleMode = data.anneliV.cycle;
  prevGreenMode = greenMode;
  greenMode = data.green.direction;
  let correctDuration = getDurationFromDB(data.green.direction, data.green.duration, data.anneliV.duration);
  totalDuration_MS = convertSecondsToMilliseconds(correctDuration);
  if(isGreenMode()) {
    cycleMode = data.green.cycle;
    let correctDistance = getDistanceFromDB(data.green.direction, data.distances["1-2"], data.distances["2-3"], data.distances["3-4"]);
    greenWaveDistance = convertSecondsToMilliseconds(correctDistance);
  }
  init();
}


// Helper functions - about Cycle Mode
function isButtonMode() {
  return cycleMode == "button";
}

function isNightMode() {
  return cycleMode == "night";
}

function isAutoMode() {
  return cycleMode == "auto";
}

function isGreenMode() {
  return ((greenMode == "left") || (greenMode == "right"));
}

function hasNightModeUsed() {
  console.log('Previous Mode: ', prevCycleMode);
  console.log('Current Mode: ', cycleMode);

  return (((prevCycleMode != 'night') && (cycleMode == 'night')) || ((prevCycleMode == 'night') && (cycleMode != 'night')))
}


// Helper functions - about state & state changing times
function setPrevActionTime() {
  prevTime = currentTime;
}

function isTimeForAction(timeLimit) {
  return currentTime - prevTime >= timeLimit;
}

function setPrevBlinkTime() {
  prevBlinkTime = blinkCurrentTime;
}

function isTimeForBlink(timeLimit) {
  return blinkCurrentTime - prevBlinkTime >= timeLimit;
}

function isBlinkingDone() {
  return blinkingDone == true;
}

function setState(stateNumber) {
  state = stateNumber;
}

function getDistanceFromDB(direction, firstDirection, secondDirection, thirdDirection) {
  if(direction == "right") {
    return (firstDirection + secondDirection + thirdDirection);
  }
  return 0;
}


// Helper function - about cycle durations
function getDurationFromDB(direction, greenDuration, notGreenDuration){
  if(direction == "off") {greenWaveDistance = 0; return notGreenDuration;}
  return greenDuration;
}

function convertSecondsToMilliseconds(duration_s) {
  return duration_s * 1000;
}

function calcGreenDurations() {
  totalGreenDuration_MS = totalDuration_MS - twoGroupsDuration_MS;
  carsGreenDuration_MS = totalGreenDuration_MS * 0.6;
  pedestriansGreenDuration_MS = totalGreenDuration_MS * 0.4;
  console.log('duration: ', totalDuration_MS);
  console.log('Jagamisele: ', totalGreenDuration_MS);
  console.log('Green car: ', carsGreenDuration_MS);
  console.log('Green pedestrian: ', pedestriansGreenDuration_MS);
  console.log('-------------------------');
}


// Helper functions - about Lights
function turnLightON(light, lightClass) {
  light.classList.add(lightClass);
}

function turnLightOFF(light, lightClass) {
  light.classList.remove(lightClass);
}

function isLightON(light, lightClass) {
  return light.classList.contains(lightClass);
}

function toggleLight(light, lightClass) {
  isLightON(light, lightClass) ? turnLightOFF(light, lightClass) : turnLightON(light, lightClass);
}

function blinkLight(light, lightClass) {
  if(blinksCounter === 0) {
    toggleLight(light, lightClass);
    setPrevBlinkTime();
    blinksCounter = 1;
  }

  if(isTimeForBlink(500)) {
    toggleLight(light, lightClass);
    setPrevBlinkTime();

    if(blinksCounter == 3) {
      blinksCounter = 0;
      blinkingDone = true;
    } else {
      blinksCounter ++;
    }
  }
}

function turnAllLightsOFF() {
  carRed.classList.remove("red");
  carYellow.classList.remove("yellow");
  carGreen.classList.remove("green");
  pedestrianRed.classList.remove("red");
  pedestrianGreen.classList.remove("green");
  buttonLight.classList.remove("white");
}


// Helper functions - about button being pressed
window.waitingToCross = () => {
  if(isButtonMode()) {
    console.log("Button was pressed...");
    buttonPressed = true;
  }
}

function wasButtonPressed() {
  return buttonPressed && (!(isWaitingToCross))
}




function init() {
  if(hasNightModeUsed()) {
    turnAllLightsOFF();
  }

  calcGreenDurations();

  if(intervalID) {
    clearInterval(intervalID);
  }

  intervalID = setInterval(startLoop, 500);
  // startLoop();
}

function startLoop() {
  if(isNightMode()) {
    runNightMode();
  }

  if(isAutoMode()) {
    runAutomaticMode();
  }

  if(isButtonMode()) {
    runButtonMode();
  }

  // intervalID = setTimeout(startLoop, 500);
}


function runNightMode() {
  currentTime = performance.now();

  if(isTimeForAction(1000)) {
    toggleLight(carYellow, 'yellow');
    setPrevActionTime();
    setState(0);
  }
}


function runAutomaticMode() {
  currentTime = performance.now();

  if ((greenWaveDistance > 0) && ((greenWaveDistance != prevGreenWaveDistance))) {
    isGreenWaveDelayDone = false;
    zeroStateDuration_MS = greenWaveDistance + 1000;
    prevGreenWaveDistance = greenWaveDistance;
  }

  if(isGreenWaveDelayDone) {
    zeroStateDuration_MS = 1000;
  }

  if(state === 0) {
    turnLightON(carRed, 'red');
    turnLightON(pedestrianRed, 'red');
    setPrevActionTime();
    setState(1);
  }

  if((state === 1) && (isTimeForAction(zeroStateDuration_MS))) {
    isGreenWaveDelayDone = true;
    turnLightON(carYellow, 'yellow');
    setPrevActionTime();
    setState(2);
  }

  if((state === 2) && (isTimeForAction(1000))) {
    turnLightOFF(carRed, 'red');
    turnLightOFF(carYellow, 'yellow');
    turnLightON(carGreen, 'green');
    setPrevActionTime();
    setState(3);
  }

  if(state === 8) {
    setState(3);
  }

  if((state === 3) && (isTimeForAction(carsGreenDuration_MS))) {
    blinkCurrentTime = performance.now();

    if(!isBlinkingDone()) {
      blinkLight(carGreen, 'green');
    }

    if(isBlinkingDone()) {
      setPrevActionTime();
      setState(4);
      blinkingDone = false;
    }
  }

  if((state === 4) && (isTimeForAction(500))) {
    turnLightOFF(carGreen, 'green');
    turnLightON(carYellow, 'yellow');
    setPrevActionTime();
    setState(5);
  }

  if((state === 5) && (isTimeForAction(1000))) {
    turnLightOFF(carYellow, 'yellow');
    turnLightON(carRed, 'red');
    setPrevActionTime();
    setState(6);
  }

  if((state === 6) && (isTimeForAction(1000))) {
    turnLightOFF(pedestrianRed, 'red');
    turnLightON(pedestrianGreen, 'green');
    setPrevActionTime();
    setState(7);
  }

  if((state === 7) && (isTimeForAction(pedestriansGreenDuration_MS))) {
    blinkCurrentTime = performance.now();

    if(!isBlinkingDone()) {
      blinkLight(pedestrianGreen, 'green');
    }

    if((isBlinkingDone()) && (isTimeForBlink(500))) {
      turnLightOFF(pedestrianGreen, 'green');
      setPrevActionTime();
      setState(0);
      blinkingDone = false;
    }
  }
}


function runButtonMode() {
  if(wasButtonPressed()) {
    isWaitingToCross = true;
    turnLightON(buttonLight, 'white');
  }

  currentTime = performance.now();

  if(state === 0) {
    turnLightON(carRed, 'red');
    turnLightON(pedestrianRed, 'red');
    setPrevActionTime();
    setState(1);
  }

  if((state === 1) && (isTimeForAction(zeroStateDuration_MS))) {
    turnLightON(carYellow, 'yellow');
    setPrevActionTime();
    setState(2);
  }

  if((state === 2) && (isTimeForAction(1000))) {
    turnLightOFF(carRed, 'red');
    turnLightOFF(carYellow, 'yellow');
    turnLightON(carGreen, 'green');
    setPrevActionTime();
    setState(8);
  }

  if((state === 8) && (isWaitingToCross)) {
    setPrevActionTime();
    setState(3);
  }

  if((state === 3) && (isTimeForAction(3000)) && (isWaitingToCross)) {
    blinkCurrentTime = performance.now();

    if(!isBlinkingDone()) {
      blinkLight(carGreen, 'green');
    }

    if(isBlinkingDone()) {
      setPrevActionTime();
      setState(4);
      blinkingDone = false;
    }
  }

  if((state === 4) && (isTimeForAction(500))) {
    turnLightOFF(carGreen, 'green');
    turnLightON(carYellow, 'yellow');
    setPrevActionTime();
    setState(5);
  }

  if((state === 5) && (isTimeForAction(1000))) {
    turnLightOFF(carYellow, 'yellow');
    turnLightON(carRed, 'red');
    setPrevActionTime();
    setState(6);
  }

  if((state === 6) && (isTimeForAction(1000))) {
    turnLightOFF(pedestrianRed, 'red');
    turnLightON(pedestrianGreen, 'green');
    turnLightOFF(buttonLight, 'white');
    setPrevActionTime();
    setState(7);
  }

  if((state === 7) && (isTimeForAction(pedestriansGreenDuration_MS))) {
    blinkCurrentTime = performance.now();

    if(!isBlinkingDone()) {
      blinkLight(pedestrianGreen, 'green');
    }

    if((isBlinkingDone()) && (isTimeForBlink(500))) {
      turnLightOFF(pedestrianGreen, 'green');
      setPrevActionTime();
      isWaitingToCross = false;  // after that it's ready to listen next button press
      buttonPressed = false;
      setState(0);
      blinkingDone = false;
    }
  }
}