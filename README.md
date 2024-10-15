# PWChat

The PWChat is a small chat-application in order to get to play around with progressive web-apps. The focus is mainly on the development of the behaviour as PWA instead of the chat-application itself.

The backend for this chat-application was already provided and is quite simple.

## Frontend (Plain HTML + CSS + JS)

The frontend should be implemented by basic webtechnology and no frameworks are allowed.

Following features should be provided:

-   **Show a list of all ongoing conversationt** - make use of the user-query-param
-   **Open an existing chat** by choosing it from the list including its entire messaging history
-   **Sending a new message** in a chat

For the progressive web-app part following aspect are most important:

-   **Cache of images** via service-worker (only have to be fetched once)
-   Build an **app shell** and make it available for **offline usage**
-   Make app **installable**, **provide installation button** and **screenshots** for mobile and desktop devices
-   Show the **count of new messages as Badge**
-   Show current **network state**
-   Use the **localStorage** to store which chat has been opened last, so reopening starts where the user has left off
-   Provide a **context menu** to reset the last chat information
-   Store Users in an **IndexedDB** so that they can be read even if there is no internet connectivity
-   Lazily store the conversations in **IndexedDB** and load them from there so chats can be shown when offline
-   Implement **shared worker** to show the current date/time
-   Use a **dedicated worker** for start-time of the client in the browser

Not part of the implementation needs to be login and registration, writing messages when offline, updating displayed messages when new one is sent and starting a new conversation.

## Backend (Express)

The given backend delivers following endpoints:

-   [GET] /users - Gets all users
-   [GET] /conversations - Gets all conversations
-   [GET] /conversations/:id/messages - Gets all messages of a single conversation
-   [POST] /conversations/:id/messages - Send a message into a conversation
-   [GET] /messageEvent - Register to server-side-events

The backend-project also features a postman-collection which can be imported to test out the endpoints.

To start the backend following command can be executed:

`npm start`
