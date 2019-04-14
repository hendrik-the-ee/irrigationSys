// includes
#include "Adafruit_seesaw.h"
#include <WiFi.h>
#include "wifiStuff.h"
#include <HTTPClient.h>

// definitions
#define pinLed 5    // GPIO pin
#define uS_TO_S_FACTOR 1000000  //Conversion factor for micro seconds to seconds
//#define TIME_TO_SLEEP  10        //Time ESP32 will go to sleep (in seconds)

// global variables
uint16_t timeNow = millis();
uint16_t timeLed = 200;
Adafruit_seesaw ss;   // soil sensor
uint16_t loopCount = 0;
uint16_t loopCountMax = 20;
RTC_DATA_ATTR int bootCount = 0;
int timeToSleep = 5;   // seconds

void print_wakeup_reason(){
  esp_sleep_wakeup_cause_t wakeup_reason;
  wakeup_reason = esp_sleep_get_wakeup_cause();
  switch(wakeup_reason)
  {
    case 1  : Serial.println("Wakeup caused by external signal using RTC_IO"); break;
    case 2  : Serial.println("Wakeup caused by external signal using RTC_CNTL"); break;
    case 3  : Serial.println("Wakeup caused by timer"); break;
    case 4  : Serial.println("Wakeup caused by touchpad"); break;
    case 5  : Serial.println("Wakeup caused by ULP program"); break;
    default : Serial.println("Wakeup was not caused by deep sleep"); break;
  }
}

uint16_t ssReadAndPrint() {
// typical valuers for capRead.  300's = air.  600's = loamy, somewhat moist soil.  1000's = hand.
  float tempC = ss.getTemp();
  uint16_t capRead = ss.touchRead(0);
  String waterOrNot;

  if (capRead < 750){
    timeLed = 1500;     // water me!
    waterOrNot = ".\t\t Water Plant!!";
  }
  else {
    timeLed = 200;      // do not water!
    waterOrNot = "\t\t Don't water Plant!!!";
  }
  Serial.println("loopCount=" + String(loopCount) + ", T=" + String(tempC) + "C, Cap=" + String(capRead) + waterOrNot);
  return capRead;
}  // ssReadAndPrint

void wifiSetup() {
  if (!ss.begin(0x36)) {
    Serial.println("ERROR! seesaw not found");
    while(1);
  } else {
    Serial.print("seesaw started! version: ");
    Serial.println(ss.getVersion(), HEX);
  }
  WiFi.begin(wifiSsid, wifiPass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");  
} // wifiSetup

void wifiSendData(uint16_t wifiDataToSend) {
  if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status
    HTTPClient http;
    http.begin(httpAddr);
    http.addHeader("Content-Type", "text/plain");

    int httpResponseCode = http.POST(String(wifiDataToSend));   //Send the actual POST request
    if(httpResponseCode>0){
      String timeToSleepString = http.getString();
      timeToSleep = timeToSleepString.toInt();      
//      Serial.println("httpResponseCode=" + String(httpResponseCode) + ", timeToSleep=" + String(timeToSleep));
      esp_sleep_enable_timer_wakeup(timeToSleep * uS_TO_S_FACTOR);
    }else{
      Serial.println("HTTP POST Error");
    }  // httpResponseCode
    http.end();  //Free resources
  } // if(WiFi.status()
  else{
    Serial.println("Error in WiFi connection");
  }
}  // wifiSendData

void setup() {
  pinMode(pinLed, OUTPUT);
  
  Serial.begin(115200);
  bootCount++;
//  Serial.println("BootCount=" + String(bootCount));
//  print_wakeup_reason();  //Print the wakeup reason for ESP32

  wifiSetup();

}  // setup

void loop() {
  uint16_t timeDiff;
  uint16_t timeMillis = uint16_t(millis());
  const uint16_t timeSoilSample = 2000; //milliseconds
  const uint16_t u16Max = 65535;
  const uint16_t timeWifi = 5000; // milliseconds
  uint16_t ssData;

  // set value for timeDiff
  if ((timeMillis<timeSoilSample) && ((u16Max-timeNow)<timeSoilSample)) { // check for timeNow just about to wrap around, and millis() already did
    timeDiff = timeMillis + uint16_t(u16Max-timeNow);
  }
  else {
    timeDiff = timeMillis - timeNow;
  }
  if (timeDiff > timeSoilSample)
  {
    loopCount++;
    ssData = ssReadAndPrint();             // do soil sensor stuff
    wifiSendData(ssData);
    digitalWrite(pinLed, HIGH);   // turn the LED on (HIGH is the voltage level)
    timeNow = timeMillis;         // reset timer
  }
  else if ((digitalRead(pinLed)==1) && (timeDiff > timeLed))  // turn off LED
  {
    digitalWrite(pinLed, LOW);   // turn the LED on (HIGH is the voltage level)
  } // timeDiff

  if (loopCount >= 1) {
      esp_deep_sleep_start();
  }
}  // loop
