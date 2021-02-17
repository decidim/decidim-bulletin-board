import * as bigInt from './BigInteger.js';

function urlBase64ToBase64(str) {
  var r = str % 4;
  if (2 === r) {
    str += '==';
  } else if (3 === r) {
    str += '=';
  }
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

function b64ToBn(b64) {
  var bin = atob(b64);
  var hex = [];

  bin.split('').forEach(function (ch) {
    var h = ch.charCodeAt(0).toString(16);
    if (h.length % 2) { h = '0' + h; }
    hex.push(h);
  });

  return BigInt('0x' + hex.join(''));
}


export var dump_json = function(instance, strip_privates = true) {
  // TO-DO: strip_privates?
  return JSON.stringify(instance);
}

export var dump_json_object = function(instance, strip_privates = true) {
  // TO-DO: strip_privates?
  return instance;
}

export var parse_json = function(data, class_out) {
  return parse_json_object(JSON.parse(data), class_out);
}

export var parse_json_object = function(data, class_out) {
  if (class_out === 'Optional')
      return data || null;

  if (Array.isArray(class_out)) {
    switch(class_out[0].__name__) {
      case 'str':
      case 'int':
      case 'bool':
        return data;
      default:
        return data.map(function(currentValue) {
          return parse_json_object(currentValue, class_out[0]);
        });
    }
  }

  switch(class_out.__name__) {
      case 'datetime':
        return class_out.fromtimestamp((new Date(data)).valueOf()/1000);

      case 'ElementModP':
      case 'ElementModQ':
        return new class_out(new bigInt(b64ToBn(urlBase64ToBase64(data))));

      case 'str':
      case 'int':
      case 'bool':
        return data;
  }

  var instance = new class_out();
  var serializedObject = data;
  Object.assign(instance, serializedObject);

  if (instance._types) {
    instance._types.forEach(function(pair) {
      instance[pair[0]] = parse_json_object(instance[pair[0]], pair[1]);
    });
  }

  return instance;
}
