

A PWA for the given chat server backend has to be implemented.

It should be able to:

    Show a list of all ongoing conversations
    (can be retrieved via the /conversations endpoint, which has a user query parameter to filter conversations by the participating users)
    Open an existing chat by choosing it from the list including its entire messaging history
    (can be retrieved via the /conversations/:id/messages endpoint)
    Sending a new message in a chat
    (using a POST request to /conversations/:id/messages)

The PWA should specifically implement the features as follows:

    Cache the images of users using a service worker so that they are only retrieved from the server once.
    Build an app shell and make it available for offline usage.
    Make the app installable and provide an installation button and screenshots for mobile and desktop devices
    Show the count of new messages as a Badge
    The backend provides this information by a Server Sent Event. Use /messageEvent as event source and listen to the newMessageCount event.
    Show the user the current network state (on-/offline)
    Use the localStorage, to store which chat has been opened last, so that reopening starts where the user has left off.
    Provide a context menu to reset the "last chat information" of the local storage.
    Store users in an IndexedDB database, so that they can be read even if there is no internet connectivity.
    Lazily store the conversations in IndexedDB and load them from there, if there is no internet connection, so that at least old messages that have already been loaded can be read offline.
    Implement a Shared Worker to show the current date/time
    Use a Dedicated Worker to show the time since the client was started in the browser

It is not allowed to use any framework (i.e. this assignment has to be implemented using plain JavaScript), since we want you to learn all the basics about PWAs.

The result will not be a fully functional chat application, therefore the following features are out of scope and do not have to be implemented:

    Login and registration, i.e. the application just opens and a user of your choice (daniel, manuel, guenther or franz) is already logged in
    Writing messages while offline
    Automatically updating the displayed messages when a new one is sent by other participants
    Starting a completely new conversation

The result of the peer review is the grade of this assignment, if the student being graded has also reviewed the solution of a peer, otherwise the student will not get any points for this assignment at all.

Each week a randomly chosen student has to present the implementation progress in regards to the course content from the previous week.
