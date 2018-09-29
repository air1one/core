'use strict'

const nock = require('nock')
const container = require('@arkecosystem/core-container')

/**
 * Start a node.
 * @param  {Object} options
 * @return {void}
 */
module.exports = async (options) => {
  nock.recorder.rec()

  await container.setUp(options, {
    options: {
      '@arkecosystem/core-p2p': {
        networkStart: options.networkStart
      },
      '@arkecosystem/core-blockchain': {
        networkStart: options.networkStart
      },
      '@arkecosystem/core-forger': {
        bip38: options.bip38,
        address: options.address,
        password: options.password
      }
    }
  })
}
