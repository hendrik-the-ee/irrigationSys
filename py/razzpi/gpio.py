import RPi.GPIO as GPIO

def initialize_gpio(pin):
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(pin, GPIO.OUT)

def set_pin_high(pin):
    GPIO.output(pin, 1)

def set_pin_low(pin):
    GPIO.output(pin, 0)

# resets all GPIO ports used
def cleanup_gpio():
    GPIO.cleanup()
