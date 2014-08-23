
var global_env = {};              // An environment: a dict of {'var': value} pairs, with an outer env

var add_globals = function(env) { // Add some Scheme standard procedures to an environment
  Object.defineProperties(env, {
      '+': function() {}, '-': op.sub, '*': op.
  })
};

var lisp_eval = function(x, env) {
  env = env || global_env;

  // Evaluate an expression in an environment.
  if (isa(x, Symbol)) { // variable reference
    return env.find(x)[x];
  }
  else if (!isa(x, )) {
  }
};
