var env  = require(__dirname+'/lib/env')
  , util = require('util')
  ;

var global_env = env.add_globals(env.create_env());

var lisp_eval = exports.lisp_eval = function(x, env) {  // Evaluate an expression in an environment.
  env = env || global_env;
  var alt, conseq, exp, exps, test, v, val, vs;
    {
  if (typeof x === 'string' && isNaN(x)) {      // variable reference
    console.log('Variable Reference: ' + x);
    console.log(util.format('Env: %j', env.find(x)));
    return env.find(x).properties[x];
  }
  else if (typeof x === 'string' && !isNaN(x)) {     // constant literal
    console.log('Constant Literal: ' + x);
    return x;
  }
  else if (x[0] === 'quote') {      // (quote exp)
    console.log('(' + x + ')');
    exp = x[1];
    return exp;
  }
  else if (x[0] === 'if') {         // (if test conseq alt
    console.log('(' + x + ')');
    test = x[1]; conseq = x[2]; alt = x[3];
    return lisp_eval([lisp_eval(test) ? conseq : alt], env);
  }
  else if (x[0] === 'set!') {       // (set! var exp)
    console.log('(' + x + ')');
    v = x[1]; exp = x[2];
    env.find(v)[v] = lisp_eval(exp, env);
  }
  else if (x[0] === 'define') {     // (define var exp)
    console.log('(' + x + ')');
    v = x[1]; exp = x[2];
    env.properties[v] = lisp_eval(exp, env);
  }
  else if (x[0] === 'lambda') {     // (lambda (var*) exp)
    console.log('(' + x + ')');
    vs = x[1]; exp = x[2];
    return function(args) { lisp_eval(exp, env.create_env(env, vs, args)); };
  }
  else if (x[0] === 'begin') {      // (begin expr*)
    console.log('(' + x + ')');
    exps = x.splice(1);
    for (var ex in exps) {
      val = lisp_eval(ex, env);
    }
    return val;
  }
  else {                            // (proc exp*)
    console.log('(proc ' + x + ')');
    exps = [];
    for (var exx in x) {
      exps.push(lisp_eval(x[exx], env));
    }
    return exps[0](exps.slice(1));
  }
};

var read = exports.parse = function(s) {  // Read a Scheme expression from a string
  return read_from(tokenize(s));
};

var tokenize = function(s) {              // Convert a string into a list of tokens
  var tokens = s.replace('(', ' ( ').replace(')', ' ) ').split(/\s+/);
  console.log(tokens);
  return tokens.slice(1, tokens.length-1);
};

var read_from = function(tokens) {        // Read an expression from a sequence of tokens
  var L;
  if (tokens.length === 0) {
    throw new Error("SyntaxError: Unexpected EOF while reading!");
  }
  var token = tokens.shift();
  console.log(token);
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
    //var val = lisp_eval(read(data.toString()));
    var tokens = read(data.toString());
    console.log(tokens);
    var val = lisp_eval(tokens, global_env);
    console.log(val);
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
