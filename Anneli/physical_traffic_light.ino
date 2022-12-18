#include <Arduino.h>
#include <ArduinoJson.h>  // ArduinoJson documentation: https://arduinojson.org/
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>

const uint8_t fingerprint[20] = {0x5A, 0x12, 0xCA, 0xB5, 0x35, 0x69, 0x04, 0x81, 0xE6, 0x1F, 0x8A, 0x3D, 0xBA, 0xF1, 0x87, 0x1A, 0x24, 0xA5, 0x40, 0x64};

ESP8266WiFiMulti WiFiMulti;

const int pedestrianBtn = D0;
const int pedestrianRedLight = D1;
const int pedestrianGreenLight = D2;
const int pedestrianBtnWhiteLight = D3;
const int trafficRedLight = D5;
const int trafficYellowLight = D6;
const int trafficGreenLight = D7;

int state = 0;

String previousCycleMode = "night";
String cycleMode = "night";
String prevGreenMode = "off";
String greenMode = "off";
long cycleDurationInMillis = 20000;

// https://github.com/AnneliP88/Internet_of_Things_IFI6101.DT/tree/main/9.1%20%26%2010.1%20week#arvutuse-n%C3%A4ide
const long durationForTwoGroups = 8000; // this's for blinking, yellow, yellow + red and all red states
unsigned long durationToBeDevided = cycleDurationInMillis - durationForTwoGroups;
unsigned long durationForGreenCars;
unsigned long durationForGreenPedestrians;
unsigned long firstStateDuration = 1000;
unsigned long greenWaveDistance = 0;
unsigned long prevGreenWaveDistance;

unsigned long currentTimeMillis;
unsigned long prevTimeMillis;
unsigned long greenBlinkCurrentMillis;
unsigned long greenBlinkPreviousMillis;
const unsigned long blinkInterval = 500;

bool isGreenWaveDelayDone = true;
bool isWaitingToCross = false;
int pedestrianBtnStatus = 0;
int greenCounter = 0;

void setup() {
  WiFi.mode(WIFI_STA);
  //WiFiMulti.addAP("TLU", "");
  WiFiMulti.addAP("MinuOnePlus", "q54xw4hp");

  pinMode(pedestrianBtn, INPUT);
  pinMode(pedestrianBtnWhiteLight, OUTPUT);
  pinMode(pedestrianRedLight, OUTPUT);
  pinMode(pedestrianGreenLight, OUTPUT);
  pinMode(trafficRedLight, OUTPUT);
  pinMode(trafficYellowLight, OUTPUT);
  pinMode(trafficGreenLight, OUTPUT);

  Serial.begin(115200);
}


