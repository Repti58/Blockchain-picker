# Etherscan API service

## Description

Application for receiving transactions from the Ethereum blockchain.

```1.``` At intervals of 1 minute, it receives transaction data from blocks and stores it in the database.
When restarting, it starts from where it left off before. It will collect until it reaches the last block in the blockchain.

```2.``` Upon request, the application finds the address with the largest balance change (Eth) in the selected block range


## Preparing
The application requires PostgreSQL to be installed.
You can download it here
https://www.postgresql.org/download/

#### Clone project:

```
git clone https://github.com/Repti58/Etherscan_API_service.git
```

#### Create .env file in the project directory: <br>
```
DATABASE_URL="postgresql://<username>:<password>@localhost:<port>/<db-name>?schema=public"
```
\<username>, \<password> and \<port> you specified during installation PostgreSQL<br>
\<db-name> - you can choose any database name now

## Installation

```
npm install
```
## Database initializing

```
npx prisma migrate dev --name init
```

## Running the app

```
npm start
```

## Usage
The application collects data in the background.<br>
To get the address with the largest balance change (Eth), make a request to http://localhost:3000/api/maxchange

## Settings
Optionally you can change the values of these variables in the config.ts file: <br><br>
```START_BLOCK``` - initial block for data collection (default: 17583000)<br>
```RANGE``` - range to search for the address with the largest balance change (default: 100)

## Stay in touch

- Author - [Ilya Eliseev](https://repti58.github.io/Portfolio)

