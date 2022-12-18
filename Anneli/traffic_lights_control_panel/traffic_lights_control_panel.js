let newWaveDirection, newWaveMode, newDuration, newMode;
let waveBtn = document.getElementById('waveBtn');
let waveChangesBtn = document.getElementById('waveChangesBtn')
let greenDurationSeconds = document.getElementById('greenDuration');
let firstDistanceSeconds = document.getElementById('firstDistance');
let secondDistanceSeconds = document.getElementById('secondDistance');
let thirdDistanceSeconds = document.getElementById('thirdDistance');

let greenForwardDirectionBtn = document.getElementById('forwardDirection');
let greenBackwardDirectionBtn = document.getElementById('backwardDirection');
let greenAutoModeBtn = document.getElementById('greenAutoMode');
let greenButtonModeBtn = document.getElementById('greenButtonMode');
let getGreenChoiceElement = {'right': greenForwardDirectionBtn,'left': greenBackwardDirectionBtn,'auto': greenAutoModeBtn,'button': greenButtonModeBtn}

let mariliiNDuration = document.getElementById('mariliiNDuration');
let mariliiVDuration = document.getElementById('mariliiVDuration');
let anneliNDuration = document.getElementById('anneliNDuration');
let anneliVDuration = document.getElementById('anneliVDuration');
let getDurationElement = {'mariliiN': mariliiNDuration,'mariliiV': mariliiVDuration,'anneliN': anneliNDuration,'anneliV': anneliVDuration}

let saveMariliiN = document.getElementById('saveMariliiN');
let saveMariliiV = document.getElementById('saveMariliiV');
let saveAnneliN = document.getElementById('saveAnneliN');
let saveAnneliV = document.getElementById('saveAnneliV');
let getSaveButtonElement = {'mariliiN': saveMariliiN,'mariliiV': saveMariliiV,'anneliN': saveAnneliN,'anneliV': saveAnneliV}

let mariliiNAutoBtn = document.getElementById('mariliiNAutoBtn');
let mariliiNButtonBtn = document.getElementById('mariliiNButtonBtn');
let mariliiNNightBtn = document.getElementById('mariliiNNightBtn');
let mariliiVAutoBtn = document.getElementById('mariliiVAutoBtn');
let mariliiVButtonBtn = document.getElementById('mariliiVButtonBtn');
let mariliiVNightBtn = document.getElementById('mariliiVNightBtn');
let anneliNAutoBtn = document.getElementById('anneliNAutoBtn');
let anneliNButtonBtn = document.getElementById('anneliNButtonBtn');
let anneliNNightBtn = document.getElementById('anneliNNightBtn');
let anneliVAutoBtn = document.getElementById('anneliVAutoBtn');
let anneliVButtonBtn = document.getElementById('anneliVButtonBtn');
let anneliVNightBtn = document.getElementById('anneliVNightBtn');
let getModeElement = {
  'mariliiN': {'auto': mariliiNAutoBtn,'button': mariliiNButtonBtn,'night': mariliiNNightBtn},
  'mariliiV': {'auto': mariliiVAutoBtn,'button': mariliiVButtonBtn,'night': mariliiVNightBtn},
  'anneliN': {'auto': anneliNAutoBtn,'button': anneliNButtonBtn,'night': anneliNNightBtn},
  'anneliV': {'auto': anneliVAutoBtn,'button': anneliVButtonBtn,'night': anneliVNightBtn},
}

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
  setWaveBtnStyle(data.green.direction);
  setWaveChoice(data.green.direction);
  setWaveChoice(data.green.cycle);
  greenDurationSeconds.value = data.green.duration;
  firstDistanceSeconds.value = data.distances['1-2'];
  secondDistanceSeconds.value = data.distances['2-3'];
  thirdDistanceSeconds.value = data.distances['3-4'];
  mariliiNDuration.value = data.mariliiN.duration;
  mariliiVDuration.value = data.mariliiV.duration;
  anneliNDuration.value = data.anneliN.duration;
  anneliVDuration.value = data.anneliV.duration;
  setMode(data.mariliiN.cycle, 'mariliiN');
  setMode(data.mariliiV.cycle, 'mariliiV');
  setMode(data.anneliN.cycle, 'anneliN');
  setMode(data.anneliV.cycle, 'anneliV');
}