void loop() {
  connectAndFetchData();
  printOutFetchedData();
  calcGreenDurations();
  
  if (wasNightModeUsed()) {
    turnLightsOff();
  }


  if (isNightMode()) {
    currentTimeMillis = millis();
    
    if (isTimeForAction(blinkInterval)) {
      digitalWrite(trafficYellowLight, !digitalRead(trafficYellowLight));
      setPrevActionTime();
      setState(0);
    }
  }


  if (isButtonMode()) {
    pedestrianBtnStatus = digitalRead(pedestrianBtn);

    // If BUTTON was pushed, then turn "isWaitingToCross" ON and turn Pedestrian BUTTON LIGHT also ON
    if ((pedestrianBtnStatus == 1) && (!(isWaitingToCross))) {
      isWaitingToCross = true;
      digitalWrite(pedestrianBtnWhiteLight, HIGH);
    }

    currentTimeMillis = millis();

    // Traffic: RED ON,   pedestrian: RED ON,  BUTTON LED: oleneb, et kas nuppu on vajutatud juba või ei ole vajutatud
    if (state == 0) {
      digitalWrite(trafficRedLight, HIGH);
      digitalWrite(pedestrianRedLight, HIGH);
      setPrevActionTime();
      setState(1);
    }

    // Traffic: RED STILL ON & YELLOW ON,  pedestrian: RED STILL ON,  BUTTON LED: oleneb, et kas nuppu on vajutatud juba või ei ole vajutatud
    if ((state == 1) && (isTimeForAction(1000UL))) {
      digitalWrite(trafficYellowLight, HIGH);
      setPrevActionTime();
      setState(2);
    }

    // Traffic: GREEN ON,  pedestrial: RED STILL ON,  BUTTON LED: oleneb, et kas nuppu on vajutatud juba või ei ole vajutatud
    if ((state == 2) && (isTimeForAction(1000UL))) {
      digitalWrite(trafficRedLight, LOW);
      digitalWrite(trafficYellowLight, LOW);
      digitalWrite(trafficGreenLight, HIGH);
      setPrevActionTime();
      setState(8);
    }

    // Traffic: GREEN STILL ON,  pedestrial: RED STILL ON,    BUTTON LED: ON
    if ((state == 8) && (isWaitingToCross)) {
      setPrevActionTime();
      setState(3);
    }

    // Traffic: GREEN BLINKING,  pedestrial: RED STILL ON,    BUTTON LED: STILL ON
    if ((state == 3) && (isTimeForAction(3000UL)) && (isWaitingToCross)) {
      greenBlinkCurrentMillis = millis();

      if (greenCounter == 0) {
        digitalWrite(trafficGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 1;
      }

      if ((greenCounter == 1) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(trafficGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 2;
      }

      if ((greenCounter == 2) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(trafficGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 3;
      }

      if ((greenCounter == 3) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(trafficGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 0;
        setPrevActionTime();
        setState(4);
      }
    }

    // Traffic: YELLOW ON,   pedestrian: RED STILL ON,    BUTTON LED: STILL ON
    if ((state == 4) && (isTimeForAction(500UL))) {
      digitalWrite(trafficGreenLight, LOW);
      digitalWrite(trafficYellowLight, HIGH);
      setPrevActionTime();
      setState(5);
    }

    // Traffic: RED ON,   pedestrian: RED STILL ON,    BUTTON LED: STILL ON
    if ((state == 5) && (isTimeForAction(1000UL))) {
      digitalWrite(trafficYellowLight, LOW);
      digitalWrite(trafficRedLight, HIGH);
      setPrevActionTime();
      setState(6);
    }

    // Traffic: RED STILL ON,  pedestrian: GREEN ON,    BUTTON LED: OFF
    if ((state == 6) && (isTimeForAction(1000UL))) {
      digitalWrite(pedestrianRedLight, LOW);
      digitalWrite(pedestrianGreenLight, HIGH);
      digitalWrite(pedestrianBtnWhiteLight, LOW);
      setPrevActionTime();
      setState(7);
    }

    // Traffic: RED STILL ON,  pedestrian: GREEN BLINKING,    BUTTON LED: STILL OFF
    if ((state == 7) && (isTimeForAction(durationForGreenPedestrians))) {
      greenBlinkCurrentMillis = millis();
      
      if (greenCounter == 0) {
        digitalWrite(pedestrianGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 1;
      }

      if ((greenCounter == 1) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 2;
      }

      if ((greenCounter == 2) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 3;
      }

      if ((greenCounter == 3) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 4;
      }

      // Traffic: RED STILL ON,  pedestrian: GREEN OFF
      if ((greenCounter == 4) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 0;
        isWaitingToCross = false;
        setPrevActionTime();
        setState(0);
      }
    }
  }

  

  if (isAutoMode()) {
    currentTimeMillis = millis();

    if ((greenWaveDistance > 0) && ((greenWaveDistance != prevGreenWaveDistance) || (greenMode != prevGreenMode))) {
      isGreenWaveDelayDone = false;
      firstStateDuration = greenWaveDistance + 1000;
      prevGreenWaveDistance = greenWaveDistance;
    }

    if(isGreenWaveDelayDone) {
      firstStateDuration = 1000;
    }
    
    // Traffic: RED ON,   pedestrian: RED ON
    if (state == 0) {
      digitalWrite(trafficRedLight, HIGH);
      digitalWrite(pedestrianRedLight, HIGH);
      setPrevActionTime();
      setState(1);
    }

    // Traffic: RED STILL ON & YELLOW ON,  pedestrian: RED STILL ON
    if ((state == 1) && (isTimeForAction(firstStateDuration))) {
      isGreenWaveDelayDone = true;
      digitalWrite(trafficYellowLight, HIGH);
      setPrevActionTime();
      setState(2);
    }

    // Traffic: GREEN ON,  pedestrial: RED STILL ON
    if ((state == 2) && (isTimeForAction(1000UL))) {
      digitalWrite(trafficRedLight, LOW);
      digitalWrite(trafficYellowLight, LOW);
      digitalWrite(trafficGreenLight, HIGH);
      setPrevActionTime();
      setState(3);
    }
    
    if (state == 8) {
      setState(3);
    }

    // Traffic: GREEN BLINKING,  pedestrial: RED STILL ON
    if ((state == 3) && (isTimeForAction(durationForGreenCars))) {
      greenBlinkCurrentMillis = millis();
      
      if (greenCounter == 0) {
        digitalWrite(trafficGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 1;
      }

      if ((greenCounter == 1) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(trafficGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 2;
      }

      if ((greenCounter == 2) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(trafficGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 3;
      }

      if ((greenCounter == 3) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(trafficGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 0;
        setPrevActionTime();
        setState(4);
      }
    }

    // Traffic: YELLOW ON,   pedestrian: RED STILL ON
    if ((state == 4) && (isTimeForAction(500UL))) {
      digitalWrite(trafficGreenLight, LOW);
      digitalWrite(trafficYellowLight, HIGH);
      setPrevActionTime();
      setState(5);
    }

    // Traffic: RED ON,   pedestrian: RED STILL ON
    if ((state == 5) && (isTimeForAction(1000UL))) {
      digitalWrite(trafficYellowLight, LOW);
      digitalWrite(trafficRedLight, HIGH);
      setPrevActionTime();
      setState(6);
    }

    // Traffic: RED STILL ON,  pedestrian: GREEN ON
    if ((state == 6) && (isTimeForAction(1000UL))) {
      digitalWrite(pedestrianRedLight, LOW);
      digitalWrite(pedestrianGreenLight, HIGH);
      setPrevActionTime();
      setState(7);
    }

    // Traffic: RED STILL ON,  pedestrian: GREEN BLINKING
    if ((state == 7) && (isTimeForAction(durationForGreenPedestrians))) {
      greenBlinkCurrentMillis = millis();
      
      if (greenCounter == 0) {
        digitalWrite(pedestrianGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 1;
      }

      if ((greenCounter == 1) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 2;
      }

      if ((greenCounter == 2) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 3;
      }

      if ((greenCounter == 3) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, HIGH);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 4;
      }

      // (End of AUTO mode):
      // Traffic: RED STILL ON,  pedestrian: GREEN OFF
      if ((greenCounter == 4) && (greenBlinkCurrentMillis - greenBlinkPreviousMillis) >= blinkInterval) {
        digitalWrite(pedestrianGreenLight, LOW);
        greenBlinkPreviousMillis = greenBlinkCurrentMillis;
        greenCounter = 0;
        setPrevActionTime();
        setState(0);
      }
    }
  }
}



void turnLightsOff() {
  digitalWrite(pedestrianBtnWhiteLight, LOW);
  digitalWrite(pedestrianRedLight, LOW);
  digitalWrite(pedestrianGreenLight, LOW);
  digitalWrite(trafficRedLight, LOW);
  digitalWrite(trafficYellowLight, LOW);
  digitalWrite(trafficGreenLight, LOW);
}

bool isNightMode() {
  return cycleMode == "night";
}

bool isButtonMode() {
  return cycleMode == "button";
}

bool isAutoMode() {
  return cycleMode == "auto";
}

bool isGreenMode() {
  return ((greenMode == "left") || (greenMode == "right"));
}

bool wasNightModeUsed() {
  return (((previousCycleMode != "night") && (cycleMode == "night")) || ((previousCycleMode == "night") && (cycleMode != "night")));
}

bool isTimeForAction(unsigned long timeLimit) {
  return currentTimeMillis - prevTimeMillis >= timeLimit;
}

void setPrevActionTime() {
  prevTimeMillis = currentTimeMillis;
}
      
void setState(int stateNumber) {
  state = stateNumber;
}

long convertSecondsToMilliseconds(long durationInSeconds) {
  return durationInSeconds * 1000;
}

void printOutFetchedData() {
  Serial.println("Eelmine: " + previousCycleMode);
  Serial.print("Cycle Duration (millis): ");
  Serial.print(cycleDurationInMillis);
  Serial.println("\nCycle Mode: " + cycleMode + "\n");
}

void calcGreenDurations() {
  durationToBeDevided = cycleDurationInMillis - durationForTwoGroups;
  durationForGreenCars = durationToBeDevided * 0.6;
  durationForGreenPedestrians = durationToBeDevided * 0.4;
}

void connectAndFetchData() {
  if ((WiFiMulti.run() == WL_CONNECTED)) {
    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);
    client->setFingerprint(fingerprint);
    HTTPClient https;

    if (https.begin(*client, "https://asjade-internet-marilii-default-rtdb.europe-west1.firebasedatabase.app/traffic.json")) {
      https.addHeader("Content-Type", "application/json");
      
      int httpCode = https.GET();

      // httpCode will be negative on error
      if (httpCode > 0) {
        // file found at server
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = https.getString();
          const char* json = payload.c_str();
          DynamicJsonDocument doc(2048);
          deserializeJson(doc, json);

          previousCycleMode = cycleMode;

          String cycle = doc["anneliN"]["cycle"];
          cycleMode = cycle;

          prevGreenMode = greenMode;
          
          String greenDirection = doc["green"]["direction"];
          greenMode = greenDirection;

          if (doc["green"]["direction"] == "off") {
            long durationInSeconds = doc["anneliN"]["duration"];
            cycleDurationInMillis = convertSecondsToMilliseconds(durationInSeconds);
            greenWaveDistance = 0;
          } else {
            String greenCycle = doc["green"]["cycle"];
            cycleMode = greenCycle;
            
            long durationInSeconds = doc["green"]["duration"];
            cycleDurationInMillis = convertSecondsToMilliseconds(durationInSeconds);

            if (doc["green"]["direction"] == "right") {
              long firstDistance = doc["distances"]["1-2"];
              long secondDistance = doc["distances"]["2-3"];
              long correctDistance = firstDistance + secondDistance;
              greenWaveDistance = convertSecondsToMilliseconds(correctDistance);
            } else {
              long correctDistance = doc["distances"]["3-4"];
              greenWaveDistance = convertSecondsToMilliseconds(correctDistance);
            }
          }
        }
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }
      https.end();
    } else {
      Serial.printf("[HTTPS] Unable to connect\n");
    }
  } else {
    Serial.println("Can't connect to WiFi. Is your WiFi working?\n");
  }
}