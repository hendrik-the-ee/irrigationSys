#!/bin/bash
echo "starting sender"
cd /home/pi/hydrobot/
. app-env
./sender
echo "completed sender run"
