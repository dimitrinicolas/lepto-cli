# lepto-cli

```shell
$ npm i -g lepto-cli
```

To get started with lepto, run `lepto setup`.

```
Usage: lepto [options] [command]

  Options:

    -V, --version           output the version number
    -i, --input [dir]       Set input directory
    -o, --output [dir]      Set output directory
    -c, --config [file]     Path to a config file (default: lepto.config.json)
    -d --dataOutput [file]  Set the output json file for the data (eg: ./output/data.json)
    -w, --watch             Watch for files changes
    -l, --logLevel [0-3]    Set the log level from 0 (silent) to 3 (all informations)
    --watchConfig           Watch for config file change
    --followUnlink          Remove files in the output when they are removed from the input directory
    -h, --help              output usage information

  Commands:

    setup                   Create a lepto config file
```

## Contributing

```shell
$ npm i -g
```

## License

This project is licensed under the [MIT license](LICENSE).
