# NOTES FOR NEXT TIME

-   use JSON for faster prototyping
-   identify in the beginning what data will be replicated on the server.
-   Create a network abstraction to parse network data safely and to clearly separate concerns
-   Any entity/mob that is collidable will need a unique id and be queryable from an object or map for quick collision checks.
-   Maybe create a factory function which uses generics so i have both generic code, but the factory produces an instance with specific typings for the particular project

# Discovered issues

-	in commit a3fc6bce28190d9c8b6 (though it exists b4 that probably), found that firefox SOMETIMES gets stuttering character movement... This does not occur in chrome. Refresh page to get chance it might go away. idk what causes it. occurs 50% of time. tested in private mode
-	stutters were caused due to server and client having and offset in their game ticks. The server was sending the data then the client was receiving it SOMETIMES a bit too offset from when the data was sent (with variance), hence the stutters 

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
