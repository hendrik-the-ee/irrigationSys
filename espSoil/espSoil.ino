#include "Adafruit_seesaw.h"

#define pinLed 5    // GPIO pin

Adafruit_seesaw ss;
void setup() {
  pinMode(pinLed, OUTPUT);
  
  Serial.begin(115200);
  Serial.println("seesaw Soil Sensor example!");
  
  if (!ss.begin(0x36)) {
    Serial.println("ERROR! seesaw not found");
    while(1);
  } else {
    Serial.print("seesaw started! version: ");
    Serial.println(ss.getVersion(), HEX);
  }
}

void loop() {
  float tempC = ss.getTemp();
  uint16_t capread = ss.touchRead(0);

  digitalWrite(pinLed, HIGH);   // turn the LED on (HIGH is the voltage level)
  Serial.print("T="); Serial.print(tempC);
  Serial.print("*C, Cap="); Serial.println(capread);
  digitalWrite(pinLed, LOW);   // turn the LED on (HIGH is the voltage level)
  delay(2000);
  
}
