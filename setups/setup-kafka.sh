#!/bin/sh

unzip kafka-docker-master.zip

cd kafka-docker-master

docker build -t kafka-docker .

