#!/bin/bash
TARGET_USER=pi
TARGET_DIR=/home/pi/hydrobot
CC=arm-linux-musleabihf-gcc
COLLCTR_PATH=hydrobot/cmd/collector/main.go
SENDER_PATH=hydrobot/cmd/sender/main.go
FLAGS=

if [ "$1" == "" ]; then
    echo "Please provide host ip address"
    exit 1
else
    TARGET_HOST=$1
fi

echo "Building for Raspberry Pi..."
go get golang.org/x/sys/unix
env CC=$CC GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=1 go build -o collector --ldflags '--linkmode external -extldflags "-static"' $COLLCTR_PATH
env CC=$CC GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=1 go build -o sender --ldflags '--linkmode external -extldflags "-static"' $SENDER_PATH
echo "Done building..."

echo "Uploading to Raspberry Pi..."
scp -i ~/.ssh/id_rsa app-env $TARGET_USER@$TARGET_HOST:$TARGET_DIR/app-env
scp -i ~/.ssh/id_rsa creds.json $TARGET_USER@$TARGET_HOST:$TARGET_DIR/creds.json
scp -i ~/.ssh/id_rsa collector $TARGET_USER@$TARGET_HOST:$TARGET_DIR/collector
scp -i ~/.ssh/id_rsa sender $TARGET_USER@$TARGET_HOST:$TARGET_DIR/sender
