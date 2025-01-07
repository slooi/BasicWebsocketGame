# NOTES FOR NEXT TIME

-   use JSON for faster prototyping
-   identify in the beginning what data will be replicated on the server.
-   Create a network abstraction to parse network data safely and to clearly separate concerns

# LEARNINGS
-	console.logging will lag firefox browsers. Do NOT console unnecessarily

## Information to send to server (client => server)

-   controls (eg: wasd keys, spacebar, angle of shooting,target of shooting)

## Information to send to client (server => client)

-   player id (first message)
-   rendering information (every tick)

# ASSUMPTIONS

This project is for prototyping, hence there will be a few assumptions made to speed up development:

-   assume player will only send valid data to the server
