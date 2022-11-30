FROM debian
RUN apt-get update
RUN apt-get install nodejs -y
RUN apt-get install npm -y
COPY . /server/
CMD ['node' '/server/app.js']

