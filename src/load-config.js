const fs = require('fs');

/**
 * Load a config file
 * @param {string} [path='']
 * @returns {object} result
 */
const loadConfig = (path = '') => {
  if (fs.existsSync(path)) {
    const ext = path.substr(path.lastIndexOf('.') + 1, path.length);
    let config = null;
    if (ext === 'js') {
      config = require(path);
    } else {
      const str = fs.readFileSync(path, 'utf-8');
      try {
        config = JSON.parse(str);
      } catch (error) {
        return {
          success: false,
          filepath: path,
          msg: 'Invalid config file json'
        };
      }
    }

    return {
      success: true,
      filepath: path,
      config,
      msg: ''
    };
  }
  return {
    success: false,
    filepath: path,
    msg: 'Config file not found'
  };
};

module.exports = loadConfig;
