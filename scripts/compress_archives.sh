#!/usr/bin/env bash

if [[ $# -ne 1 ]]; then
    echo "please provide archive filepath"
    exit 2
fi

ARCHIVE_FILEPATH=$1
NOW=$(date +"%m-%d-%Y")
NAME=archives_$NOW.tar

tar -cvf $NAME $ARCHIVE_FILEPATH/archive.*.csv
rm archive.*.csv
