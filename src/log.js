const chalk = require('chalk');

const colors = {
  red: (text, prefix) => chalk.red.bold(`${prefix}✖ ${text}`),
  orange: (text, prefix) => chalk.keyword('orange')(`${prefix}⚠ ${text}`),
  white: (text, prefix) => chalk(`${prefix}i ${text}`),
  lightblue: (text, prefix) => chalk.bold(`${prefix}${text}`),
  green: (text, prefix) => chalk.green(`${prefix}✔ `) + text
};

const params = {
  error: {
    color: 'red',
    level: 1
  },
  warn: {
    color: 'orange',
    level: 2
  },
  info: {
    color: 'white',
    level: 3
  },
  success: {
    color: 'green',
    level: 3
  }
};

const levels = {
  max: 3,
  min: 0
};
let logLevel = 3;

const onces = {};

const getLevel = () => {
  return logLevel;
};

const getLevelCode = level => {
  if (typeof level === 'string' && typeof levels[level] !== 'undefined') {
    return levels[level];
  }
  if (typeof level === 'number') {
    return Math.min(Math.max(level, levels.min), levels.max);
  }
  return levels.max;
};

const setLevel = level => {
  logLevel = getLevelCode(level);
};

const log = (txt = '', opts = {}) => {
  opts = Object.assign(
    {},
    {
      color: 'green',
      level: levels.max,
      callOnceId: null
    },
    opts
  );
  opts.level = getLevelCode(opts.level);
  if (Array.isArray(txt)) {
    txt = txt.join(' ');
  }
  if (opts.level <= logLevel) {
    if (typeof colors[opts.color] === 'undefined') {
      opts.color = 'green';
    }
    if (
      !opts.callOnceId
      || (opts.callOnceId && typeof onces[opts.callOnceId] === 'undefined')
    ) {
      console.log(colors[opts.color](txt, opts.prefix || ''));
    }
    if (opts.callOnceId && typeof onces[opts.callOnceId] === 'undefined') {
      onces[opts.callOnceId] = true;
    }
  }
};

module.exports = Object.assign(log, {
  getLevel,
  getLevelCode,
  setLevel,
  params
});
