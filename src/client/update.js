'use strict';

var actions = require('./actions.js');
var calculateItemCost = require('./util/calculate-item-cost.js');
var calculateShopIncome = require('./util/calculate-shop-income.js');
var config = require('../../resources/config.json');
var dispatcher = require('./dispatcher.js');
var Particle = require('./util/particle.js');
var shops = require('../../resources/shops.json');

var KEYCODE_SPACEBAR = 32;
var KEYCODE_ENTER = 13;
var KEYCODE_C = 67;
var KEYCODE_V = 86;
var KEYCODE_B = 66;

var interval = 1 / config.ticksPerSecond;

module.exports = {
  init: function (action, state) {
    window.state = state;

    setInterval(function () {
      actions.interval();
    }, 1000 * interval);

    window.addEventListener('keyup', function (e) {
      switch (e.keyCode) {
        case KEYCODE_SPACEBAR:
        case KEYCODE_ENTER:
          actions.increment();
          break;
        case KEYCODE_C:
          actions.setPage('clicker');
          break;
        case KEYCODE_V:
          actions.setPage('shop/systems');
          break;
        case KEYCODE_B:
          actions.setPage('shop/skills');
          break;
      }
    });
  },
  increment: function (action, state) {
    var income = calculateShopIncome(shops.skills, state.inventory.skills);
    state.counter += income + 1;

    state.particles.push(randomParticle(income + 1));
  },
  interval: function (action, state) {
    var income = calculateShopIncome(shops.systems, state.inventory.systems);
    state.counter += income * interval;
    state.ticks++;
    if (state.ticks % config.ticksPerSecond === 0) {
      state.particles.push(randomParticle(income));
    }
  },
  setPage: function (action, state) {
    state.page = action.path;
  },
  buy: function (action, state) {
    var shop = shops[action.shopName];
    var item = shop.items.find(function (item) {
      return item.key === action.itemKey;
    });
    var alreadyBought = state.inventory[action.shopName][item.key];
    var cost = calculateItemCost(item, alreadyBought);

    if (cost > state.counter) {
      return;
    }
    state.counter -= cost;
    state.inventory[action.shopName][item.key]++;
  }
};

function randomParticle (value) {
  return Particle(
    // position (in the upper half)
    20 + 260 * Math.random(), 20 + 130 * Math.random(),
    // initial velocity
    -15 + 30 * Math.random(), 15 + 30 * Math.random(),
    // acceleration
    0, 30 + 80 * Math.random(),
    'hsl(' + (360 * Math.random()) + ', 100%, 50%)',
    value
  );
}
