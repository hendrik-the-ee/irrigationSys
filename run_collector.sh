#!/bin/bash
go build hydrobot/cmd/collector/main.go
mv main collector

./collector
