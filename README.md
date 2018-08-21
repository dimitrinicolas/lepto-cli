# lepto-cli [![Build Status][travis badge]][travis link]

```shell
$ npm i -g lepto-cli
```

To get started with lepto, run `lepto setup`, be sure to have a `package.json`, 
if not, create it with `npm init` or lepto-cli will create it.

Use `--config` (`-c`) argument to give your lepto config path.

```
Usage: lepto [options] [command]

Options:

  -V, --version             output the version number
  -i, --input [dir]         Set input directory
  -o, --output [dir]        Set output directory
  -c, --config [file]       Path to a config file (default: lepto.config.json)
  -d --dataOutput [file]    Set the output json file for the data (eg: ./output/data.json)
  -w, --watch               Watch for files changes
  -l, --logLevel [0-3]      Set the log level from 0 (silent) to 3 (all informations)
  -p, --logPrefix [prefix]  Set a prefix for the log, eg: lepto
  --watchConfig             Watch for config file change
  --followUnlink            Remove files in the output when they are removed from the input directory
  -h, --help                output usage information

Commands:

  setup                     Create a lepto config file
```

## Contributing

Test with fictures assets

```shell
$ cd fixtures/
$ ../bin/lepto
```

Test package

```shell
$ npm test
```

## Related

- [lepto][lepto] - Automated image Editing, Optimization and Analysis via CLI
and a web interface

## License

This project is licensed under the [MIT license](LICENSE).

[travis badge]: https://travis-ci.org/leptojs/lepto-cli.svg?branch=master
[travis link]: https://travis-ci.org/leptojs/lepto-cli

[lepto]: https://github.com/leptojs/lepto
