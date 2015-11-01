/* global
  Match: false,
  setLogLevel: false,
  UALog: true,
  UAModule: false,
  UAPlugin: false,
  UserAccounts: true
*/
'use strict';


// ------------------------------------------
//  Logs the start of execution for this file
// ------------------------------------------
UALog.trace('Loading core.js');


// ------------------------
//  Base Class Declaration
// ------------------------


// Singleton Object
UserAccounts = {

  /**
   *
   */
  _knownErrors: {},

  /**
   *
   */
  _modules: {},

  /**
   *
   */
  _notifyCallbacks: [],

  /**
   *
   */
  _plugins: {},

  /**
   *
   */
  _startupHooks: [],

  /**
   *
   */
  texts: {},

  /**
   * _startup - description
   *
   */
  _startup() {
    UALog.trace('UserAccounts._startup');

    // run the startup hooks. other calls to startup() during this can still
    // add hooks to the end.
    while (this._startupHooks.length) {
      const hook = this._startupHooks.shift();
      hook.call(this);
    }
    // Setting this to null tells Meteor.startup to call hooks immediately.
    this._startupHooks = null;
  },

  /**
   * configure - description
   *
   * @param  {Object} globalOptions description
   * @throws {Error} Will throw an error in case globalOptions contains invalid
   *     options or sub-objects referencing unexisting modules/plugins.
   */
  configure(globalOptions) {
    UALog.trace('UserAccounts.configure');

    check(globalOptions, Object);

    const objs = _.union(_.values(this._modules), _.values(this._plugins));
    let coreOptions;


    // Ask each module and each plugin to consume its own configuration options
    coreOptions = _.reduce(objs, function moduleOpts(options, obj) {
      const objName = obj._id;
      const objOptions = options[objName];

      if (objOptions) {
        if (obj.configure) {
          obj.configure(objOptions);
        } else {
          throw new Error('No configuration options expected for ' + objName);
        }
        return _.omit(options, objName);
      }
      return options;
    }, globalOptions);

    // Deal with remaining options
    // TODO: core configuration here
    coreOptions = coreOptions;
  },

  /**
   * getErrorCode - description
   *
   * @param  {type} err description
   * @return {type}     description
   */
  getErrorCode(err) {
    UALog.trace('UserAccounts.notifyError');

    check(err, Match.oneOf(Error, Meteor.Error));

    const reason = err.reason || err.message;
    const errCode = this._knownErrors[reason] || reason;

    return errCode;
  },

  /**
   * init - description
   *
   */
  init() {
    UALog.trace('UserAccounts.init');

    this._startup();
  },

  /**
   * modules - description
   *
   * @return {Array}  description
   */
  modules() {
    UALog.trace('UserAccounts.modules');

    return _.sortBy(_.values(this._modules), 'position');
  },

  /**
   * notify - description
   *
   * @param  {String} msg          description
   * @param  {String} type         description
   * @param  {Object} tmplInstance description
   */
  notify(msg, type, tmplInstance) {
    UALog.trace('UserAccounts.notify');

    check(msg, String);
    check(type, String);
    check(tmplInstance, Object);

    self._notifyCallbacks.forEach(function n(cb) {
      cb(msg, type, tmplInstance);
    });
  },

  /**
   * registerModule - description
   *
   * @param  {UAModule} module description
   * @throws {Error} Will throw an error in case a module with the same name
   *     already exists.
   */
  registerModule(module) {
    UALog.trace('UserAccounts.registerModule');

    check(module, UAModule);

    const moduleName = module._id;

    if (this._modules[moduleName] || this[moduleName]) {
      throw new Error('A module called ' + moduleName + ' is already in use!');
    }

    this._modules[moduleName] = module;
    this[moduleName] = module;

    if (module.init) {
      module.init(this);
    }
  },

  /**
   * registerNotifyCB - description
   *
   * @param  {Function} cb description
   */
  registerNotifyCB(cb) {
    UALog.trace('UserAccounts.registerNotifyCB');

    check(cb, Function);

    this._notifyCallbacks.push(cb);
  },

  /**
   * registerPlugin - description
   *
   * @param  {UAPlugin} plugin description
   * @throws {Error} Will throw an error in case a plugin with the same name
   *     already exists.
   */
  registerPlugin(plugin) {
    UALog.trace('UserAccounts.registerPlugin');

    check(plugin, UAPlugin);

    const pluginName = plugin._id;

    if (this._plugins[pluginName] || this[pluginName]) {
      throw new Error('A plugin called ' + pluginName + ' is already in use!');
    }

    this._plugins[pluginName] = plugin;
    this[pluginName] = plugin;

    if (plugin.init) {
      plugin.init(this);
    }
  },

  /**
   * removeModule - description
   *
   * @param  {string} moduleName description
   * @throws {Error} Will throw an error in case no module called *moduleName*
   *     exists.
   */
  removeModule(moduleName) {
    UALog.trace('UserAccounts.removeModule');

    check(moduleName, String);

    if (!this._modules[moduleName]) {
      throw new Error('Module ' + moduleName + ' not in use!');
    }

    const module = this._modules[moduleName];
    delete this._modules[moduleName];
    delete this[moduleName];

    if (module.uninit) {
      module.uninit(this);
    }

    return module;
  },

  /**
   * removePlugin - description
   *
   * @param  {type} pluginName description
   * @throws {Error} Will throw an error in case no plugin called *pluginName*
   *     exists.
   */
  removePlugin(pluginName) {
    UALog.trace('UserAccounts.removePlugin');

    check(pluginName, String);

    if (!this._plugins[pluginName]) {
      throw new Error('Plugin ' + pluginName + ' not in use!');
    }

    const plugin = this._plugins[pluginName];
    delete this._plugins[pluginName];
    delete this[pluginName];

    if (plugin.uninit) {
      plugin.uninit(this);
    }

    return plugin;
  },

  /**
   *
   */
  setLogLevel,

  /**
   * startup - description
   *
   * @param  {type} callback description
   */
  startup(callback) {
    UALog.trace('UserAccounts.startup');

    check(callback, Function);

    if (this._startupHooks) {
      this._startupHooks.push(callback);
    } else {
      // We already started up. Just call it now.
      callback();
    }
  },
};
