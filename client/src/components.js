'use strict'

const $ = require('jquery')

// Add select option which may be set to selected
const addOption = (parent, value, text, selected = false) => {
  const selectTag = selected ? ' selected' : ''
  $(parent).append(`<option value="${value}"${selectTag}>${text} - (${value})</option>`)
}

// Add a new table row with any number of cells
const addRow = (parent, assetObj) => {
  const asset = JSON.stringify(assetObj);
  const tds = Object.values(assetObj).map(cell => `<td style="padding-right:25px;">${cell}</td>`).join('')
  const tds_2 = tds.concat(`<td style="padding-right:25px;">
  <a href="#" class="history" data-asset='${(asset)}' id="historyBtn">History</a>
  </td>`);
  
  $(parent).append(`<tr>${tds_2}</tr>`)
}

// Add a new table row with any number of cells
const addHistoryRow = (parent, assetObj) => {
  const tds = Object.values(assetObj).map(cell => `<td style="padding-right:25px;">${cell}</td>`).join('')
  //console.log(tds_2);
  $(parent).append(`<tr>${tds}</tr>`)
}

// Add a new table row with any number of cells
const addSubscriberListRow = (parent, assetObj) => {
  const asset = JSON.stringify(assetObj);
  const tds = Object.values(assetObj).map(cell => `<td style="padding-right:25px;">${cell}</td>`).join('')
  const tds_2 = tds.concat(`<td style="padding-right:25px;">
  <input class="btn btn-success subscribe" data-asset='${(asset)}' type="button" id="subscribe" value="Subscribe"></input>
  </td>`);

  $(parent).append(`<tr>${tds_2}</tr>`)
}

// Add a new table row with any number of cells
const addSubscribedListRow = (parent,  assetObj) => {
  const asset = JSON.stringify(assetObj);
  const tds = Object.values(assetObj).map(cell => `<td style="padding-right:25px;">${cell}</td>`).join('')
  const tds_2 = tds.concat(`<td style="padding-right:25px;">
  <input class="btn btn-success returnAsset" data-asset='${asset}' type="button" id="returnAsset" value="Return"></input>
  </td>`);

  $(parent).append(`<tr>${tds_2}</tr>`)
}

// Add div with accept/reject buttons
const addAction = (parent, label, action) => {
  $(parent).append(`<div>
  <span>${label}</span>
  <input class="accept" type="button" value="Accept">
  <input class="reject" type="button" value="Reject">
</div>`)
}

module.exports = {
  addOption,
  addRow,
  addHistoryRow,
  addSubscriberListRow,
  addSubscribedListRow,
  addAction
}
