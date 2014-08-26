var op = require('mathops');

exports.create_env = function(outer, keys, vals) { // An environment: a dict of {'var': value} pairs, with an outer env
  var properties = {}; 
  keys = keys || []; vals = vals || [];
  for (var i=0; i<keys.length; i++) {
    properties[keys[i]] = vals[i];
  }
  return {
      properties: properties
    , outer: outer
    , find: function(prop) {
        var self = this;
        while (!self.properties.hasOwnProperty(prop) && self.outer !== null) {
          self = self.outer;
        }
        return self;
      }
  };
};

exports.add_globals = function(env) { // Add some Scheme standard procedures to an environment
  var properties = {
    '+': op.add, '-': op.sub, '*': op.mul, '/': op.div, 'not': op.not,
    '>': op.gt, '<': op.lt, '>=': op.ge, '<=': op.le, '=': op.eq,
    'equal?': op.eq, 'eq?': op.steq, 'length': function(x) {return x.length;}, 'cons': function (x, y) {return [x].concat(y);},
    'car': function(x) {return x[0];}, 'cdr': function(x) {return x.slice(1);}, 'append': op.add,
    'list': function(x) {return [x];}, 'list?': function(x) {return Array.isArray(x);},
    'null?': function(x) {return x===[];}, 'symbol?': function(x) {return typeof x === 'string';}
  };
  for (var prop in properties) {
    env.properties[prop] = properties[prop];
  }
  return env;
};

