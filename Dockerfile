FROM mhart/alpine-node
COPY . /app
CMD node /app/app.js
EXPOSE  5000
