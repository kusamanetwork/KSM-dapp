# How to claim KSMA

The Kusama network is Polkadot's R&D network where dangerous experiments are performed and anything can happen :imp:. 

In order to align Kusama with the existing DOT holders and community, if you are a DOT allocation holder you can claim the equivalent amount of Kusama tokens (ticker: KSMA). This guide will walk you through the process of claiming KSMA both before and after the Kusama genesis block.

## Claiming before Kusama genesis

Claiming before the Kusama genesis block means that you will start the network with the balance already in your account. It is really easy to do this using the KSMA claims DApp.

### Creating a Kusama account

You will need a Kusama account to claim the KSMA. There are a few ways you can create one. For most users, we recommend using the [Polkadot UI](https://polkadot.js.org/apps/#/explorer) since it will allow you to store your encrypted keyfile locally.

> NOTICE: Unfortunately at this time Kusama and Substrate chains do not have hardware wallet support using the Ledger or Trezor products. Hopefully soon this will change!

Another option you may consider using are `subkey` commandline utility which will allow you to be extra secure and generate your key on an air-gapped device. A couple other options include using Enzyme in-browser wallet (like MetaMask) or the Polkawallet mobile wallet.

#### Using Polkadot UI

#### Using `subkey`

### Claim your KSMA with MyCrypto

MyCrypto is the option you will use if you have stored the keys to your DOT allocation on a hardware device like a Ledger Nano S or a Trezor.

> NOTICE: It is much more secure to download and use the MyCrypto app locally, You can always find the most up-to-date releases of the desktop app on their [releases page](https://github.com/MyCryptoHQ/MyCrypto/releases).

Once you've downloaded the MyCrypto app and run it locally (run it on an airgapped computer for maximum security), head over to the [claiming DApp]() and enter your Kusama address and select if you are claiming for an amendment (if this sounds strange to you, it means you should NOT click the checkbox). The DApp will generate some transaction data.

Head back to the MyCrypto application and click on the Contract tab. Choose the Custom selection for the contract and copy the ABI and address of the Claims contract. The mainnet Claims contract address is 0xXXXXXXXXXXX. Click `Access`.

Select the `claim` function and enter the address of the Ethereum account that holds the balance of DOT allocation for which you would like to claim KSMA.

Next enter in the information that the claims DApp outputted for you. For the curious ones, this is the hex representation of your Kusama public key which is how your chosen address is derived.

Unlock your wallet using your preferred method and click "Sign and Send."

You can click on the link to view your transaction on Etherscan, when the transaction is mined to the network then you are finished! When the Kusama network starts you will already have the balance of KSMA in your Kusama address.
