# Simple Multiplayer Chess

![Logo](simple-chess-logo.png?raw=true "Simple Chess Logo")

This project consists of a client and a server for a chess application using React for the frontend and Colyseus for the multiplayer server functionality.

![Screenshot](simple-chess-ss.png?raw=true "Simple Chess Screenshot")

## Structure

- `/client`: Contains the frontend React application.
- `/server`: Contains the Colyseus server for handling multiplayer game logic.

## Prerequisites

Before you begin, ensure you have installed Node.js (version 18 or higher) on your machine. You can check your Node version with `node -v`.

## Setup

### Installing Dependencies

First, clone the repository and navigate into the project directory:

```bash
git clone https://github.com/honeydreamssoftwares/simple_chess
cd simple_chess
```

#### Client

To set up the client, run the following commands:

```bash
cd client
npm install
```

#### Server

To set up the server, run the following commands:

```bash
cd server
npm install
```

## Running the Application

### Client

To run the client application, use the following command:

```bash
cd client
npm run dev
```

This will start the Vite development server, and you should be able to access the application via `http://localhost:3000`.

### Server

To run the server, use the following command:

```bash
cd server
npm start
```

This will compile the TypeScript files and start the Colyseus server.

## Building for Production

### Client

To build the client application for production, run:

```bash
cd client
npm run build
```

The production files will be placed in the `/client/dist` directory.

### Server

To build the server for production, first clean the existing build and then compile:

```bash
cd server
npm run build
```

## Deployment

Refer to the GitHub Actions workflow in `.github/workflows/deploy.yml` for instructions on deploying the client and server to production environments.

## Contributing

Contributions to this project are welcome! Please create an issue or open a pull request with your proposed changes.

## License

This project is unlicensed and free for use.

## Bugs and Issues

Please report any bugs or issues you find on the GitHub issues page: [GitHub Issues](https://github.com/colyseus/create-colyseus/issues).

## More Information

For more details, you can visit the [project homepage](https://github.com/colyseus/create-colyseus#readme).
