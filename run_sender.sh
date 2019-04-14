#!/bin/bash
go build hydrobot/cmd/sender/main.go
mv main sender

source app-env
./sender
