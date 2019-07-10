# Secure Validator Setup

Last year we started to see a number of projects moving from PoW to PoS, which creates a whole new industry for running a staking business. In some sense, running a validator is like operating a cryptocurrency exchange because the underlying staked asset could be potentially worth more than few millions, so as a node operator you have to increase the security level of your validator and have a robust network architecture to make sure that the value at stake is not at risk of being lost. There are many different ways to architect your network infrastructure. The goal of running a validator is to not be slashed and the two common slashing situations are server downtime and equivocation (double signing). It really depends on what level of security you need, and encourages everyone to come up with your own design to avoid being hacked in the same way. Without further ado, we would first go through some existing validator architecture design and then look into the different areas each individually.

### Existing approaches (Cosmos, Tezos, etc)

We are focusing on the design of the network architecture in this section, no matter what kind of validators you are trying to run, it basically has a quite similar network design, so we would take Cosmos as a reference. 

_TODO_IMG_
The simplest approach would be to just have a firewall behind the validator that means the public can know the IP address of your validator. The disadvantages of this setup are that validators have always a possibility to go down, so when your node has an outage or is unreachable, it could cause the validator to be slashed. Another problem is that it does not have DDoS resistance which could easily be attacked. You can read more about Sentry node architecture [here](#Sentry-Node-Architecture).


_TODO_IMG_
The second approach would be to separate the network architecture into two layers, first having sentry nodes face the Internet that hides the validator entirely to the public and then the validator would be sitting in the private network with a firewall only accessible by the "sentry" nodes. This approach is an effective way to mitigate the DDoS attack by deploying multiple sentry nodes on different cloud environments but it still has the availability problem when the validator is down. It leads us to the third approach with the support of High Availability (HA). 

_TODO_IMG_
While the third approach would be adding the HA feature by deploying one more validator so that even though one of your validators goes down, there still has another validator can replace that position.

Of course, you can also add private sentry nodes in the middle layer to separate between the public sentry nodes and validators to have another layer of security protection. 

Besides that, there are some approaches to improve the signing key management and making it unavailable to potential intrusions in the validator servers, including Hardware Security Modules (HSM) (see [here](https://cosmos.network/docs/cosmos-hub/validators/validator-faq.html#technical-requirements) for Cosmos' suggested list of of HSMs that support ed25519). Cosmos also introduced a Key Management System (KMS) which have a unified API to support validators that manage their key from different sources like HSM and have double signing protection. It is recommended to host the KMS into another machine to have a better security and risk management.

Few things also worth to remember, ensuring each part of the components does not have a single point of failure......

There is a great article about [Cosmos Hub Architecture](https://iqlusion.blog/a-look-inside-our-validator-architecture) written by Tony Arcieri and Shella Stephens.


### Sentry Node Architecture

The idea is brought up by a post in the [Cosmos forum](https://forum.cosmos.network/t/sentry-node-architecture-overview/454). The idea behind setting up a sentry node architecture is to mitigate the DDoS attack by running multiple full nodes on different cloud providers, and making the sentry nodes the only way to talk to the validator. The validator is secured  behind a firewall or private network. 

The reason to run on the cloud is because of scalability. That said, there is another solution to mitigate DDoS attack, we would encourage everyone to build up their own design.

### High Availability

A validator node must be up-and-running 24/7 with as close to possible to 100% uptime. If a validator at some point becomes unreachable, then it would cause a portion of that validator's stake to be slashed. 

By setting up HA could make your validator more robust than a single validator, which means even though one of your validators is failed to connect, you still have another to participate in the validation process.

Below are two examples of high availability set-up:

#### Active - Standby
_TODO_IMG_
Imagine there are two validators, one is active and the other one would be on standby (failover). We can keep track of the heartbeat of the active one, in case there is a problem, the standby will take place immediately. It is important to make sure these two are configured in the same way. Whatever you changed in the active, it has to be also same with the standby.

#### Active - Active
_TODO_IMG_
Imagine we add a load balancer to connect these two validators, and it has an algorithm to decide which validator to execute it. It may use round-robin or others, but it should really careful to make sure that would not double signing because two validators are running simultaneously with the same validator key.

Choose either ways is enitrely depends on what you want to achieve.

_TODO_REFERENCE_LINKS_


#### Setting up a HA on GCG/AWS
*Multiple clouds connections is complex
https://cloud.google.com/solutions/automated-network-deployment-multicloud
https://cloud.google.com/files/CloudVPNGuide-UsingCloudVPNwithAmazonWebServices.pdf

### Hardware Security Module (HSM)

[HSM](https://en.wikipedia.org/wiki/Hardware_security_module) is a hardware component for storing your keys inside the secure element that is tamper-proof, which is never exposed to the file system of your machine during the signing that makes the attacker extremely hard to extract it. If your validator stores the secret keys in plain-text format on the same machine, your keys will be easily exposed when your validator is hacked, the attacker can do double signing to cause your validator to be slashed, so it is important to find a hardware component that is dedicated to store your keys.

Currently, there are few types of HSM available in the market. [YubiHSM2](https://www.yubico.com/products/yubihsm/) is the most widely used in Cosmos validators because of supporting Ed25519 curve . Validators can also use CloudHSM like [AWS](https://aws.amazon.com/cloudhsm/?nc1=h_ls) or [GCP](https://cloud.google.com/hsm/?hl=en) to store your keys, however, you need to check whether the curve is available or not, for example, because Ed25519 curve is newer and unsupported by all existing CloudHSMs. That said, Validators are managing worth millions dollars of assets, storing your keys on CloudHSM is not recommended because all you trust is the solution provider, so take it seriously when you decided to set up a secure validator.

Comment from https://www.ethermat.com/:
* HSM based validation is not the only secure solution. We use a custom remote signing sever, which is similarly secure. If you want to prove that your setup is really secure, get audited from a 3rd party and publish the results.

#### "Hacking" HSM PEM keys for Tezos

https://blog.polychainlabs.com/tezos/2019/05/28/encoding-tezos-ec-keys.html

^ Something similar could be done for sr25519.

### Monitoring Tools
- [Telemetry](https://github.com/paritytech/substrate-telemetry)
It grabs your node details including the version you are running, block height, CPU & memory usage, block propagation Time, etc.    

- [Grafana](https://grafana.com)
It has an alert, query, visualization and monitoring features for analyzing the data collected from your machine by using [Prometheus](https://prometheus.io/).

- [OpenShift](https://www.openshift.com/)

### Linux Best Practices

- Never use root user
- Always update the security patch for your OS
- Enable Firewall
- Change password periodically (if you decided to use the password to log in)
- Backup your storage regularly

## References

https://medium.com/figment-networks/full-disclosure-figments-cosmos-validator-infrastructure-3bc707283967

https://kb.certus.one/

https://github.com/slowmist/eos-bp-nodes-security-checklist

https://forum.cosmos.network/t/sentry-node-architecture-overview/454

https://medium.com/loom-network/hsm-policies-and-the-importance-of-validator-security-ec8a4cc1b6f
