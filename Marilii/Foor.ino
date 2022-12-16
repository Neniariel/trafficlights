#include <Arduino.h>
#include <ArduinoJson.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ESP8266HTTPClient.h>

#include <WiFiClientSecureBearSSL.h>
const uint8_t fingerprint[20] = {0x5A, 0x12, 0xCA, 0xB5, 0x35, 0x69, 0x04, 0x81, 0xE6, 0x1F, 0x8A, 0x3D, 0xBA, 0xF1, 0x87, 0x1A, 0x24, 0xA5, 0x40, 0x64};

ESP8266WiFiMulti WiFiMulti;

boolean firstCycle = true;
boolean buttonWait = false;
int stage = 8;
String cycle = "night";
String prevCycle = "night";
unsigned long duration = 20000;
unsigned long startMillis;
unsigned long currentMillis;
unsigned long buttonStartMillis = 0;
unsigned long buttonCurrentMillis;
long diffDelay;
long dbDelay;
long lightDelay;
long totalTime = 0;
long prevTime = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(D0, INPUT);
  
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);
  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);
  pinMode(D7, OUTPUT);

  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP("TLU", "");
}

void loop() {
  int httpCode;
  int pedestrianButton = D0;
  int pedestrianRed = D1;
  int pedestrianGreen = D2;
  int pedestrianLight = D3;
  int carRed = D5;
  int carYellow = D6;
  int carGreen = D7;
  long elapsed;
  long buttonElapsed;
  
  // wait for WiFi connection
  if (WiFiMulti.run() == WL_CONNECTED) {
    std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);

    client->setFingerprint(fingerprint);
    
    HTTPClient https;

    if (https.begin(*client, "https://asjade-internet-marilii-default-rtdb.europe-west1.firebasedatabase.app/traffic.json")) {  // HTTPS

      https.addHeader("Content-Type", "application/json");
      // start connection and send HTTP header
      httpCode = https.GET();
  
      // httpCode will be negative on error
      if (httpCode > 0) {
        // file found at server
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
          String payload = https.getString();
          const char* json = payload.c_str();
          DynamicJsonDocument doc(2048);
          deserializeJson(doc, json);
          prevCycle = cycle;
          dbDelay = 0;

          if (doc["green"]["direction"] == "off") {
            duration = doc["mariliiN"]["duration"];
            String DBCycle = doc["mariliiN"]["cycle"];
            cycle = DBCycle;
            dbDelay = 0;  
          } else {
            duration = doc["green"]["duration"];
            String DBCycle = doc["green"]["cycle"];
            cycle = DBCycle;

            if (doc["green"]["direction"] == "left") {
              int dist1 = doc["distances"]["1-2"];
              int dist2 = doc["distances"]["2-3"];
              int dist3 = doc["distances"]["3-4"];
              dbDelay = (dist1 + dist2 + dist3);
            }
          }
          
          duration = duration * 1000 - 8000 - 1000; // Shorten duration by an extra second to account for slowness
          dbDelay = dbDelay * 1000;
        }
      } else {
        Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
      }
      https.end();
    } else {
      Serial.printf("[HTTPS] Unable to connect\n");
    }
  }

  if (prevCycle == "night" && cycle != "night") {
    stage = 2;
  }

  if (cycle == "button") {
    if (!buttonWait) {
      if (digitalRead(pedestrianButton) == 1 && (stage == 2 || stage == 3 || stage == 4 || stage == 5)) {
        buttonWait = true;
        firstCycle = true;
        digitalWrite(pedestrianLight, HIGH);
      } else {
        if (stage != 1 && stage != 2 && stage != 3) {
          stage = 4;
          firstCycle = true;
        }
      }
    } else {
      buttonCurrentMillis = millis();
      if (firstCycle) {
        buttonStartMillis = totalTime;
        firstCycle = false;
        
        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }
      buttonElapsed = buttonCurrentMillis - buttonStartMillis;
      
      switch(stage) {
        case 0:
          digitalWrite(pedestrianLight, LOW);
          buttonWait = false;
          if (buttonElapsed >= duration * 0.4 + lightDelay) {
            totalTime += buttonElapsed;
            buttonElapsed = 0;
            stage = 1;
            firstCycle = true;
          }
          break;
        case 4:
          if (buttonElapsed >= 3000 + lightDelay) { // After pedestrian button is pressed, wait 3s before carGreen starts blinking
            totalTime += buttonElapsed;
            buttonElapsed = 0;
            lightDelay = 0;
            stage = 5;
            firstCycle = true;
          }
          break;
        default:
          break;
      }
    }
  } else {
    digitalWrite(pedestrianLight, LOW);
  }
  
  switch (stage) {
    case 0:
      digitalWrite(carRed, HIGH);
      digitalWrite(carYellow, LOW);
      digitalWrite(carGreen, LOW);
      digitalWrite(pedestrianRed, LOW);
      digitalWrite(pedestrianGreen, HIGH);
      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= duration * 0.4 + lightDelay) {
        totalTime += elapsed;
        firstCycle = true;
        
        if (cycle != "night") {
          stage = 1;
        } else {
          stage = 8;
        }
      }
      break;
    case 1:
      if (firstCycle) {
        digitalWrite(carRed, HIGH);
        digitalWrite(carYellow, LOW);
        digitalWrite(carGreen, LOW);
        digitalWrite(pedestrianRed, LOW);
        digitalWrite(pedestrianGreen, HIGH);
      }

      digitalWrite(pedestrianGreen, !digitalRead(pedestrianGreen));

      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= 2000 + lightDelay) {  
        totalTime += elapsed;      
        // Move on
        firstCycle = true;
        lightDelay = 0;
      
        if (cycle != "night") {
          stage = 2;
        } else {
          stage = 8;
        }
      }
      break;
    case 2:
      digitalWrite(carRed, HIGH);
      digitalWrite(carYellow, LOW);
      digitalWrite(carGreen, LOW);
      digitalWrite(pedestrianRed, HIGH);
      digitalWrite(pedestrianGreen, LOW);
      currentMillis = millis();
      
      if (firstCycle) {
        // Serial.println(totalTime - prevTime);
        prevTime = totalTime;
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= 1000 + lightDelay) {
        totalTime += elapsed;
        firstCycle = true;
        lightDelay = 0;
        
        if (cycle != "night") {
          stage = 3;
        } else {
          stage = 8;
        }
      }
      break;
    case 3:
      digitalWrite(carRed, HIGH);
      digitalWrite(carYellow, HIGH);
      digitalWrite(carGreen, LOW);
      digitalWrite(pedestrianRed, HIGH);
      digitalWrite(pedestrianGreen, LOW);
      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= 1000 + lightDelay) {
        totalTime += elapsed;
        firstCycle = true;
        lightDelay = 0;
        
        if (cycle != "night") {
          stage = 4;
        } else {
          stage = 8;
        }
      }
      break;
    case 4:
      digitalWrite(carRed, LOW);
      digitalWrite(carYellow, LOW);
      digitalWrite(carGreen, HIGH);
      digitalWrite(pedestrianRed, HIGH);
      digitalWrite(pedestrianGreen, LOW);
      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= duration * 0.6 + lightDelay) {
        totalTime += elapsed;
        firstCycle = true;
        lightDelay = 0;
        
        if (cycle != "night") {
          if (cycle != "button" || cycle == "button" && buttonWait) {
            stage = 5;
          } else {
            stage = 4;
          }
        } else {
          stage = 8;
        }
      }
      break;
    case 5:
      if (firstCycle) {
        digitalWrite(carRed, LOW);
        digitalWrite(carYellow, LOW);
        digitalWrite(carGreen, HIGH);
        digitalWrite(pedestrianRed, HIGH);
        digitalWrite(pedestrianGreen, LOW);
      }

      digitalWrite(carGreen, !digitalRead(carGreen));

      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;
      
      if (elapsed >= 2000 + lightDelay) {
        totalTime += elapsed;
        // Move on
        firstCycle = true;
        lightDelay = 0;
      
        if (cycle != "night") {
          stage = 6;
        } else {
          stage = 8;
        }
      }
      break;
    case 6:
      digitalWrite(carRed, LOW);
      digitalWrite(carYellow, HIGH);
      digitalWrite(carGreen, LOW);
      digitalWrite(pedestrianRed, HIGH);
      digitalWrite(pedestrianGreen, LOW);
      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= 1000 + lightDelay) {
        totalTime += elapsed;
        firstCycle = true;
        lightDelay = 0;
        
        if (cycle != "night") {
          stage = 7;
        } else {
          stage = 8;
        }
      }
      break;
    case 7:
      digitalWrite(carRed, HIGH);
      digitalWrite(carYellow, LOW);
      digitalWrite(carGreen, LOW);
      digitalWrite(pedestrianRed, HIGH);
      digitalWrite(pedestrianGreen, LOW);
      
      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }

      elapsed = currentMillis - startMillis;

      if (elapsed >= 1000 + lightDelay) {
        totalTime += elapsed;
        digitalWrite(pedestrianRed, LOW);
        digitalWrite(pedestrianGreen, HIGH);

        firstCycle = true;
        lightDelay = 0;
        
        if (cycle != "night") {
          stage = 0;
        } else {
          stage = 8;
        }
      }
      break;
    case 8:
      digitalWrite(carRed, LOW);
      digitalWrite(carYellow, LOW);
      digitalWrite(carGreen, LOW);
      digitalWrite(pedestrianRed, LOW);
      digitalWrite(pedestrianGreen, LOW);
      
      currentMillis = millis();
      
      if (firstCycle) {
        startMillis = totalTime;
        firstCycle = false;

        if (dbDelay != diffDelay) {
          diffDelay = dbDelay;
          lightDelay = diffDelay;
        }
      }
      
      elapsed = currentMillis - startMillis;

      if (elapsed >= 1000 + lightDelay) {
        totalTime += elapsed;
        digitalWrite(carYellow, !digitalRead(carYellow));
        firstCycle = true;
        lightDelay = 0;
      }
      break;
    default:
      stage = 8;
      break;
  }
}
