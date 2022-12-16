// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-database.js";

let carRed, carAmber, carGreen, pedestrianRed, pedestrianGreen, pedestrianLight,
 lights, duration, elapsed, startTime, currentTime, buttonStart, buttonCurrent, buttonElapsed,
 currentInterval, diffDelay;
let totalTime = 0;
let dbDelay = 0;
let delay = 0;
let stage = 8;
let cycle = 'night';
let prevCycle = 'night';
let firstCycle = true;
let buttonWait = false;
let prevTime = 0;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrImOnwkKaURJinrIyUwBwx8HZPBf69EA",
    authDomain: "asjade-internet-marilii.firebaseapp.com",
    databaseURL: "https://asjade-internet-marilii-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "asjade-internet-marilii",
    storageBucket: "asjade-internet-marilii.appspot.com",
    messagingSenderId: "430481645317",
    appId: "1:430481645317:web:747bb1eb5b1044cab8616c"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const folder = ref(db, "traffic");
let contents;
let direction;

const display = (reference) => {
    contents = reference.val();
    direction = contents.green.direction;
    prevCycle = cycle;
    if (direction === 'off') {
        duration = contents.mariliiV.duration;
        cycle = contents.mariliiV.cycle;
        dbDelay = 0
    } else {
        duration = contents.green.duration;
        cycle = contents.green.cycle;

        if (direction === 'right') {
            dbDelay = contents.distances['1-2'];
        } else {
            dbDelay = contents.distances['2-3'] + contents.distances['3-4'];
        }
    }
    
    duration = duration * 1000 - 8000;
    dbDelay = dbDelay * 1000;
    
    if (cycle !== prevCycle) {
        firstCycle = true;
    }
    init();
}

onValue(folder, display);

const init = () => {
    carRed = document.getElementById('carRed');
    carAmber = document.getElementById('carAmber');
    carGreen = document.getElementById('carGreen');
    pedestrianGreen = document.getElementById('pedestrianGreen');
    pedestrianRed = document.getElementById('pedestrianRed');
    pedestrianLight = document.getElementById('pedestrianLight');
    lights = [carRed, carAmber, carGreen, pedestrianRed, pedestrianGreen, pedestrianLight];
    resetLights();

    if (prevCycle === 'night' && cycle !== 'night' || prevCycle !== 'night' && cycle === 'night') {
        stage = 2;
        prevCycle = cycle;
        firstCycle = true;
    }

    if (currentInterval) {
        clearInterval(currentInterval);
    }

    currentInterval = setInterval(() => {
        initLights()
    }, 500);
}

const resetLights = () => {
    lights.forEach((light) => {
        light.classList.add('off');
    })
}

const isOn = (light) => {
    return !light.classList.contains('off');
}

const turnOn = (light) => {
    light.classList.contains('off') && light.classList.remove('off');
}

const turnOff = (light) => {
    !light.classList.contains('off') && light.classList.add('off');
}

window.pressButton = () => {
    if (cycle === 'button') {
        if (!buttonWait) {
            buttonCurrent  = performance.now();
            if (stage === 2 || stage === 3 || stage === 4 || stage === 5) {
                buttonWait = true;
                turnOn(pedestrianLight);
            } else {
                if (stage !== 1 && stage !== 2 && stage !== 3) {
                    stage = 4;
                }
            }
        }
    }
}

