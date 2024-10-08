# Transaction Request Server

A transaction request server is an idea coined by [Link] Solana Pay. It is used as a component in the Solana Pay Protocol to deliver arbrirary transactions through the scanning of QR codes instead of simple token transfers

This is the transaction request server for the [Link] Solana Payments App. We decided to build a transaction request server for a few reasons:

1. Future proof
2. Seperation of logic
3. Reusablility, for example this transaction request server could also be used for something like dialect smart messages.

## Steps to Run

1. from solana-payments-app/ run 'yarn'
2. from solana-payments-app/apps/transaction-request-serverless from 'serverless deploy'

## Currently Supported Features

-   [x] Token Transfers
-   [ ] Token Swaps
-   [ ] NFT Minting
-   [ ] Compressed NFT Minting
-   [ ] Fungible Token Minting
-   [x] System Program Account Creation

## Usage

There is currently a single supported endpoint exposed by this app `/pay`

It it a post request that requires a body

```
{
    account: string // pubkey
}
```

There are also a number of required and optional query parameters

required

```
    receiver: string // pubkey
    sendingToken: string // pubkey
    receivingToken: string // pubkey
    feePayer: string // pubkey
    receivingAmount: string // number
    singleUseNewAcc: string // pubkey
    singleUsePayer: string // pubkey
    indexInputs: string // comma seperated list of strings
```

optional

```
    amountType: string // 'size' | 'quantity'
    transactionType: string // 'blockhash'
    createAta: bool
```

Here are their respective usages

**account** - this is the sender of the payment, this wallet address will be used as the debitor of the transaction
**receiver** - this is the receiver of the payment, this wallet address will be used as the creditor of the transaction
**sendingToken** - this is the token being debited from the sender of the payment
**receivingToken** - this is the token being credited to the receiver of the payment
**feePayer** - this is the fee payer of the payment, responsible for paying gas and rent on the transaction
**receivingAmount** - this is the amount of tokens being transfered in the payment, the receiver should receive this total amount
**amountType** - this is the type that describes the value of `receivingAmount`. a value of `size` results in the `receivingAmount` being used as whole token units. for example '10 USDC'. a value of `quantity` results in the `receivingAmount` being used as base token units. for example '0.000010 USDC'
**transactionType** - this is the type that describes the type of transaction to be created. currently the only type support is `blockhash` but in the future we will support `nonce` transactions and `lookup` transactions
**createAta** - this is used to determine if the transaction should create a new associated token account for the receiver of the payment if it doesn't already exist
**singleUseNewAcc** - this is used for as the public key for a system program create account instruction. it is useful if you want to insure only a single payment transaction fetched from this server could ever be submitted on chain. this helps prevent double spending bugs in your software
**singleUsePayer** - this is the wallet that is responsible for paying for the rent of the single use account
**indexInputs** - this is a comma seperated list of strings. for each value, a dererministic public key is derived from the input and added onto an instruction. it is useful for finding payment transactions on chain later
