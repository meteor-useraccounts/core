#!/bin/bash

for folder in */
do
    echo
    echo "-----------------------------------"
    echo
    cd $folder
    pwd
    rm -rf .build*
    rm versions.json
    cd ..
done