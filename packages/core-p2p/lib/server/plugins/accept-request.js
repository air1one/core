'use strict'

const requestIp = require('request-ip')
const isWhitelist = require('../../utils/is-whitelist')
const logger = require('@arkecosystem/core-container').resolvePlugin('logger')

/**
 * The register method used by hapi.js.
 * @param  {Hapi.Server} server
 * @param  {Object} options
 * @return {void}
 */
const register = async (server, options) => {
  const requiredHeaders = ['nethash', 'version', 'port', 'os']

  server.ext({
    type: 'onRequest',
    async method (request, h) {
      const remoteAddress = requestIp.getClientIp(request)
      logger.info(`[accept-request] Request from ${remoteAddress} for ${request.path}`)
      if (request.path.startsWith('/config')) {
        return h.continue
      }

      if ((request.path.startsWith('/internal') || request.path.startsWith('/remote')) && !isWhitelist(options.whitelist, remoteAddress)) {
        return h.response({
          code: 'ResourceNotFound',
          message: `${request.path} does not exist`
        }).code(400).takeover()
      }

      if (request.path.startsWith('/peer')) {
        logger.info(`[accept-request] Request from ${remoteAddress} : startsWith /peer`)
        const peer = { ip: remoteAddress }

        requiredHeaders.forEach(key => (peer[key] = request.headers[key]))

        try {
          await server.app.p2p.acceptNewPeer(peer)
          logger.info(`[accept-request] Request from ${remoteAddress} : peer accepted`)
        } catch (error) {
          logger.error(`[accept-request] Request from ${remoteAddress} : error ${error.message}`)
          return h.response({
            success: false,
            message: error.message
          }).code(500).takeover()
        }
      }

      return h.continue
    }
  })
}

/**
 * The struct used by hapi.js.
 * @type {Object}
 */
exports.plugin = {
  name: 'core-p2p-accept-request',
  version: '0.1.0',
  register
}
