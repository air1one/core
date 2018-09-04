const { Transaction } = require('@arkecosystem/crypto').models
const container = require('@arkecosystem/core-container')
const logger = container.resolvePlugin('logger')
const config = container.resolvePlugin('config')

module.exports = class SPV {
  /**
   * Create a new wallet builder instance.
   * @param  {SequelizeConnection} database
   * @return {void}
   */
  constructor (database) {
    this.connection = database.connection
    this.models = database.models
    this.walletManager = database.walletManager
    this.query = database.query
  }

  /**
   * Perform the SPV (Simple Payment Verification).
   * @param  {Number} height
   * @return {void}
   */
  async build (height) {
    this.activeDelegates = config.getConstants(height).activeDelegates

    logger.printTracker('SPV', 1, 8, 'Received Transactions')
    await this.__buildReceivedTransactions()

    logger.printTracker('SPV', 2, 8, 'Block Rewards')
    await this.__buildBlockRewards()

    logger.printTracker('SPV', 3, 8, 'Last Forged Blocks')
    await this.__buildLastForgedBlocks()

    logger.printTracker('SPV', 4, 8, 'Sent Transactions')
    await this.__buildSentTransactions()

    logger.printTracker('SPV', 5, 8, 'Second Signatures')
    await this.__buildSecondSignatures()

    logger.printTracker('SPV', 6, 8, 'Delegates')
    await this.__buildDelegates()

    logger.printTracker('SPV', 7, 8, 'Votes')
    await this.__buildVotes()

    logger.printTracker('SPV', 8, 8, 'MultiSignatures')
    await this.__buildMultisignatures()

    logger.stopTracker('SPV', 8, 8)
    logger.info(`SPV rebuild finished, wallets in memory: ${Object.keys(this.walletManager.byAddress).length}`)
    logger.info(`Number of registered delegates: ${Object.keys(this.walletManager.byUsername).length}`)
  }

  /**
   * Load and apply received transactions to wallets.
   * @return {void}
   */
  async __buildReceivedTransactions () {
    const transactions = await this.query.many('spv/received-transactions')

    for (const transaction of transactions) {
      const wallet = this.walletManager.findByAddress(transaction.recipient_id)

      wallet
        ? wallet.balance = parseInt(transaction.amount)
        : logger.warn(`Lost cold wallet: ${transaction.recipient_id} ${transaction.amount}`)
    }
  }

  /**
   * Load and apply block rewards to wallets.
   * @return {void}
   */
  async __buildBlockRewards () {
    const transactions = await this.query.many('spv/block-rewards')

    for (const transaction of transactions) {
      const wallet = this.walletManager.findByPublicKey(transaction.generator_public_key)
      wallet.balance += parseInt(transaction.reward)
    }
  }

  /**
   * Load and apply last forged blocks to wallets.
   * @return {void}
   */
  async __buildLastForgedBlocks () {
    const transactions = await this.query.many('spv/last-forged-blocks', [this.activeDelegates])

    for (const transaction of transactions) {
      const wallet = this.walletManager.findByPublicKey(transaction.generator_public_key)
      wallet.lastBlock = transaction
    }
  }

  /**
   * Load and apply sent transactions to wallets.
   * @return {void}
   */
  async __buildSentTransactions () {
    const transactions = await this.query.many('spv/sent-transactions')

    for (const transaction of transactions) {
      let wallet = this.walletManager.findByPublicKey(transaction.sender_public_key)
      wallet.balance -= parseInt(transaction.amount) + parseInt(transaction.fee)

      if (wallet.balance < 0 && !this.walletManager.isGenesis(wallet)) {
        logger.warn(`Negative balance: ${wallet}`)
      }
    }
  }

  /**
   * Load and apply second signature transactions to wallets.
   * @return {void}
   */
  async __buildSecondSignatures () {
    const transactions = await this.query.manyOrNone('spv/second-signatures')

    for (const transaction of transactions) {
      const wallet = this.walletManager.findByPublicKey(transaction.sender_public_key)
      wallet.secondPublicKey = Transaction.deserialize(transaction.serialized.toString('hex')).asset.signature.publicKey
    }
  }

  /**
   * Load and apply delegate usernames to wallets.
   * @return {void}
   */
  async __buildDelegates () {
    // Register...
    const transactions = await this.query.manyOrNone('spv/delegates')

    for (let i = 0; i < transactions.length; i++) {
      const wallet = this.walletManager.findByPublicKey(transactions[i].sender_public_key)
      wallet.username = Transaction.deserialize(transactions[i].serialized.toString('hex')).asset.delegate.username

      this.walletManager.reindex(wallet)
    }

    // Map public keys
    const publicKeys = transactions.map(transaction => transaction.sender_public_key).join(',')

    // Forged Blocks...
    const forgedBlocks = await this.query.manyOrNone('spv/delegates-forged-blocks', [publicKeys])

    // Ranks...
    const delegates = await this.query.manyOrNone('spv/delegates-ranks', [publicKeys])

    for (let i = 0; i < delegates.length; i++) {
      const forgedBlock = forgedBlocks.filter(block => {
        return block.generatorPublicKey === delegates[i].publicKey
      })[0]

      const wallet = this.walletManager.findByPublicKey(delegates[i].publicKey)
      wallet.votebalance = delegates[i].votebalance
      wallet.missedBlocks = parseInt(delegates[i].missed_blocks)

      if (forgedBlock) {
        wallet.forgedFees = +forgedBlock.total_fees
        wallet.forgedRewards = +forgedBlock.total_rewards
        wallet.producedBlocks = +forgedBlock.total_produced
      }

      this.walletManager.reindex(wallet)
    }
  }

  /**
   * Load and apply votes to wallets.
   * @return {void}
   */
  async __buildVotes () {
    const transactions = await this.query.many('spv/votes')

    for (const transaction of transactions) {
      const wallet = this.walletManager.findByPublicKey(transaction.sender_public_key)

      if (!wallet.voted) {
        const vote = Transaction.deserialize(transaction.serialized.toString('hex')).asset.votes[0]

        if (vote.startsWith('+')) {
          wallet.vote = vote.slice(1)
        }

        wallet.voted = true
      }
    }

    this.walletManager.updateDelegates()
  }

  /**
   * Load and apply multisignatures to wallets.
   * @return {void}
   */
  async __buildMultisignatures () {
    const transactions = await this.query.manyOrNone('spv/multi-signatures')

    for (const transaction of transactions) {
      const wallet = this.walletManager.findByPublicKey(transaction.sender_public_key)

      if (!wallet.multisignature) {
        wallet.multisignature = Transaction.deserialize(transaction.serialized.toString('hex')).asset.multisignature
      }
    }
  }
}
