'use strict'

const $ = require('jquery')
const {
  signer,
  BatchEncoder,
  TransactionEncoder
} = require('sawtooth-sdk/client')

// Config variables
const KEY_NAME = 'subscription-chain.keys'
const API_URL = 'http://localhost:8008'

const FAMILY = 'subscription-chain'
const VERSION = '0.0'
const PREFIX = 'a657a9'

// Fetch key-pairs from localStorage
const getKeys = () => {
  //localStorage.setItem(KEY_NAME, '');
  const storedKeys = localStorage.getItem(KEY_NAME)
  if (!storedKeys) return []

  return storedKeys.split(';').map((pair) => {
    const separated = pair.split(',')
    return {
      title: separated[0],
      public: separated[1],
      private: separated[2]
    }
  })
}

// Create new key-pair
const makeKeyPair = (name) => {
  const privateKey = signer.makePrivateKey()
  return {
    title: name,
    public: signer.getPublicKey(privateKey),
    private: privateKey
  }
}

// Save key-pairs to localStorage
const saveKeys = keys => {
  const paired = keys.map(pair => [pair.title, pair.public, pair.private].join(','))
  localStorage.setItem(KEY_NAME, paired.join(';'))
}

// Fetch current Transfer Chain state from validator
const getState = cb => {
  $.get(`${API_URL}/state?address=${PREFIX}`, ({ data }) => {
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        if (datum.address[7] === '0') processed.assets.push(parsed)
        if (datum.address[7] === '1') processed.transfers.push(parsed)
      }
      return processed
    }, {assets: [], transfers: []}))
  })
}

// Fetch current Transfer Chain state from validator
const getSubscriptionHistory = (asset,cb) => {
  $.get(`${API_URL}/state?address=${PREFIX}`, ({ data }) => {
    cb(data.reduce((processed, datum) => {
      if (datum.data !== '') {
        const parsed = JSON.parse(atob(datum.data))
        
        if (datum.address[7] === '0' && parsed.asset === asset) processed.assets.push(parsed)
        
      }
      return processed
    }, {assets: []}))
  })
}

// Submit signed Transaction to validator
const submitUpdate = (payload, privateKey, cb) => {
  const transaction = new TransactionEncoder(privateKey, {
    inputs: [PREFIX],
    outputs: [PREFIX],
    familyName: FAMILY,
    familyVersion: VERSION,
    payloadEncoding: 'application/json',
    payloadEncoder: p => Buffer.from(JSON.stringify(p))
  }).create(payload)

  
  const batchBytes = new BatchEncoder(privateKey).createEncoded(transaction)

  $.post({
    url: `${API_URL}/batches?wait`,
    data: batchBytes,
    headers: {'Content-Type': 'application/octet-stream'},
    processData: false,
    // Any data object indicates the Batch was not committed
    success: ({ data }) => { cb(!data); },
    error: () => { cb(false); }
  })
}

module.exports = {
  getKeys,
  makeKeyPair,
  saveKeys,
  getState,
  getSubscriptionHistory,
  submitUpdate
}
