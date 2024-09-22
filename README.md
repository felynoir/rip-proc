# RIP Protocol
## Summary
RIP Protocol enables users to securely leave their digital legacy on the blockchain for their children. It has a magical feature—allowing only a specific function (in this case, machine learning for DNA similarity comparison) to operate on encrypted data, without exposing the actual data. We modified advanced cryptography, Multi-Input Functional Encryption from [fentec-project's gofe](https://github.com/fentec-project/gofe) and implemented it in Solidity to make this possible through smart contracts.
We chose to deploy on Sapphire, the world's first confidential EVM network, because it can securely generate random numbers for public/private key creation (and ofc securely contain them), which is necessary for our functional encryption algorithm. Moreover, Sapphire supports private transactions, making making it easy to import sensitive data onto the blockchain while keeping it confidential.

## Technical Detail
Functional Encryption is an advanced and novel concept in programmable cryptography. The intuition can be seen [here](https://en.wikipedia.org/wiki/Functional_encryption)

<img width="657" alt="Screenshot 2567-09-22 at 08 30 30" src="https://github.com/user-attachments/assets/32268981-ca78-4b1c-9f6c-0d5edf268902">

However, the example above only applies for single-input functional encryption, meaning that there is only one private parameter. In our protocol, we look closely at multi-input functional encryption
where it allows the operation of a specific function over multiple encrypted data (in this repo example, the encrypted DNA of both the guardian and the child)
Look for more info [here](https://eprint.iacr.org/2017/972.pdf)

## Future Improvement
### On Functional Encryption
Since it allows us to just encrypt data once, then we can fine-grained control what function we allow people to perform to our encrypted data by creating a new function key from the secret key with that function, we can 
start to explore the way to support more function besides inner-product that we used in this repo. Generally, it allows us into the era of flexibility of being able to really have control what people can do with your data

### On RIP Protocol
We can leverage other protocols that we wished to have enough time to do it here in EthGlobal Singapore, and many more as follows
- To make sure that the raw data that is used for being encrypted to put in publicly is legit, not just random garbage. We can leverage sign protocol to have hospital or relevant authority attest to our customized schema as "wallet address of user, wallet address of attester (hospital and such), and encrypted data from the health record (in this case). Our smart contract makes sure that besides computing the functional decryption to get the result of ML similarity algorithm of two DNAs of both a father and a child, it will also check if those encrypted datas are actually attested by relevant authority like hospital as well.

- We can leverage Noun since we believe in empowering people to think and perceive the world in a more fun and more curious way. We take pride in going out of comfort zone to try very under-explored technology like functional encryption.
Noun..
