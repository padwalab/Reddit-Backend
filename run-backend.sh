# author Abhijeet Padwal [ padwalab@gmail.com / abhijeet.padwal@sjsu.edu ]

#!/bin/sh

if [ $# -eq 0 ]; then
    docker-compose up --build --no-deps reddit_db reddit_mongo reddit_backend
fi
if [ $1 == "kafka" ]; then
    docker-compose up --build 
fi