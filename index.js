var op = require('mathops');

var create_env = function(outer, keys, vals) { // An environment: a dict of {'var': value} pairs, with an outer env
  var properties = {}; 
  keys = keys || {}; vals = vals || {};
  for (var i=0; i<keys.length; i++) {
    properties[keys[i]] = vals[i];
  }
  return Object.create(outer || {}, {
      properties: {value: properties}
    , outer: {value: outer}
    , find: {
        value: function(prop) {
          var self = this;
          while (!self.properties.hasOwnProperty(prop) && self.outer !== null) {
            self = self.outer;
          }
          return self.properties;
        }
      }
  });
};

var add_globals = function(env) { // Add some Scheme standard procedures to an environment
  Object.defineProperties(env || {}, {
    properties: {
      value: {
        '+': op.add, '-': op.sub, '*': op.mul, '/': op.div, 'not': op.not,
        '>': op.gt, '<': op.lt, '>=': op.ge, '<=': op.le, '=': op.eq,
        'equal?': op.eq, 'eq?': op.steq, 'length': function(x) {return x.length;}, 'cons': function (x, y) {return [x].concat(y);},
        'car': function(x) {return x[0];}, 'cdr': function(x) {return x.slice(1);}, 'append': op.add,
        'list': function(x) {return [x];}, 'list?': function(x) {return Array.isArray(x);},
        'null?': function(x) {return x===[];}, 'symbol?': function(x) {return typeof x === 'string';}
      }
    }
  });
  return env;
};

var global_env = create_env(add_globals(null));

var lisp_eval = function(x, env) {  // Evaluate an expression in an environment.
  env = env || global_env;
  var alt, conseq, exp, exps, test, v, val, vs;

  if (typeof x === 'string') {      // variable reference
    return env.find(x)[x];
  }
  else if (!Array.isArray(x)) {     // constant literal
    return x;
  }
  else if (x[0] === 'quote') {      // (quote exp)
    exp = x[1];
    return exp;
  }
  else if (x[0] === 'if') {         // (if test conseq alt)
    test = x[1]; conseq = x[2]; alt = x[3];
    return lisp_eval([lisp_eval(test) ? conseq : alt], env);
  }
  else if (x[0] === 'set!') {       // (set! var exp)
    v = x[1]; exp = x[2];
    env.find(v)[v] = lisp_eval(exp, env);
  }
  else if (x[0] === 'define') {     // (define var exp)
    v = x[1]; exp = x[2];
    env.properties[v] = lisp_eval(exp, env);
  }
  else if (x[0] === 'lambda') {     // (lambda (var*) exp)
    vs = x[1]; exp = x[2];
    return function(args) { lisp_eval(exp, create_env(env, vs, args)); };
  }
  else if (x[0] === 'begin') {      // (begin expr*)
    exps = x.splice(1);
    for (var ex in exps) {
      val = lisp_eval(ex, env);
    }
    return val;
  }
  else {                            // (proc exp*)
    for (var exx in x) {
      exps = exps === null ? [lisp_eval(exx, env)] : exps.push(lisp_eval(exx, env));
    }
    return exps[0](exps.slice(1));
  }
};

var read = exports.parse = function(s) {  // Read a Scheme expression from a string
  return read_from(tokenize(s));
};

var tokenize = function(s) {              // Convert a string into a list of tokens
  return s.replace('(', ' ( ').replace(')', ' ) ').split();
};

var read_from = function(tokens) {        // Read an expression from a sequence of tokens
  var L;
  if (tokens.length === 0) {
    throw new Error("SyntaxError: Unexpected EOF while reading!");
  }
  var token = tokens.shift();
  if (token === '(') {
    L = [];
    while (tokens[0] !== ')') {
      L.push(read_from(tokens));
    }
    tokens.shift();
    return L;
  }
  else if (token === ')') {
    throw new Error("SyntaxError: Unexpected )");
  }
  else {
    return atom(token);
  }
};

var atom = function(token) {
  return (typeof token === 'number') ? parseFloat(token) : token;
};

var repl = exports.repl = function(prompt) {
  process.stdout.write(prompt);
  process.stdin.on('data', function(data) {
    var val = lisp_eval(read(data.toString()));
    process.stdout.write('\n\n');
    if (!val) {
      //process.stdout.write(to_s(val));
      console.log(to_s(val));
    }
    process.stdout.write('\n' + prompt);
  });
};

var to_s = function(exp) {
  return Array.isArray(exp) ? '(' + exp.join(' ') + ')' : exp;
};

repl('lambda-js> ');
