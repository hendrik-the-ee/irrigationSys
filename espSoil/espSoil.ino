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
#define espID 3              // unique ID for every device
#define sensorID 1           // unique ID for every sensor type
#define pinLed 5             // GPIO pin
#define seesawPwrPin 4       // GPIO pin provides switchable power for the seesaw to extend battery life
#define battAdcPin 33        // must be an ADC2 pin or will not work due to conflict with wifi.h!!
#define ESPID_EEPROM_ADDR 0  // address in EEPROM for ESP32 ID
#define EEPROM_SIZE 1
#define uS_TO_S_FACTOR 1000000        //Conversion factor for micro seconds to seconds

// global variables
uint16_t timeNow = millis();
const int timeToSleep = 5;   // seconds
const int adcLoopCountMax = 5;
const int wifiRetryCountMax = 10;
Adafruit_seesaw ss;   // soil sensor
RTC_DATA_ATTR int bootCount = 0;
bool seeSawExists = 0;

bool seeSawSetup() {
  if (!ss.begin(0x36)) {
    Serial.println("ERROR! seesaw not found");
    return 0;
  } else {
    Serial.print("seesaw started! version: ");
    Serial.println(ss.getVersion(), HEX);
    return 1;
  } // (!ss.begin)
} // void seeSawSetup
  

void wifiSetup() {
  int wifiRetryCount = 0;
  
  WiFi.begin(wifiSsid, wifiPass);
  while (WiFi.status() != WL_CONNECTED && wifiRetryCount < wifiRetryCountMax) {
//    if (wifiRetryCount < wifiRetryCountMax) {
    delay(300);
    wifiRetryCount++;
    Serial.print("WiFi connect attempt ");  Serial.println(wifiRetryCount);
//    } // if (wifiRetryCount)
  } // while    

  if (wifiRetryCount < wifiRetryCountMax)
    Serial.println("Connected to the WiFi network");

} // void wifiSetup


bool wifiSendData(String wifiDataToSend) {
  bool wifiSendError;
  
  if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status
    HTTPClient http;
    http.begin(httpAddr);
    http.addHeader("Content-Type", "text/plain");

    int httpResponseCode = http.POST(String(wifiDataToSend));   //Send the actual POST request
    if(httpResponseCode>0){
//      String timeToSleepString = http.getString();
//      Serial.println("httpResponse=" + timeToSleepString);
//      timeToSleep = timeToSleepString.toInt();
      wifiSendError = 0;
    }else{
      Serial.println("HTTP POST Error");
      wifiSendError = 1;
    }  // httpResponseCode
    http.end();  //Free resources
  } // if(WiFi.status()
  else{
    Serial.println("Error in WiFi connection");
    wifiSendError = 1;
  } // if(WiFi.status())
  return wifiSendError;
}  // void wifiSendData


void setup() {
  pinMode(pinLed, OUTPUT);
  pinMode(seesawPwrPin, OUTPUT);
  pinMode(battAdcPin, INPUT);

  digitalWrite(seesawPwrPin, HIGH);   // turn on the seesaw
  delay(50);
  Serial.begin(115200);  
/*  if (espID == NULL) {
    Serial.println("Enter ESPID (value from 0 to 255): ");
    espID = Serial.read();
    EEPROM.write(ESPID_EEPROM_ADDR, espID);
  }else{
    Serial.println("ESPID=" + String(espID));
  }     // IF (espID)
*/
  esp_sleep_enable_timer_wakeup(timeToSleep * uS_TO_S_FACTOR);
  Serial.print("esp_sleep_enable_timer_wakeup: time=");  Serial.println(timeToSleep);
  seeSawExists = seeSawSetup();
  bootCount++;
  wifiSetup();
}  // setup


void loop() {
  uint16_t timeDiff;
  uint16_t timeMillis = uint16_t(millis());
  uint16_t soilMoisture;
  uint16_t soilTemp;
  const uint16_t timeSampleData = 200; //milliseconds
  const uint16_t timeLed = 50;
  const uint16_t u16Max = 65535;
  uint16_t vBattAdc; // = analogRead(battAdcPin);   // need averaging and to space these out.  10x probably best.
  uint16_t ssData;
  int testRead;
  bool wifiSendError = 0;
  bool sampledSent = 0;
  
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
    for (int adcLoopCount=0; adcLoopCount<adcLoopCountMax; adcLoopCount++) {
      vBattAdc += analogRead(battAdcPin);   // need averaging and to space these out.  10x probably best.
      delay(50);
    }  //for (adcLoopCount)

    if (seeSawExists) {
      soilMoisture = ss.touchRead(0);
      soilTemp = ss.getTemp();
    }
    else {
      soilMoisture = 0;
      soilTemp = 0;
    }

    sampledSent = 1;
    // String stuff (with all sensor reads baked in)
    PostData.concat(espID);    PostData.concat("\", ");
    PostData.concat("\"sensor_id\": ");    PostData.concat(sensorID); PostData.concat(", ");
    PostData.concat("\"sensor_type\": "); PostData.concat("\"" + sensorType + "\", ");
    PostData.concat("\"temp\": ");  PostData.concat(String(ss.getTemp(),1));    PostData.concat(", ");
    PostData.concat("\"moist\": "); PostData.concat(soilMoisture); PostData.concat(", ");
//    PostData.concat("\"moist\": "); PostData.concat(ss.touchRead(0)); PostData.concat(", ");
    PostData.concat("\"volts_in\": "); PostData.concat(String(vBattAdc*3.3/(2048*adcLoopCountMax),3));
    PostData.concat("}");
    wifiSendError = wifiSendData(PostData);

    Serial.println(PostData);

    digitalWrite(pinLed, HIGH);   // turn the LED on (HIGH is the voltage level)
    timeNow = timeMillis;         // reset timer
  } // if (timeDiff)
  else if ((digitalRead(pinLed)==1) && (timeDiff > timeLed))  // turn off LED
  {
    digitalWrite(pinLed, LOW);   // turn the LED on (HIGH is the voltage level)
  } // if (timeDiff)

  if (sampledSent) {
    digitalWrite(seesawPwrPin, LOW);   // turn on the seesaw
    Serial.print("sleep for "); Serial.print(timeToSleep); Serial.println("s");
    esp_deep_sleep_start();
  }
}  // loop
