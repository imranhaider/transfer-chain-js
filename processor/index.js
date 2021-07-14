'use strict'

const { TransactionProcessor } = require('sawtooth-sdk/processor')
const { SubscriptionHandler } = require('./handlers')

const VALIDATOR_URL = 'tcp://localhost:4004'

// Initialize Transaction Processor
const tp = new TransactionProcessor(VALIDATOR_URL)
tp.addHandler(new SubscriptionHandler())
tp.start()