const initLights = () => {
    if (cycle === 'button') {
        if (buttonWait) {
            buttonCurrent  = performance.now();
            buttonElapsed = buttonCurrent - buttonStart;

            if (firstCycle) {
                buttonStart = buttonCurrent;
            }

            switch (stage) {
                case 0:
                    turnOff(pedestrianLight);

                    if (buttonElapsed >= duration * 0.4) {
                        buttonWait = false;
                        stage = 1;
                        firstCycle = true;
                    }
                    break;
                case 4:
                    if (buttonElapsed >= 3000) {
                        stage = 5;
                        firstCycle = true;
                    }
                    break;
                default:
                    break;
            }
        } else {
            if (stage !== 1 && stage !== 2 && stage !== 3) {
                stage = 4;
            }
        }
    } else {
        turnOff(pedestrianLight);
    }
    
    switch (stage) {
        case 0:
            !isOn(carRed) && turnOn(carRed);
            isOn(carAmber) && turnOff(carAmber);
            isOn(carGreen) && turnOff(carGreen);
            isOn(pedestrianRed) && turnOff(pedestrianRed);
            !isOn(pedestrianGreen) && turnOn(pedestrianGreen);

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= duration * 0.4 + delay) {
                totalTime += elapsed;
                delay = 0;
                firstCycle = true;

                if (cycle !== 'night') {
                    stage = 1;
                } else {
                    stage = 8;
                }
            }
            break;
        case 1:
            if (firstCycle) {
                !isOn(carRed) && turnOn(carRed);
                isOn(carAmber) && turnOff(carAmber);
                isOn(carGreen) && turnOff(carGreen);
                isOn(pedestrianRed) && turnOff(pedestrianRed);
                isOn(pedestrianGreen) && turnOff(pedestrianGreen);
            }

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 500) {
                isOn(pedestrianGreen) ? turnOff(pedestrianGreen) : turnOn(pedestrianGreen);
            }

            if (elapsed >= 2000 + delay) {
                totalTime += elapsed;
                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 2;
                } else {
                    stage = 8;
                }
            }
            break;
        case 2:
            !isOn(carRed) && turnOn(carRed);
            isOn(carAmber) && turnOff(carAmber);
            isOn(carGreen) && turnOff(carGreen);
            !isOn(pedestrianRed) && turnOn(pedestrianRed);
            isOn(pedestrianGreen) && turnOff(pedestrianGreen);

            currentTime = performance.now();

            if (firstCycle) {
                console.log(totalTime - prevTime);
                prevTime = totalTime;
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 1000 + delay) {
                totalTime += elapsed;
                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 3;
                } else {
                    stage = 8;
                }
            }
            break;
        case 3:
            !isOn(carRed) && turnOn(carRed);
            !isOn(carAmber) && turnOn(carAmber);
            isOn(carGreen) && turnOff(carGreen);
            !isOn(pedestrianRed) && turnOn(pedestrianRed);
            isOn(pedestrianGreen) && turnOff(pedestrianGreen);

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 1000 + delay) {
                totalTime += elapsed;
                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 4;
                } else {
                    stage = 8;
                }
            }
            break;
        case 4:
            isOn(carRed) && turnOff(carRed);
            isOn(carAmber) && turnOff(carAmber);
            !isOn(carGreen) && turnOn(carGreen);
            !isOn(pedestrianRed) && turnOn(pedestrianRed);
            isOn(pedestrianGreen) && turnOff(pedestrianGreen);

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= duration * 0.6 + delay) {
                totalTime += elapsed;
                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 5;
                } else {
                    stage = 8;
                }
            }
            break;
        case 5:
            if (firstCycle) {
                isOn(carRed) && turnOff(carRed);
                isOn(carAmber) && turnOff(carAmber);
                isOn(carGreen) && turnOff(carGreen);
                !isOn(pedestrianRed) && turnOn(pedestrianRed);
                isOn(pedestrianGreen) && turnOff(pedestrianGreen);
            }            

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 500) {
                isOn(carGreen) ? turnOff(carGreen) : turnOn(carGreen);
            }

            if (elapsed >= 2000 + delay) {
                totalTime += elapsed;
                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 6;
                } else {
                    stage = 8;
                }
            }
            break;
        case 6:
            isOn(carRed) && turnOff(carRed);
            !isOn(carAmber) && turnOn(carAmber);
            isOn(carGreen) && turnOff(carGreen);
            !isOn(pedestrianRed) && turnOn(pedestrianRed);
            isOn(pedestrianGreen) && turnOff(pedestrianGreen);

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 1000 + delay) {
                totalTime += elapsed;
                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 7;
                } else {
                    stage = 8;
                }
            }
            break;
        case 7:
            !isOn(carRed) && turnOn(carRed);
            isOn(carAmber) && turnOff(carAmber);
            isOn(carGreen) && turnOff(carGreen);
            !isOn(pedestrianRed) && turnOn(pedestrianRed);
            isOn(pedestrianGreen) && turnOff(pedestrianGreen);

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 1000 + delay) {
                totalTime += elapsed;
                isOn(pedestrianRed) && turnOff(pedestrianRed);
                !isOn(pedestrianGreen) && turnOn(pedestrianGreen);

                firstCycle = true;
                delay = 0;

                if (cycle !== 'night') {
                    stage = 0;
                } else {
                    stage = 8;
                }
            }
            break;
        case 8:
            resetLights();

            currentTime = performance.now();

            if (firstCycle) {
                startTime = totalTime;
                firstCycle = false;

                if (dbDelay !== diffDelay) {
                    diffDelay = dbDelay;
                    delay = diffDelay;
                }
            }

            elapsed = currentTime - startTime;

            if (elapsed >= 500 + delay) {
                totalTime += elapsed;
                isOn(carAmber) ? turnOff(carAmber) : turnOn(carAmber);

                firstCycle = true;
                delay = 0;
            }
            break;
        default:
            stage = 8;
            break;
    }
}