/**
 * Module dependencies.
 */
const fs = require('fs')
const path = require('path')
const merge = require('deepmerge')
const appRoot = require('app-root-path')

class Clobfig {

	constructor(opts = {}) {
		/// Ensure that a config folder name is set upon construction
		opts.configFolderName = opts.configFolderName || 'config'
		opts.relativePath = opts.relativePath || path.join(__dirname, `../${opts.configFolderName}`)

		const calculatedAppRoot = !!require.main ? path.dirname(require.main.filename) : (!!process.mainModule ? path.dirname(process.mainModule.filename) : process.cwd())

		/// Determine root configuration folder
		this._configFilePathRelative = opts.relativePath
		this._configFilePathAppRoot = fs.existsSync(calculatedAppRoot) ? calculatedAppRoot : appRoot.path

		/// include files that match this in their filename (including extension)
		this._configSelectors = opts.configSelectors || ['config.js']
		this._dataSelectors = opts.dataSelectors || ['.json']

		const relativePathExists = fs.existsSync(this._configFilePathRelative)
		const appRootPathExists = !relativePathExists ? fs.existsSync(this._configFilePathAppRoot) : false

		if (!relativePathExists && !appRootPathExists) {
			return
		}

		this._appRootPath = path.resolve(relativePathExists ? this._configFilePathRelative : this._configFilePathAppRoot)
		this._configFilePath = path.join(this._appRootPath, opts.configFolderName)
		
		opts.configFilePath = this._configFilePath
		appRoot.setPath(this._appRootPath)
		this.getConfig(opts)
	}

	getConfigurationFilesData(opts = {}) {
		/// Set the new config folder
		this._configFilePath = !!opts.configFilePath ? opts.configFilePath : this._configFilePath

		/// Start with the basics
		const base = {
			// Unofficial
			_configFilePathRelative: this._configFilePathRelative,
			_configFilePathAppRoot: this._configFilePathAppRoot,
			_configSelectors: this._configSelectors,
			_configFiles: this._configFiles,
			_dataSelectors: this._dataSelectors,
			_dataFiles: this._dataFiles,

			// Official
			appRootPath: this._appRootPath,
			configFilePath: this._configFilePath,
			...opts,
		}

		/// Get all of the config files in the configuration folder
		const allFilesInConfigFolder = fs.existsSync(this._configFilePath) ? fs.readdirSync(this._configFilePath) : []
		const packageJson = this.getPackageJson()
		const configFiles = []
		const dataFilesAdded = {}
		let dataFiles = []

		/// Schema for pulling values from the package.json
		const jsonInjectSchema = (n, v, o) => v === `@${n}`
		const injectPackageJsonValues = (out, configField) => 
		{ out[configField] = typeof packageJson[configField] !== 'undefined' && jsonInjectSchema(configField, out[configField]) ? packageJson[configField] : out[configField] ; return out }

		const filterConfigFiles = (filename) => this._configSelectors.reduce((o, s) => o || filename.indexOf(s) !== -1, false)
		const filterDataFiles = (filename) => this._dataSelectors.reduce((o, s) => o || (filename !== 'config.json' && filename.indexOf(s) !== -1), false)
		const addEachDataFile = (dataFilename) => dataFilesAdded[dataFilename.replace('.json', '')] = require(path.join(this._configFilePath, dataFilename))
		const clobber = (out, configFilename) => merge(out, require(path.join(this._configFilePath, configFilename)))
		const reorderConfigFiles = (configFilename) => configFilename.indexOf('config.json') !== -1 && configFiles.length ? configFiles.unshift(configFilename) : configFiles.push(configFilename)

		try {
			let configJs = {}
			/// Get all of the config files in the configuration folder that match these selectors to be clobbed together
			this._configFiles = allFilesInConfigFolder.filter(filterConfigFiles)

			/// Add the data from each of the data files to the clobfig object (ex: pages.json => clobfig.pages)
			this._configFiles.forEach(reorderConfigFiles)

			/// Push the config.js file to the end (as it should be the final stop)
			if (configFiles.indexOf('config.js') !== -1) {
				configJs = require(path.join(this._configFilePath, 'config.js'))
				configFiles.splice(configFiles.indexOf('config.js'), 1)
			}

			/// Get all of the json data files in the configuration folder that match these selectors to be added to the config under the name of the json file
			this._dataFiles = dataFiles = allFilesInConfigFolder.filter(filterDataFiles)
			/// Add the data from each of the data files to the clobfig object (ex: pages.json => clobfig.pages)
			this._dataFiles.forEach(addEachDataFile)

			/// clobber all of the files matching with 'config.js' in the filename together, starting with the added objects
			const clobberedConfig = configFiles.reduce(clobber, {})

			this.config = merge.all([base, clobberedConfig, dataFilesAdded, configJs])
			
			/// finally infect the config with select values from the package json that are set to NaN
			this.config = Object.keys(this.config).reduce(injectPackageJsonValues, this.config)

			/// Resave the debug state
			this.config._configFiles = configFiles
			/// Resave the debug state
			this.config._dataFiles = dataFiles
			this.config._configJsFileRanLast = !!configJs

		} catch(e) {
			const error = new Error(e.message)
			error.name = 'Fatal Clobfig Error'
			error.code = 0

			throw error
		}

	}

	getPackageJson(appRootPath = this._appRootPath) {
		const packageJsonFilePath = path.join(appRootPath, 'package.json')

		if (fs.existsSync(packageJsonFilePath)) {
			return require(packageJsonFilePath)
		}

		return {}
	}

	getConfig(initialOpts = {}) {

		/// If the configFilePath is set, get new config data
		if (!!initialOpts.configFilePath) {
			this.getConfigurationFilesData(initialOpts)
		}

		/// If the current config is not set, meaning the configFilePath returned nothing, then there's only the initialOpts to provide
		if (!this.config) {
			return initialOpts
		}

		/// Return the config currently set
		return this.config

	}

}

const ClobfigFactory = (initialOpts = {}) => {
	/// TODO: add support for initialOpts being passed in an as an array of config files to load
	initialOpts = typeof initialOpts === 'string' ? {
		configFolderName: initialOpts
	} : initialOpts

	const clobfig = new Clobfig(initialOpts)

	const config = clobfig.getConfig()

	config.Clobfig = Clobfig
	config.AppRoot = appRoot

	return config

}

/// Return the clobfiguration factory method [ usage: const config = require('clobfig)() ]
module.exports = ClobfigFactory
