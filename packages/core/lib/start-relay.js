'use strict'

const nock = require('nock')
const container = require('@arkecosystem/core-container')

/**
 * Start a relay.
 * @param  {Object} options
 * @return {void}
 */
module.exports = async (options) => {
  nock.recorder.rec()

  await container.setUp(options, {
    exclude: ['@arkecosystem/core-forger'],
    options: {
      '@arkecosystem/core-blockchain': {
        networkStart: options.networkStart
      }
    }
  })
}
