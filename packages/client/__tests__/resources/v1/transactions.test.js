const Client = require('../../../lib')
const ApiResource = require('../../../lib/resources/v1/transactions')

const configureMocks = require('../../mocks/v1')
const host = 'https://example.net:4003'
configureMocks({ host })

let resource

beforeEach(() => {
  resource = (new Client(host)).setVersion(1).resource('transactions')
})

describe('API - 1.0 - Resources - Transactions', () => {
  it('should be instantiated', () => {
    expect(resource).toBeInstanceOf(ApiResource)
  })

  it('should call "all" method', async () => {
    const response = await resource.all({})

    expect(response.status).toBe(200)
  })

  it('should call "get" method', async () => {
    const response = await resource.get('123')

    expect(response.status).toBe(200)
  })

  it('should call "allUnconfirmed" method', async () => {
    const response = await resource.allUnconfirmed({})

    expect(response.status).toBe(200)
  })

  it('should call "getUnconfirmed" method', async () => {
    const response = await resource.getUnconfirmed('123')

    expect(response.status).toBe(200)
  })
})
