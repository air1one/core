![ARK Core](https://i.imgur.com/1aP6F2o.png)

# ARK Core Devnet V2

## Introduction

This repository / branch contains everything to get you started on Devnet V2 (maintained by the community).

## Installation

First, clone this repository and check-out the `devnet-v2` branch.

```
git clone https://github.com/air1one/core
git checkout devnet-v2
```

Then run the standard Ark V2 install process :

```
cd core
lerna bootstrap
cd packages/core
yarn relay:devnet
```

See the [official doc](https://arkdocs.readme.io/docs/development) for detailed install (databases, docker...).

## Slack discussion

To discuss anything devnet-v2-related, let's talk in Ark Slack #devnet_unofficial channel.