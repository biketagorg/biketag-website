# clobfig
A configurator library

# getting started
clobfig looks for a config/ folder one folder up or in the root of the running application using appRoot. clobfig clobbers all of the files within the config folder found that have 'config.js' in their name and all .json files. The json files are loaded first and are loaded as [name].json  (ex: pages.json => clobfig.pages). Note: all json files are loaded this way with the exception of config.json

Finally, clobfig provides a mechanism for overridding values from a present package.json file. Using the schema `title: "@{title}"` tells clobfig to pull this value from the package.json file  in the root of the project. You can prime the loading of clobfig by simply passing the values to grab from the package.json with:
  ```
    const config = require('clobfig')({ title: "@title" })
  ```

## usage
>/config/config.json:
```
{
  "value1": "one"
}
```

>/config/config.js:
```
module.exports = {
  version: "@version"
}
```

>/config/data.json:
```
{
  "somedata": "somevalue"
}
```

>/package.json:
```
{
  "title": "example app",
  "version": "0.1.0"
}
```

>/index.js:
```
const config = require('clobfig')({ title: "@title" })

console.log(config)
```

The code example above will output:
```
{
  title: "example app",
  version: "0.1.0",
  data: {
    somedata: "somevalue"
  },
  value1: "one"
}
```