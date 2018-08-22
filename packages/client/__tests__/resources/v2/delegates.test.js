const Client = require('../../../lib')
const ApiResource = require('../../../lib/resources/v2/delegates')

const configureMocks = require('../../mocks/v2')
const host = 'https://example.net:4003'
configureMocks({ host })

let resource

beforeEach(() => {
  resource = (new Client(host)).setVersion(2).resource('delegates')
})

describe('API - 2.0 - Resources - Delegates', () => {
  it('should be instantiated', () => {
    expect(resource).toBeInstanceOf(ApiResource)
  })

  it('should call "all" method', async () => {
    const response = await resource.all()

    expect(response.status).toBe(200)
  })

  it('should call "get" method', async () => {
    const response = await resource.get('123')

    expect(response.status).toBe(200)
  })

  it('should call "blocks" method', async () => {
    const response = await resource.blocks('123')

    expect(response.status).toBe(200)
  })

  it('should call "voters" method', async () => {
    const response = await resource.voters('123')

    expect(response.status).toBe(200)
  })
})
