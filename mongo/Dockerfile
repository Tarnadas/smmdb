FROM mongo:3.4

COPY db /home/dump

CMD mongorestore --drop --uri mongodb://mongodb /home/dump