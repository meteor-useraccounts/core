#!/bin/bash

for folder in */
do
    echo
    echo "-----------------------------------"
    echo
    cd $folder
    pwd
    git push
    cd ..
done