// Helper functions:
function setWaveBtnColor(color) {
  waveBtn.style.backgroundColor = color;
}

function setWaveBtnValue(btnText) {
  waveBtn.value = btnText;
}

function setWaveChangesBtnVisibility(value) {
  waveChangesBtn.style.visibility = value;
}

function setActiveElementsColor(element, color) {
  element.classList.add(color);
}

function removePreviousChoiceColor(choice) {
  if((choice == 'right') || (choice == 'left')) {
    greenBackwardDirectionBtn.classList.remove('green-active');
    greenForwardDirectionBtn.classList.remove('green-active');
  }
  if((choice == 'auto') || (choice == 'button')) {
    greenAutoModeBtn.classList.remove('green-active');
    greenButtonModeBtn.classList.remove('green-active');
  }
}

function allChoicesAreMade() {
  return ((newWaveDirection != undefined) && (newWaveMode != undefined));
}

function removeModeBtnColor(firstElement, secondElement, thirdElement) {
  firstElement.classList.remove('blue-active');
  secondElement.classList.remove('blue-active');
  thirdElement.classList.remove('blue-active');
}

function changeIndividualBtnText(element) {
  setTimeout(() => {element.value = "Saved"}, 300);
  setTimeout(() => {element.value = "Save"}, 800)
}

function addWaveSettingsToDB() {
  update(dbTraffic, {
    'green/direction': newWaveDirection,
    'green/cycle': newWaveMode,
    'green/duration': greenDurationSeconds.valueAsNumber,
    'distances/1-2': firstDistanceSeconds.valueAsNumber,
    'distances/2-3': secondDistanceSeconds.valueAsNumber,
    'distances/3-4': thirdDistanceSeconds.valueAsNumber,
  });
}

function deactivateGreenWave() {
  update(dbTraffic, {
    'green/direction': 'off',
    'green/cycle': 'night',
  });
}




function setWaveBtnStyle(direction) {
  if(direction == 'off') {
    setWaveBtnColor('#1b9e5d');
    setWaveBtnValue('Activate Green Wave');
    setWaveChangesBtnVisibility('hidden');
  } else {
    setWaveBtnColor('darkmagenta');
    setWaveBtnValue('Deactivate Green Wave');
    setWaveChangesBtnVisibility('visible');
  }
}

function setWaveChoice(choice) {
  if((choice != undefined) && (choice != 'off') && (choice != 'night')) {
    removePreviousChoiceColor(choice);
    setActiveElementsColor(getGreenChoiceElement[choice], 'green-active');
  }
}

window.setWaveDirection = (direction) => {
  setWaveChoice(direction);
  newWaveDirection = direction;
}

window.setWaveMode = (mode) => {
  setWaveChoice(mode);
  newWaveMode = mode;
}

window.setWaveSettings = () => {
  if((waveBtn.value == 'Activate Green Wave') && (allChoicesAreMade())) {
    addWaveSettingsToDB();
  } else if (waveBtn.value == 'Deactivate Green Wave'){
    deactivateGreenWave('off', 'night');
  }
}

window.saveWaveChanges = () => {
  addWaveSettingsToDB();
}



function setModeBtnColor(mode, trafficLightName) {
  removeModeBtnColor(
    getModeElement[trafficLightName]['auto'],
    getModeElement[trafficLightName]['button'],
    getModeElement[trafficLightName]['night']
  );
  setActiveElementsColor(getModeElement[trafficLightName][mode], 'blue-active');
}

window.setMode = (mode, trafficLightName) => {
  setModeBtnColor(mode, trafficLightName);
  newMode = mode;
}

window.saveIndividualSettings = (trafficLightName) => {
  newDuration = getDurationElement[trafficLightName].valueAsNumber;

  update(ref(db, "traffic/"+ trafficLightName), {
    'duration': newDuration,
    'cycle': newMode,
  })
  .then(() => {
    changeIndividualBtnText(getSaveButtonElement[trafficLightName]);
  })
  .catch((error) => {
    alert("Unsuccessful, error" + error);
  });
}