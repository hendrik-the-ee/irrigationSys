/*
 * The Irrigation System
 * 
 * This program makes soil moisture measurements for a DIY irrigation system.  Specifically, ot does the following:
 * 1. Connects via WiFi to a Raspberry Pi, 
 * 2. Measures soil moisture and temperature from an Adafruit SeeSaw sensor, 
 * 3. Transmits soil moisture and temperature to the Pi
 * 4. Goes to sleep for a specific period of time.
 * 
 * Hendrik, 4/14/2019
 * program memory (4/14): 900768 bytes.  506935 bytes compressed.
 */

// includes
#include <EEPROM.h>
#include "Adafruit_seesaw.h"
#include <WiFi.h>
#include "wifiStuff.h"
#include <HTTPClient.h>

// definitions
#define pinLed 5                      // GPIO pin
#define voltsIn A0
#define ESPID_EEPROM_ADDR 0           // address in EEPROM for ESP32 ID
#define EEPROM_SIZE 1
#define uS_TO_S_FACTOR 1000000        //Conversion factor for micro seconds to seconds

// global variables

uint16_t timeNow = millis();
uint16_t timeLed = 200;
Adafruit_seesaw ss;   // soil sensor
uint16_t loopCount = 0;
uint16_t loopCountMax = 20;
RTC_DATA_ATTR int bootCount = 0;
int timeToSleep = 5;   // seconds

void wifiSetup() {
  if (!ss.begin(0x36)) {
    Serial.println("ERROR! seesaw not found");
    while(1);
  } else {
    Serial.print("seesaw started! version: ");
    Serial.println(ss.getVersion(), HEX);
  } // (!ss.begin)

  WiFi.begin(wifiSsid, wifiPass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");  
} // void wifiSetup

void wifiSendData(String wifiDataToSend) {
  if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status
    HTTPClient http;
    http.begin(httpAddr);
    http.addHeader("Content-Type", "text/plain");

    int httpResponseCode = http.POST(String(wifiDataToSend));   //Send the actual POST request
    if(httpResponseCode>0){
      String timeToSleepString = http.getString();
      Serial.println("httpResponse=" + timeToSleepString);
      timeToSleep = timeToSleepString.toInt();      
    }else{
      Serial.println("HTTP POST Error");
    }  // httpResponseCode
    http.end();  //Free resources
  } // if(WiFi.status()
  else{
    Serial.println("Error in WiFi connection");
  } // if(WiFi.status())

  esp_sleep_enable_timer_wakeup(timeToSleep * uS_TO_S_FACTOR);
}  // void wifiSendData

void setup() {

  Serial.begin(115200);
  pinMode(pinLed, OUTPUT);

/*  if (espID == NULL) {
    Serial.println("Enter ESPID (value from 0 to 255): ");
    espID = Serial.read();
    EEPROM.write(ESPID_EEPROM_ADDR, espID);
  }else{
    Serial.println("ESPID=" + String(espID));
  }     // IF (espID)
*/

  bootCount++;
  wifiSetup();
}  // setup

void loop() {
  uint16_t timeDiff;
  uint16_t timeMillis = uint16_t(millis());
  const uint16_t timeSampleData = 2000; //milliseconds
  const uint16_t u16Max = 65535;
  uint16_t ssData;
  int testRead;
  const int espID = 1;
  const int sensorID = 1;
  
  String PostData = "{\"esp32_id\": \"esp32_000";
  String sensorType = "soilMoisture";

  // set value for timeDiff
  if ((timeMillis<timeSampleData) && ((u16Max-timeNow)<timeSampleData)) { // check for timeNow wrap around
    timeDiff = timeMillis + uint16_t(u16Max-timeNow);
  }
  else {                                  // no wraparound
    timeDiff = timeMillis - timeNow;
  } // if (timeMillis)
  
  if (timeDiff > timeSampleData)
  {
    loopCount++;

    // String stuff
    PostData.concat(espID);    PostData.concat("\", ");
    PostData.concat("\"sensor_id\": ");    PostData.concat(sensorID); PostData.concat(", ");
    PostData.concat("\"sensor_type\": "); PostData.concat("\"" + sensorType + "\", ");
    PostData.concat("\"temp\": ");  PostData.concat(ss.getTemp());    PostData.concat(", ");
    PostData.concat("\"moist\": "); PostData.concat(ss.touchRead(0)); PostData.concat(", ");
    PostData.concat("\"VoltsIn\": "); PostData.concat(analogRead(voltsIn));
    PostData.concat("}");
    wifiSendData(PostData);
    Serial.println(PostData);

    digitalWrite(pinLed, HIGH);   // turn the LED on (HIGH is the voltage level)
    timeNow = timeMillis;         // reset timer
  }
  else if ((digitalRead(pinLed)==1) && (timeDiff > timeLed))  // turn off LED
  {
    digitalWrite(pinLed, LOW);   // turn the LED on (HIGH is the voltage level)
  } // if (timeDiff)

  if (loopCount >= 1) {
      esp_deep_sleep_start();
  }
}  // loop
