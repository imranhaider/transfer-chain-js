'use strict'

const $ = require('jquery')
const {
  getKeys,
  makeKeyPair,
  saveKeys,
  getState,
  getSubscriptionHistory,
  submitUpdate
} = require('./state')
const {
  addOption,
  addRow,
  addHistoryRow,
  addSubscriberListRow,
  addSubscribedListRow,
  addAction
} = require('./components')

const concatNewOwners = (existing, ownerContainers) => {
  return existing.concat(ownerContainers
    .filter(({ owner }) => !existing.includes(owner))
    .map(({ owner }) => owner))
}

// Application Object
const app = { user: null, keys: [], assets: [], transfers: [] }

app.refresh = function () {
  getState(({ assets, transfers }) => {
    this.assets = assets
    this.transfers = transfers



    // Clear existing data views
    $('#assetList').empty()
    $('#subscriableList').empty()
    $('#subscribedList').empty()
    $('#transferList').empty()
    $('[name="assetSelect"]').children().slice(1).remove()
    $('[name="transferSelect"]').children().slice(1).remove()


    $('.ownerName').html('Account :' + this.user.title);

    // Populate subscriber view
    assets.forEach(asset => {

      if (this.user && !asset.subscriber && asset.ownerPublicKey !== this.user.public) {
        const assetObj = { name: asset.name, owner: asset.owner, ownerPublicKey: asset.ownerPublicKey };
        addSubscriberListRow('#subscriableList', assetObj)
      }
    });

    // Populate subscribed assets view
    assets.forEach(asset => {

      if (this.user && asset.subscriberPublicKey === this.user.public) {
        const assetObj = { name: asset.name, owner: asset.owner, ownerPublicKey: asset.ownerPublicKey };
        
        addSubscribedListRow('#subscribedList', assetObj)
      }
    });


    // Populate asset views
    assets.forEach(asset => {
      if (this.user && asset.ownerPublicKey === this.user.public) {
        addOption('[name="assetSelect"]', asset.name)
        const subscriber = asset.subscriber ? asset.subscriber : '';
        const assetObj = { name: asset.name, owner: asset.owner, ownerPublicKey: asset.ownerPublicKey, subscriber: subscriber };
        addRow('#assetList', assetObj)
      }
    })



    // Populate transfer list for selected user
    transfers.filter(transfer => transfer.owner === this.user.public)
      .forEach(transfer => addAction('#transferList', transfer.asset, 'Accept'))

    // Populate transfer select with both local and blockchain keys
    let publicKeys = this.keys.map(pair => pair.public)
    publicKeys = concatNewOwners(publicKeys, assets)
    publicKeys = concatNewOwners(publicKeys, transfers)
    publicKeys.forEach(key => addOption('[name="transferSelect"]', key))
  })
}

app.update = function (action, asset, transactionId, date, owner, subscriber) {
  if (this.user) {
    submitUpdate(
      { action, asset, transactionId, date, owner, subscriber },
      this.user.private,
      success => success ? this.refresh() : null
    )
  }
}

// Select User
$('[name="keySelect"]').on('change', function () {
  if (this.value === 'new') {

  } else if (this.value === 'none') {
    app.user = null
  } else {
    app.user = app.keys.find(key => key.public === this.value)

    $("#user").hide();
    $('#subscription').hide();
    $('#owner').hide();
    $('#selection').show();
    app.refresh()
  }
})

// Create Account 

$('#createAccount').on('click', function () {

  var accountTitle = $('#enterTitle').val();
  if (accountTitle) {
    app.user = makeKeyPair(accountTitle);
    app.keys.push(app.user);
    saveKeys(app.keys)
    addOption('[name="keySelect"]', app.user.public, app.user.title, true);
    //addOption('[name="transferSelect"]', app.user.public, app.user.title);
    app.refresh()
    $("#user").hide();
    $('#subscription').hide();
    $('#owner').hide();
    $('#selection').show();

  }
});


// Create Asset
$('#createSubmit').on('click', function () {
  const asset = $('#createName').val()
  if (asset && app.user) app.update('create', asset, getGuid(), Date(), app.user.title, '')
})

function getGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

$(document).on('click', '.subscribe', function () {

  const asset = $(this).data("asset");
  //alert(app.user.title);
  if (asset && asset.name && asset.owner) app.update('subscribe', asset.name, getGuid(), Date(), asset.owner, app.user.title)
})


// Return Asset
$(document).on('click', '.returnAsset', function () {
  const asset = $(this).data("asset");
  if (asset && asset.name && asset.owner) app.update('return', asset.name, getGuid(), Date(), asset.owner, app.user.title)
})

// Return Asset
$(document).on('click', '.history', function () {
  const asset = $(this).data("asset");
  getSubscriptionHistory(asset.name, ({ assets }) => {

    $("#user").hide();
    $('#subscription').hide();
    $('#owner').hide();
    $('#selection').hide();
    $('#history').show();

    $('#subscriptionHistory').empty();
    assets.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);});
    assets.forEach(asset => {
      const assetObj = { transactionId: asset.transactionId, name: asset.asset,  action: asset.action, subscriber: asset.subscriber, date: asset.date };
      addHistoryRow('#subscriptionHistory', assetObj)

    });
  });
})



// Transfer Asset
$('#transferSubmit').on('click', function () {
  const asset = $('[name="assetSelect"]').val()
  const owner = $('[name="transferSelect"]').val()
  if (asset && owner) app.update('transfer', asset, getGuid(), owner)
})

// Accept Asset
$('#transferList').on('click', '.accept', function () {
  const asset = $(this).prev().text()
  if (asset) app.update('accept', asset, getGuid())
})

$('#transferList').on('click', '.reject', function () {
  const asset = $(this).prev().prev().text()
  if (asset) app.update('reject', asset, getGuid())
})

// route to home section
$('.accounts').on('click', function () {

  //window.location.replace("asset-owner.html");

  //app.refresh();

  $("#user").show();
  $('#subscription').hide();
  $('#owner').hide();
  $('#selection').hide();
  $('#history').hide();

});

// Route to Asset Owner Page 

$('.ownerLink').on('click', function () {

  //window.location.replace("asset-owner.html");

  //app.refresh();

  $("#user").hide();
  $('#subscription').hide();
  $('#owner').show();
  $('#selection').hide();
  $('#history').hide();

});


// Route to Asset Owner Page 

$('.subscriberLink').on('click', function () {

  $("#user").hide();
  $('#subscription').show();
  $('#owner').hide();
  $('#selection').hide();
  $('#history').hide();
  app.refresh();

});


// Initialize
app.keys = getKeys()
app.keys.forEach(pair => addOption('[name="keySelect"]', pair.public, pair.title))
app.refresh()
