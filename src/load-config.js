const fs = require('fs');

const log = require('./log.js');

const loadConfig = (path='', opts={}) => {
  if (fs.existsSync(path)) {
    const ext = path.substr(path.lastIndexOf('.') + 1, path.length);
    let config = null;
    if (ext === 'json') {
      const str = fs.readFileSync(path, 'utf-8');
      try {
        config = JSON.parse(str);
      }
      catch(error) {
        return {
          success: false,
          filepath: path,
          msg: 'Invalid config file json'
        };
      }
    }
    else if (ext === 'js') {
      config = require(path);
    }
    else {
      return {
        success: false,
        filepath: path,
        msg: 'Unknown config file extension ' + ext
      }
    }

    return {
      success: true,
      filepath: path,
      config: config,
      msg: ''
    };
  }
  else {
    return {
      success: false,
      filepath: path,
      msg: 'Config file not found'
    }
  }
};

module.exports = loadConfig;
