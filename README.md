# Hide and Seek API | BACKEND

Hide and Seek API using sockets.

### Hide and Seek | Game

[https://github.com/Lspacedev/hide-and-seek](https://github.com/Lspacedev/hide-and-seek)

## Prerequisites

- Nodejs
- Express
- MongoDb
- Sockets.io

## Installation

1. Clone the repository

```bash
git@github.com:Lspacedev/hide-and-seek-api.git
```

2. Navigate to the project folder

```bash
cd hide-and-seek-api
```

3.  Install all dependencies

```bash
npm install
```

4. Create an env file and add the following:

```bash
PORT="Specify port"
MONGO_URI_PROD="Database url or localhost"
```

5. Run the project

```bash
node index
```

## Usage

1. The server should run on PORT 8000, unless a port is specified.
2. Use http://localhost:8000, to test the API on Postman or any other tool.

## Sockets:

API is built using a Node Express server, with MongoDb as a database.
API uses sockets.io, to send and receive game data.

- position-update: update general player pposition.
- plays-update: update game plays.
- seeker-coords-update: update seeker coords.
- game-status-update: update game status.
- hider-update: update hider.
- seeker-update: update seeker.

#### Game Router:

- Create game.
- Join game.
- Delete game.

Endpoints

```python
    1. POST /api/games/create
        Inputs: name, role

    2.1 POST /api/games/join
            Inputs: code
    3. DELETE /api/games/delete

```

## Tech Stack

- NodeJs
- Express
- MongoDb
- Sockets.io
