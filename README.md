![ARK Core](https://i.imgur.com/1aP6F2o.png)

# ARK Core Devnet V2

## Introduction

This repository / branch contains everything to get you started on Devnet V2 (maintained by the community).

## Installation

- Development : https://docs.ark.io/core/development.html
- Docker : https://docs.ark.io/core/docker.html

```
git clone https://github.com/air1one/core
git checkout devnet-v2
```

- API v1 : https://docs.ark.io/developers/api/public/v1/
- API v2 : https://docs.ark.io/developers/api/public/v2/

```
cd core
lerna bootstrap
cd packages/core
yarn relay:devnet
```

See the [official doc](https://arkdocs.readme.io/docs/development) for detailed install (databases, docker...).

## Slack discussion

To discuss anything devnet-v2-related, let's talk in Ark Slack #devnet_unofficial channel.