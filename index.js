'use strict';


function UnsetVariableError(message) { this.message = message; }
UnsetVariableError.prototype = Object.create(Error.prototype);
UnsetVariableError.prototype.name = 'UnsetVariableError';

function ValueError(message) { this.message = message; }
ValueError.prototype = Object.create(Error.prototype);
ValueError.prototype.name = 'ValueError';

var createUnsetVariableError = function(name) {
  return new UnsetVariableError(
    'No environment variable named "' + name + '"'
  );
};

var checkDefaultValueType = function(name, typeName, value) {
  if (Object.prototype.toString.call(value) !== '[object ' + typeName + ']') {
    throw new TypeError(
      'Default value of process.env["' + name + '"] is not of type ' + typeName
    );
  }
};

var def = function(typeName, coerce) {
  return function(name, value) {
    var n = arguments.length;
    if (n < 1) throw new Error('Too few arguments');
    if (n > 2) throw new Error('Too many arguments');

    if (n === 2) checkDefaultValueType(name, typeName, value);

    var env = (this && this.env) || process.env
    var env = (this && this.env) || process.env
    if (this && this.merge) {
      for (var prop in process.env) {
        if (!env[prop]) env[prop] = process.env[prop]
      }
    }

    if (!Object.prototype.hasOwnProperty.call(env, name)) {
      if (n === 2) return value;
      throw createUnsetVariableError(name);
    }

    return coerce(name, env[name]);
  };
};

var envvar = function (env, opts) {
  opts = opts || {}
  var merge = opts.merge === false ? false : true
  var out = {}
  for (var prop in envvar) out[prop] = envvar[prop]
  out.boolean = envvar.boolean.bind({ env: env, merge: merge })
  out.number = envvar.number.bind({ env: env, merge: merge })
  out.string = envvar.string.bind({ env: env, merge: merge })
  out.enum = envvar.enum.bind({ env: env, merge: merge })
  return out
}

envvar.boolean = def('Boolean', function(name, value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new ValueError(
    'Value of process.env["' + name + '"] is neither "true" nor "false"'
  );
});

envvar.number = def('Number', function(name, value) {
  var num = Number(value);
  if (num === num) return num;
  throw new ValueError(
    'Value of process.env["' + name + '"] does not represent a number'
  );
});

envvar.string = def('String', function(name, value) {
  return value;
});

envvar.enum = function(name, members, value) {
  var n = arguments.length;
  if (n < 2) throw new Error('Too few arguments');
  if (n > 3) throw new Error('Too many arguments');

  members.forEach(function(member) {
    if (Object.prototype.toString.call(member) !== '[object String]') {
      throw new TypeError(
        'Enumerated types must consist solely of string values'
      );
    }
  });

  if (n === 3) checkDefaultValueType(name, 'String', value);

  var env = (this && this.env) || process.env
  if (this && this.merge) {
    for (var prop in process.env) {
      if (!env[prop]) env[prop] = process.env[prop]
    }
  }

  if (!Object.prototype.hasOwnProperty.call(env, name)) {
    if (n === 3) return value;
    throw createUnsetVariableError(name);
  }

  if (members.indexOf(env[name]) < 0) {
    throw new ValueError(
      'Value of process.env["' + name + '"] ' +
      'is not a member of (' + members.join(' | ') + ')'
    );
  }

  return env[name];
};

envvar.ValueError = ValueError;
envvar.UnsetVariableError = UnsetVariableError;

module.exports = envvar
