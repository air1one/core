'use strict'

const path = require('path')
const container = require('@arkecosystem/core-container')

jest.setTimeout(60000)

exports.setUp = async () => {
  await container.setUp({
    data: '~/.ark',
    config: path.resolve(__dirname, '../../../core/lib/config/testnet'),
    token: 'ark',
    network: 'testnet'
  }, {
    include: [
      '@arkecosystem/core-config',
      '@arkecosystem/core-logger',
      '@arkecosystem/core-logger-winston',
      '@arkecosystem/core-json-rpc',
      '@arkecosystem/core-p2p'
    ],
    options: {
      '@arkecosystem/core-json-rpc': {
        enabled: true
      }
    }
  })
}

exports.tearDown = async () => {
  await container.tearDown()
}
