#!/bin/bash

for folder in */
do
    echo
    echo "-----------------------------------"
    echo
    cd $folder
    pwd
    git status
    cd ..
done