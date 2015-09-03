/* eslint func-names: 0 */

describe('UserAccounts', function() {
  var fakeModule = {};
  var fakePlugin = {};
  var initCalled = false;
  var mA = new UAModule();
  var mB = new UAModule();
  var pA = new UAPlugin();
  var pB = new UAPlugin();
  var uninitCalled = false;

  function removeModules() {
    _.each(UserAccounts._modules, function(module) {
      var name = module._id;
      delete UserAccounts._modules[name];
      delete UserAccounts[name];
    });
  }

  function removePlugins() {
    _.each(UserAccounts._plugins, function(plugin) {
      var name = plugin._id;
      delete UserAccounts._plugins[name];
      delete UserAccounts[name];
    });
  }

  mA._id = 'mA';
  mA.init = function() {
    initCalled = true;
  };
  mA.uninit = function() {
    uninitCalled = true;
  };
  mB._id = 'mB';

  pA._id = 'pA';
  pA.init = function() {
    initCalled = true;
  };
  pA.uninit = function() {
    uninitCalled = true;
  };

  pB._id = 'pB';

  describe('configure', function() {
    xit('should pass sub-options to modules and plugins', function() {
      expect(false).toBe(true);
    });
  });

  describe('modules', function() {
    xit('should return modules sorted by their position', function() {
      expect(false).toBe(true);
    });
  });

  describe('registerModule', function() {
    beforeEach(function() {
      initCalled = false;
      removeModules();
    });

    afterEach(function() {
      removeModules();
    });

    it('should check the object is an instance of UAModule', function() {
      expect(function() { UserAccounts.registerModule(fakeModule); }).toThrow();
    });

    it('should check there are no modules with the same name', function() {
      UserAccounts.registerModule(mA);
      expect(function() { UserAccounts.registerModule(mA); }).toThrow();
    });

    it('should add it to UserAccounts._modules', function() {
      UserAccounts.registerModule(mA);
      expect(UserAccounts._modules.mA).toBeDefined();
      expect(UserAccounts._modules.mA).toEqual(mA);
    });

    it('should create a new field named after the module _id', function() {
      UserAccounts.registerModule(mA);
      expect(UserAccounts.mA).toBeDefined();
      expect(UserAccounts.mA).toEqual(mA);
    });

    it('should call the init method of the module', function() {
      UserAccounts.registerModule(mA);
      expect(initCalled).toBe(true);
    });

    it('should not complain if module has no init method', function() {
      expect(function() { UserAccounts.registerModule(mB); }).not.toThrow();
      expect(initCalled).toBe(false);
    });
  });

  describe('registerPlugin', function() {
    beforeEach(function() {
      initCalled = false;
      removePlugins();
    });

    afterEach(function() {
      initCalled = false;
      removePlugins();
    });

    it('should check the object is an instance of UAPlugin', function() {
      expect(function() { UserAccounts.registerPlugin(fakePlugin); }).toThrow();
    });

    it('should check there are no plugins with the same name', function() {
      UserAccounts.registerPlugin(pA);
      expect(function() { UserAccounts.registerPlugin(pA); }).toThrow();
    });

    it('should add it to UserAccounts._plugins', function() {
      UserAccounts.registerPlugin(pA);
      expect(UserAccounts._plugins.pA).toBeDefined();
      expect(UserAccounts._plugins.pA).toEqual(pA);
    });

    it('should create a new field named after the plugin _id', function() {
      UserAccounts.registerPlugin(pA);
      expect(UserAccounts.pA).toBeDefined();
      expect(UserAccounts.pA).toEqual(pA);
    });

    it('should call the init method of the plugin', function() {
      UserAccounts.registerPlugin(pA);
      expect(initCalled).toBe(true);
    });

    it('should not complain if plugin has no init method', function() {
      expect(function() { UserAccounts.registerPlugin(pB); }).not.toThrow();
      expect(initCalled).toBe(false);
    });
  });

  describe('removeModule', function() {
    beforeEach(function() {
      uninitCalled = false;
      UserAccounts.registerModule(mA);
    });

    afterEach(function() {
      removeModules();
    });

    it('should check the module is currently registered', function() {
      expect(function() {UserAccounts.removeModule(mA._id); }).not.toThrow();
      expect(function() {UserAccounts.removeModule(mB._id); }).toThrow();
    });

    it('should remove module from UserAccounts._modules', function() {
      UserAccounts.removeModule(mA._id);
      expect(UserAccounts._modules.mA).toBeUndefined();
    });

    it('should delete the field named after the module', function() {
      UserAccounts.removeModule(mA._id);
      expect(UserAccounts.mA).toBeUndefined();
    });

    it('should call the uninit method of the module', function() {
      UserAccounts.removeModule(mA._id);
      expect(uninitCalled).toBe(true);
    });

    it('should not complain if module has no uninit method', function() {
      UserAccounts.registerModule(mB);
      expect(function() { UserAccounts.removeModule(mB._id); }).not.toThrow();
      expect(uninitCalled).toBe(false);
    });
  });

  describe('removePlugin', function() {
    beforeEach(function() {
      uninitCalled = false;
      UserAccounts.registerPlugin(pA);
    });

    afterEach(function() {
      removePlugins();
    });

    it('should check the plugin is currently registered', function() {
      expect(function() {UserAccounts.removePlugin(pA._id); }).not.toThrow();
      expect(function() {UserAccounts.removePlugin(pB._id); }).toThrow();
    });

    it('should remove plugin from UserAccounts._plugins', function() {
      UserAccounts.removePlugin(pA._id);
      expect(UserAccounts._plugins.pA).toBeUndefined();
    });

    it('should delete the field named after the plugin', function() {
      UserAccounts.removePlugin(pA._id);
      expect(UserAccounts.pA).toBeUndefined();
    });

    it('should call the uninit method of the plugin', function() {
      UserAccounts.removePlugin(pA._id);
      expect(uninitCalled).toBe(true);
    });

    it('should not complain if plugin has no uninit method', function() {
      UserAccounts.registerPlugin(pB);
      expect(function() { UserAccounts.removePlugin(pB._id); }).not.toThrow();
      expect(uninitCalled).toBe(false);
    });
  });

  describe('setLogLevel', function() {
    xit('should load log level for logger from settings or ENV', function() {
      expect(false).toBe(true);
    });
  });

  describe('startup', function() {
    xit('should register a new callback under __startupHooks', function() {
      expect(false).toBe(true);
    });
  });
});
