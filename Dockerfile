FROM mhart/alpine-node
COPY . /app
CMD node /app/main.js
EXPOSE  5000
