# NOTES FOR NEXT TIME

-   use JSON for faster prototyping
-   identify in the beginning what data will be replicated on the server.
-   Create a network abstraction to parse network data safely and to clearly separate concerns
-   Any entity/mob that is collidable will need a unique id and be queryable from an object or map for quick collision checks.
-   Maybe create a factory function which uses generics so i have both generic code, but the factory produces an instance with specific typings for the particular project

# LEARNINGS

-   console.logging will lag firefox browsers, even when dev tools is closed. Do NOT console unnecessarily

## Information to send to server (client => server)

-   controls (eg: wasd keys, spacebar, angle of shooting,target of shooting)

## Information to send to client (server => client)

-   player id (first message)
-   rendering information (every tick)

# ASSUMPTIONS

This project is for prototyping, hence there will be a few assumptions made to speed up development:

-   assume player will only send valid data to the server
