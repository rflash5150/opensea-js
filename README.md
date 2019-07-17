![OpenSea.js Logo](https://storage.googleapis.com/opensea-static/opensea-js-logo.png "OpenSea.js Logo")

# OpenSea.js <!-- omit in toc -->

[![https://badges.frapsoft.com/os/mit/mit.svg?v=102](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://opensource.org/licenses/MIT)
<!-- [![npm](https://img.shields.io/npm/v/wyvern-js.svg)](https://www.npmjs.com/package/wyvern-js) [![npm](https://img.shields.io/npm/dt/wyvern-js.svg)](https://www.npmjs.com/package/wyvern-js) -->

A JavaScript library for crypto-native ecommerce: buying, selling, and bidding on any cryptogood. With OpenSea.js, you can easily build your own native marketplace for your non-fungible tokens, or NFTs. These can be ERC-721 or ERC-1155 items. You don't have to deploy your own smart contracts or backend orderbooks.

Published on [GitHub](https://github.com/ProjectOpenSea/opensea-js) and [npm](https://www.npmjs.com/package/opensea-js)

- [Synopsis](#Synopsis)
- [Installation](#Installation)
- [Getting Started](#Getting-Started)
  - [Making Offers](#Making-Offers)
    - [Bidding on Multiple Assets](#Bidding-on-Multiple-Assets)
  - [Making Auctions](#Making-Auctions)
  - [Running Crowdsales](#Running-Crowdsales)
  - [Fetching Orders](#Fetching-Orders)
  - [Buying Items](#Buying-Items)
  - [Accepting Offers](#Accepting-Offers)
  - [Transferring Items or Coins (Gifting)](#Transferring-Items-or-Coins-Gifting)
- [Affiliate Program](#Affiliate-Program)
  - [Referring Listings](#Referring-Listings)
  - [Custom Referral Bounties](#Custom-Referral-Bounties)
- [Advanced](#Advanced)
  - [Bulk Transfers](#Bulk-Transfers)
  - [Creating Bundles](#Creating-Bundles)
  - [Using ERC-20 Tokens Instead of Ether](#Using-ERC-20-Tokens-Instead-of-Ether)
  - [Private Auctions](#Private-Auctions)
  - [Airdrops and Email Whitelisting](#Airdrops-and-Email-Whitelisting)
  - [Sharing Sale Fees with OpenSea](#Sharing-Sale-Fees-with-OpenSea)
  - [Listening to Events](#Listening-to-Events)
- [Learning More](#Learning-More)
  - [Example Code](#Example-Code)
- [Development Information](#Development-Information)

## Synopsis

This is the JavaScript SDK for [OpenSea](https://opensea.io), the largest marketplace for crypto collectibles. It allows developers to access the official orderbook, filter it, create buy orders (**offers**), create sell orders (**auctions**), create collections of assets to sell at once (**bundles**), and complete trades programmatically.

For the first time, you can build a *cryptocommerce dapp*.

You get started by instantiating your own seaport. Then you can create orders off-chain or fulfill orders on-chain, and listen to events (like `ApproveAllAssets` or `WrapEth`) in the process.

Happy seafaring! ⛵️

## Installation

We recommend switching to Node.js version 8.11 to make sure common crypto dependencies work. Execute `nvm use`, if you have Node Version Manager.

Then, in your project, run:
```bash
npm install --save opensea-js
```

Install [web3](https://github.com/ethereum/web3.js) too if you haven't already.

If you run into an error while building the dependencies and you're on a Mac, run this:

```bash
xcode-select --install # Install Command Line Tools if you haven't already.
sudo xcode-select --switch /Library/Developer/CommandLineTools # Enable command line tools
sudo npm explore npm -g -- npm install node-gyp@latest # (Optional) update node-gyp
```

## Getting Started

To get started, create a new OpenSeaJS client, called an OpenSeaPort 🚢, using your Web3 provider:

```JavaScript
import * as Web3 from 'web3'
import { OpenSeaPort, Network } from 'opensea-js'

// This example provider won't let you make transactions, only read-only calls:
const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main
})
```

**NOTE:** Using the sample Infura provider above won't let you authorize transactions, which are needed when approving and trading assets and currency. To make transactions, you need a provider with a private key or mnemonic set.

In a browser with web3 or an extension like [MetaMask](https://metamask.io/) or [Dapper](http://www.meetdapper.com/), you can use `window.ethereum` (or `window.web3.currentProvider` for legacy mobile web3 browsers) to access the native provider. In a Node.js script, you can follow [this example](https://github.com/ProjectOpenSea/opensea-creatures/blob/master/scripts/sell.js) to use a custom mnemonic.

### Making Offers

Then, you can do this to make an offer on an asset:

```JavaScript
// Token ID and smart contract address for a non-fungible token:
const { tokenId, tokenAddress } = YOUR_ASSET
// The offerer's wallet address:
const accountAddress = "0x1234..."

const offer = await seaport.createBuyOrder({
  tokenId,
  tokenAddress,
  accountAddress,
  // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
  startAmount: 1.2,
  // Read below for other options
})
```

When you make an offer on an item owned by an OpenSea user, **that user will automatically get an email notifying them with the offer amount**, if it's above their desired threshold.

#### Bidding on Multiple Assets

You can also make an offer on a bundle of assets. This could also be used for creating a bounty for whoever can acquire a list of items. Here's how you do it:

```JavaScript
const assets = YOUR_ASSETS
const offer = await seaport.createBundleBuyOrder({
  tokenIds: assets.map(a => a.tokenId),
  tokenAddresses: assets.map(a => a.tokenAddress),
  accountAddress,
  startAmount: 2.4,
  // Optional expiration time for the order, in Unix time (seconds):
  expirationTime: (Date.now() / 1000 + 60 * 60 * 24) // One day from now
})
```

When you bid on multiple assets, an email will be sent to the owner if a bundle exists on OpenSea that contains the assets. In the future, OpenSea will send emails to multiple owners if the assets aren't all owned by the same wallet.

### Making Auctions

To sell an asset, call `createSellOrder`. You can do a fixed-price sale, where `startAmount` is equal to `endAmount`, or a declining [Dutch auction](https://en.wikipedia.org/wiki/Dutch_auction), where `endAmount` is lower and the price declines until `expirationTime` is hit:

```JavaScript
// Expire this auction one day from now.
// Note that we convert from the JavaScript timestamp (milliseconds):
const expirationTime = (Date.now() / 1000 + 60 * 60 * 24)

const auction = await seaport.createSellOrder({
  tokenId,
  tokenAddress,
  accountAddress,
  startAmount: 3,
  // If `endAmount` is specified, the order will decline in value to that amount until `expirationTime`. Otherwise, it's a fixed-price order:
  endAmount: 0.1,
  expirationTime
})
```

The units for `startAmount` and `endAmount` are Ether, ETH. If you want to specify another ERC-20 token to use, see [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether).

See [Listening to Events](#listening-to-events) to respond to the setup transactions that occur the first time a user sells an item.

### Running Crowdsales

You can now sell items to users **without having to pay gas to mint them**!

To create a presale or crowdsale and create batches of sell orders for a single asset factory, first follow the [tutorial](https://docs.opensea.io/docs/opensea-initial-item-sale-tutorial) for creating your crowdsale contract.

Then call `createFactorySellOrders` with your factory contract address and asset option identifier, and set `numberOfOrders` to the number of assets you'd like to let users buy and mint:

```JavaScript
// Expire these auctions one day from now
const expirationTime = (Date.now() / 1000 + 60 * 60 * 24)

const sellOrders = await seaport.createFactorySellOrders({
  assetId: ASSET_OPTION_ID,
  factoryAddress: FACTORY_CONTRACT_ADDRESS,
  accountAddress,
  startAmount,
  endAmount,
  expirationTime,
  // Will create 100 sell orders in parallel batches of 10, to speed things up:
  numberOfOrders: 100
})
```

Here's an [example script](https://github.com/ProjectOpenSea/opensea-creatures/blob/master/scripts/sell.js) you can use to mint items.

**NOTE:** If `numberOfOrders` is greater than 5, we will automatically batch them in groups of 5 so you can post orders in parallel. Requires an `apiKey` to be set during seaport initialization in order to not be throttled by the API.

Games using this method include [Coins & Steel](https://opensea.io/assets/coins&steelfounderssale) and a couple in stealth :) If you have questions or want support, contact us at contact@opensea.io (or in [Discord](https://discord.gg/ga8EJbv)).

### Fetching Orders

To retrieve a list of offers and auction on an asset, you can use an instance of the `OpenSeaAPI` exposed on the client. Parameters passed into API filter objects are underscored instead of camel-cased, similar to the main [OpenSea API parameters](https://docs.opensea.io/v1.0/reference):

```JavaScript
import { OrderSide } from 'opensea-js/lib/types'

// Get offers (bids), a.k.a. orders where `side == 0`
const { orders, count } = await seaport.api.getOrders({
  asset_contract_address: tokenAddress,
  token_id: token_id,
  side: OrderSide.Buy
})

// Get page 2 of all auctions, a.k.a. orders where `side == 1`
const { orders, count } = await seaport.api.getOrders({
  asset_contract_address: tokenAddress,
  token_id: token_id,
  side: OrderSide.Sell
}, 2)
```

Note that the listing price of an asset is equal to the `currentPrice` of the **lowest valid sell order** on the asset. Users can lower their listing price without invalidating previous sell orders, so all get shipped down until they're cancelled or one is fulfilled.

To learn more about signatures, makers, takers, listingTime vs createdTime and other kinds of order terminology, please read the [**Terminology Section**](https://docs.opensea.io/reference#terminology) of the API Docs.

The available API filters for the orders endpoint is documented in the `OrderJSON` interface below, but see the main [API Docs](https://docs.opensea.io/reference#reference-getting-started) for a playground, along with more up-to-date and detailed explanantions.

```TypeScript
/**
   * Attrs used by orderbook to make queries easier
   * More to come soon!
   */
  maker?: string, // Address of the order's creator
  taker?: string, // The null address if anyone is allowed to take the order
  side?: OrderSide, // 0 for offers, 1 for auctions
  owner?: string, // Address of owner of the order's asset
  sale_kind?: SaleKind, // 0 for fixed-price, 1 for Dutch auctions
  asset_contract_address?: string, // Contract address for order's asset
  token_id?: number | string,
  token_ids?: Array<number | string>,
  listed_after?: number | string, // This means listing_time > value in seconds
  listed_before?: number | string, // This means listing_time <= value in seconds

  // For pagination
  limit?: number,
  offset?: number,
```

### Buying Items

To buy an item , you need to **fulfill a sell order**. To do that, it's just one call:

```JavaScript
const order = await seaport.api.getOrder({ side: OrderSide.Sell, ... })
const accountAddress = "0x..." // The buyer's wallet address, also the taker
await this.props.seaport.fulfillOrder({ order, accountAddress })
```

If the order is a sell order (`order.side === OrderSide.Sell`), the taker is the *buyer* and this will prompt the buyer to pay for the item(s).

### Accepting Offers

Similar to fulfilling sell orders above, you need to fulfill a buy order on an item you own to receive the tokens in the offer.

```JavaScript
const order = await seaport.api.getOrder({ side: OrderSide.Buy, ... })
const accountAddress = "0x..." // The owner's wallet address, also the taker
await this.props.seaport.fulfillOrder({ order, accountAddress })
```

If the order is a buy order (`order.side === OrderSide.Buy`), then the taker is the *owner* and this will prompt the owner to exchange their item(s) for whatever is being offered in return. See [Listening to Events](#listening-to-events) below to respond to the setup transactions that occur the first time a user accepts a bid.

### Transferring Items or Coins (Gifting)

A handy feature in OpenSea.js is the ability to transfer any supported asset (fungible or non-fungible tokens) in one line of JavaScript.

To transfer an ERC-721 asset or an ERC-1155 asset, it's just one call:

```JavaScript

const transactionHash = await seaport.transfer({
  asset: { tokenId, tokenAddress },
  fromAddress, // Must own the asset
  toAddress
})
```

For fungible ERC-1155 assets, you can set `schemaName` to "ERC1155" and pass a `quantity` in to transfer multiple at once:

```JavaScript

const transactionHash = await seaport.transfer({
  asset: { tokenId, tokenAddress },
  fromAddress, // Must own the asset
  toAddress,
  quantity: 2,
  schemaName: "ERC1155"
})
```

To transfer fungible assets without token IDs, like ERC20 tokens, you can pass in a `FungibleToken` as the `asset`, set `schemaName` to "ERC20", and include `quantity` to indicate how many:

```JavaScript

const transactionHash = await seaport.transfer({
  asset: { tokenAddress },
  fromAddress, // Must own the tokens
  toAddress,
  schemaName: "ERC20"
  quantity: 2.6
})
```

For more information, check out the documentation for WyvernSchemas on https://projectopensea.github.io/opensea-js/.

## Affiliate Program

New in version 0.4, OpenSea.js allows to you easily create an affiliate program in just a few lines of JavaScript! It's the crypto-equivalent of bounty hunting 💰

You can use this to **win at least 1%** of the sale price of any listing, both for assets and bundles. You can also allow users to win bounties by referring your items for sale.

### Referring Listings

You can instantly create an affiliate program for your assets by just passing in one more parameter when fulfilling orders! Whenever someone refers a sale or the acceptance of an offer, you can add a `referrerAddress` to give their wallet credit:

```JavaScript
const referrerAddress = "0x..." // The referrer's wallet address
await this.props.seaport.fulfillOrder({ order, accountAddress, referrerAddress })
```

This works for buying assets and bundles, along with accepting bids.

OpenSea will send the referrer an email congradulating them, along with **1%** of the item's sale price.

### Custom Referral Bounties

Sellers can customize the bounties they add to their items when listing them for sale. By default, OpenSea will pay referrers 1% and sellers pay them nothing, but sellers can increase this up to the full OpenSea fee (currently 2.5% for most assets) for both assets and bundles:

```JavaScript
// Price the Genesis CryptoKitty at 100 ETH
const startAmount = 100
// Reward referrers with 10% of the final sale price,
// or 10 ETH in this case
const extraBountyPercent = 10
// The final bounty will be 10% + 1% from OpenSea, or 11 ETH!

const auction = await seaport.createSellOrder({
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d", // CryptoKitties
  tokenId: "1", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount,
  extraBountyBasisPoints: extraBountyPercent * 100
})
```

**NOTE:** The final bounty in the example above will be 10% from the seller plus 1% from OpenSea, or 11 ETH in total!

Developers can request to increase the OpenSea fee to allow for higher bounties - by default, it's capped at 2.5%. If you have any questions, contact us at contact@opensea.io (or in [Discord](https://discord.gg/ga8EJbv)), or join the program at https://opensea.io/account#referrals.

## Advanced

Interested in making bundling items together or making bids in different ERC-20 tokens? OpenSea.js can help with that.

### Bulk Transfers

A handy feature in OpenSea.js is the ability to transfer multiple items at once in a single transaction. This works by grouping together as many `transferFrom` calls as the Ethereum gas limit allows, which is usually under 30 items, for most item contracts.

To make a bulk transfer, it's just one call:

```JavaScript
const assets: Array<{tokenId: string; tokenAddress: string}> = [...]

const transactionHash = await seaport.transferAll({
  assets,
  fromAddress, // Must own all the assets
  toAddress
})
```

This will automatically approve the assets for trading and confirm the transaction for sending them.

### Creating Bundles

You can also create bundles of assets to sell at the same time! If the owner has approved all the assets in the bundle already, only a signature is needed to create it.

To make a bundle, it's just one call:

```JavaScript
const assets: Array<{tokenId: string; tokenAddress: string}> = [...]

const bundle = await seaport.createBundleSellOrder({
  bundleName, bundleDescription, bundleExternalLink,
  assets, accountAddress, startAmount, endAmount,
  expirationTime, paymentTokenAddress
})
```

The parameters `bundleDescription`, `bundleExternalLink`, and `expirationTime` are optional, and `endAmount` can equal `startAmount`, similar to the normal `createSellOrder` functionality.

The parameter `paymentTokenAddress` is the address of the ERC-20 token to accept in return. If it's `undefined` or `null`, the amount is assumed to be in Ether.

Wait what, you can use other currencies than ETH?

### Using ERC-20 Tokens Instead of Ether

**New in version 0.3:** now you can make auctions and offers in whatever ERC-20 token you want! Just specify the token's contract address as the `paymentTokenAddress` when creating the order.

Here's an example of listing the Genesis CryptoKitty for $100! No more needing to worry about the exchange rate:

```JavaScript
// Token address for the DAI stablecoin, which is pegged to $1 USD
const paymentTokenAddress = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"

// The units for `startAmount` and `endAmount` are now in DAI, so $100 USD
const auction = await seaport.createSellOrder({
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d", // CryptoKitties
  tokenId: "1", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 100,
  paymentTokenAddress
})
```

You can use `getFungibleTokens` to search for tokens by symbol name. And you can even list all orders for a specific ERC-20 token by querying the API:

```JavaScript
const token = await seaport.getFungibleTokens({ symbol: 'MANA'})[0]

const order = await seaport.api.getOrders({
  side: OrderSide.Sell,
  payment_token_address: token.address
})
```

**Fun note:** all ERC-20 tokens are allowed! This means you can create crazy offers on crypto collectibles **using your own ERC-20 token**. However, opensea.io will only display offers and auctions in ERC-20 tokens that it knows about, optimizing the user experience of order takers. Orders made with the following tokens will be shown on OpenSea for the near future:

* MANA, Decentraland's currency: https://etherscan.io/token/0x0f5d2fb29fb7d3cfee444a200298f468908cc942 
* DAI, Maker's stablecoin, pegged to $1 USD: https://etherscan.io/token/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359

### Private Auctions

Now you can make auctions and listings that can only be fulfilled by an address or email of your choosing. This allows you to negotiate a price in some channel and sell for your chosen price on OpenSea, **without having to trust that the counterparty will abide by your terms!**

Here's an example of listing a Decentraland parcel for 10 ETH with a specific buyer address allowed to take it. No more needing to worry about whether they'll give you enough back!

```JavaScript
// Address allowed to buy from you
const buyerAddress = "0x123..."

const listing = await seaport.createSellOrder({
  tokenAddress: "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d", // Decentraland
  tokenId: "115792089237316195423570985008687907832853042650384256231655107562007036952461", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 10,
  buyerAddress
})
```

### Airdrops and Email Whitelisting

These work similarly to [Private Auctions](#private-auctions). Just create a private sell order targeted to a specific email. The buyer will have to verify that email to fulfill the order. For example,

```JavaScript
// Email allowed to buy from you
const buyerEmail = "captain@byer.com"

const listing = await seaport.createSellOrder({
  tokenAddress: "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d", // Decentraland
  tokenId: "115792089237316195423570985008687907832853042650384256231655107562007036952461", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 10,
  buyerEmail
})
```


### Sharing Sale Fees with OpenSea

We share fees for successful sales with game developers, relayers, and affiliates using the OpenSea orderbook. Developers can customize the fee amount to apply to  buyers and/or sellers.

See [Affiliate Program](#affiliate-program) above for how to register referrers for sales.

More information will appear here when our redesigned affiliate program is ready. In the meantime, contact us at contact@opensea.io (or in [Discord](https://discord.gg/ga8EJbv)), or use our legacy affiliate program at https://opensea.io/account#referrals.

### Listening to Events

Events are fired whenever transactions or orders are being created, and when transactions return receipts from recently mined blocks on the Ethereum blockchain.

Our recommendation is that you "forward" OpenSea events to your own store or state management system. Here's an example of doing that with a Redux action:

```JavaScript
import { EventType } from 'opensea-js'
import * as ActionTypes from './index'
import { openSeaPort } from '../globalSingletons'

// ...

handleSeaportEvents() {
  return async function(dispatch, getState) {
    openSeaPort.addListener(EventType.TransactionCreated, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.SET_PENDING_TRANSACTION_HASH, hash: transactionHash })
    })
    openSeaPort.addListener(EventType.TransactionConfirmed, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      // Only reset your exchange UI if we're finishing an order fulfillment or cancellation
      if (event == EventType.MatchOrders || event == EventType.CancelOrder) {
        dispatch({ type: ActionTypes.RESET_EXCHANGE })
      }
    })
    openSeaPort.addListener(EventType.TransactionDenied, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaPort.addListener(EventType.TransactionFailed, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaPort.addListener(EventType.InitializeAccount, ({ accountAddress }) => {
      console.info({ accountAddress })
      dispatch({ type: ActionTypes.INITIALIZE_PROXY })
    })
    openSeaPort.addListener(EventType.WrapEth, ({ accountAddress, amount }) => {
      console.info({ accountAddress, amount })
      dispatch({ type: ActionTypes.WRAP_ETH })
    })
    openSeaPort.addListener(EventType.UnwrapWeth, ({ accountAddress, amount }) => {
      console.info({ accountAddress, amount })
      dispatch({ type: ActionTypes.UNWRAP_WETH })
    })
    openSeaPort.addListener(EventType.ApproveCurrency, ({ accountAddress, tokenAddress }) => {
      console.info({ accountAddress, tokenAddress })
      dispatch({ type: ActionTypes.APPROVE_WETH })
    })
    openSeaPort.addListener(EventType.ApproveAllAssets, ({ accountAddress, proxyAddress, tokenAddress }) => {
      console.info({ accountAddress, proxyAddress, tokenAddress })
      dispatch({ type: ActionTypes.APPROVE_ALL_ASSETS })
    })
    openSeaPort.addListener(EventType.ApproveAsset, ({ accountAddress, proxyAddress, tokenAddress, tokenId }) => {
      console.info({ accountAddress, proxyAddress, tokenAddress, tokenId })
      dispatch({ type: ActionTypes.APPROVE_ASSET })
    })
    openSeaPort.addListener(EventType.CreateOrder, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.CREATE_ORDER })
    })
    openSeaPort.addListener(EventType.OrderDenied, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaPort.addListener(EventType.MatchOrders, ({ buy, sell, accountAddress }) => {
      console.info({ buy, sell, accountAddress })
      dispatch({ type: ActionTypes.FULFILL_ORDER })
    })
    openSeaPort.addListener(EventType.CancelOrder, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.CANCEL_ORDER })
    })
  }
}
```

To remove all listeners and start over, just call `seaport.removeAllListeners()`.

## Learning More

Auto-generated documentation for each export is available [here](https://projectopensea.github.io/opensea-js/).

If you need extra help, support is free! Contact the OpenSea devs. They're available every day on [Discord](https://discord.gg/XjwWYgU) in the `#developers` channel.

### Example Code

Check out the [Ship's Log](https://github.com/ProjectOpenSea/ships-log), built with the SDK, which shows the recent orders in the OpenSea orderbook.

You can view a live demo [here](https://ships-log.herokuapp.com/)! Also check out the [Mythereum marketplace](https://mythereum.io/marketplace), which is entirely powered by OpenSea.js.

## Development Information

**Setup**

[Node >= v8.11.2](https://nodejs.org/en/) required.

Before any development, install the required NPM dependencies:

```bash
npm install
```

And install TypeScript if you haven't already:

```bash
npm install -g tslint typescript
```

**Build**

Then, lint and build the library into the `lib` directory:

```bash
npm run build
```

Or run the tests:
```bash
npm test
```

Note that the tests require access to both Infura and the OpenSea API. The timeout is adjustable via the `test` script in `package.json`.

**Generate Documentation**

Generate html docs, also available for browsing [here](https://projectopensea.github.io/opensea-js/):
```bash
npm run docsHtml
```

Or generate markdown docs available for browsing on git repos:
```bash
npm run docsMarkdown
```

Due to a markdown theme typescript issue, `docs` just generates html docs right now:
```bash
npm run docs
```

**Contributing**

Contributions welcome! Please use GitHub issues for suggestions/concerns - if you prefer to express your intentions in code, feel free to submit a pull request.
