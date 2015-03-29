import memoize from "lodash.memoize"
import browserslist from "browserslist"

import {contains, parseCaniuseData, cleanBrowsersList} from "./utils"
import features from "../features.json"

var browsers
function setBrowserScope(browserList) {
  browsers = cleanBrowsersList(browserList)
}

function getBrowserScope() {
  return browsers
}

var parse = memoize(parseCaniuseData, function(feature, browsers) {
  return feature.title + browsers
})

function getSupport(query) {
  let feature
  try {
    feature = require(`caniuse-db/features-json/${query}`)
  } catch(e) {
    let res = find(query)
    if (res.length === 1) return getSupport(res[0])
    throw new ReferenceError(`Please provide a proper feature name. Cannot find ${query}`)
  }
  return parse(feature, browsers)
}

function isSupported(feature, browsers) {
  let data
  try {
    data = require(`caniuse-db/features-json/${feature}`)
  } catch(e) {
    let res = find(feature)
    if (res.length === 1) {
      data = require(`caniuse-db/features-json/${res[0]}`)
    } else {
      throw new ReferenceError(`Please provide a proper feature name. Cannot find ${feature}`)
    }
  }

  return browserslist(browsers)
    .map((browser) => browser.split(" "))
    .every((browser) => data.stats[browser[0]][browser[1]] === "y")
}

function find(query) {
  if (~features.indexOf(query)) { // exact match
    return query
  }

  return features.filter((file) => contains(file, query))
}

function getLatestStableBrowsers() {
  return browserslist.queries.lastVersions.select(1)
}

setBrowserScope()

export {getSupport, isSupported, find, getLatestStableBrowsers, setBrowserScope, getBrowserScope}

