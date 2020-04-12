'use strict';



;define("dashboard/adapters/-json-api", ["exports", "@ember-data/adapter/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _jsonApi.default;
    }
  });
});
;define("dashboard/adapters/application", ["exports", "@ember-data/adapter/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class ApplicationAdapter extends _jsonApi.default {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "namespace", 'api');
    }

    buildURL(...args) {
      return `${super.buildURL(...args)}.json`;
    }

  }

  _exports.default = ApplicationAdapter;
});
;define("dashboard/app", ["exports", "ember-resolver", "ember-load-initializers", "dashboard/config/environment"], function (_exports, _emberResolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class App extends Ember.Application {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "modulePrefix", _environment.default.modulePrefix);

      _defineProperty(this, "podModulePrefix", _environment.default.podModulePrefix);

      _defineProperty(this, "Resolver", _emberResolver.default);
    }

  }

  _exports.default = App;
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
});
;define("dashboard/component-managers/glimmer", ["exports", "@glimmer/component/-private/ember-component-manager"], function (_exports, _emberComponentManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _emberComponentManager.default;
    }
  });
});
;define("dashboard/components/jumbo", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const __COLOCATED_TEMPLATE__ = Ember.HTMLBars.template(
  /*
    <div class="jumbo">
    <div class="right tomster"></div>
    {{yield}}
  </div>
  */
  {
    id: "xOKffqIV",
    block: "{\"symbols\":[\"&default\"],\"statements\":[[9,\"div\",true],[12,\"class\",\"jumbo\",null],[10],[1,1,0,0,\"\\n  \"],[9,\"div\",true],[12,\"class\",\"right tomster\",null],[10],[11],[1,1,0,0,\"\\n  \"],[16,1,null],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[]}",
    meta: {
      moduleName: "dashboard/components/jumbo.hbs"
    }
  });

  var _default = Ember._setComponentTemplate(__COLOCATED_TEMPLATE__, Ember._templateOnlyComponent());

  _exports.default = _default;
});
;define("dashboard/components/map", ["exports", "@glimmer/component", "dashboard/config/environment"], function (_exports, _component, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const __COLOCATED_TEMPLATE__ = Ember.HTMLBars.template(
  /*
    <div class="map">
    <img
      alt="Map image at coordinates {{@lat}},{{@lng}}"
      ...attributes
      src={{this.src}}
      width={{@width}} height={{@height}}
    >
  </div>
  */
  {
    id: "TwkMEkPM",
    block: "{\"symbols\":[\"@lng\",\"@lat\",\"&attrs\",\"@width\",\"@height\"],\"statements\":[[9,\"div\",true],[12,\"class\",\"map\",null],[10],[1,1,0,0,\"\\n  \"],[9,\"img\",false],[14,\"alt\",[32,[\"Map image at coordinates \",[27,[24,2],[]],\",\",[27,[24,1],[]]]],null],[15,3],[14,\"src\",[27,[24,0],[\"src\"]],null],[14,\"width\",[27,[24,4],[]],null],[14,\"height\",[27,[24,5],[]],null],[10],[11],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[]}",
    meta: {
      moduleName: "dashboard/components/map.hbs"
    }
  });

  const MAPBOX_API = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static';

  class MapComponent extends _component.default {
    get src() {
      let {
        lng,
        lat,
        width,
        height,
        zoom
      } = this.args;
      let coordinates = `${lng},${lat},${zoom}`;
      let dimensions = `${width}x${height}`;
      let accessToken = `access_token=${this.token}`;
      return `${MAPBOX_API}/${coordinates}/${dimensions}@2x?${accessToken}`;
    }

    get token() {
      return encodeURIComponent(_environment.default.MAPBOX_ACCESS_TOKEN);
    }

  }

  _exports.default = MapComponent;

  Ember._setComponentTemplate(__COLOCATED_TEMPLATE__, MapComponent);
});
;define("dashboard/components/nav-bar", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const __COLOCATED_TEMPLATE__ = Ember.HTMLBars.template(
  /*
    <nav class="menu">
    <LinkTo @route="index" class="menu-index">
      <h1>Hydrobot</h1>
    </LinkTo>
    <div class="links">
      <LinkTo @route="reports" class="menu-reports">
        Reports
      </LinkTo>
    </div>
  </nav>
  */
  {
    id: "NKLR/Yj8",
    block: "{\"symbols\":[],\"statements\":[[9,\"nav\",true],[12,\"class\",\"menu\",null],[10],[1,1,0,0,\"\\n  \"],[7,\"link-to\",[[23,\"class\",\"menu-index\",null]],[[\"@route\"],[\"index\"]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"\\n    \"],[9,\"h1\",true],[10],[1,1,0,0,\"Hydrobot\"],[11],[1,1,0,0,\"\\n  \"]],\"parameters\":[]}]]],[1,1,0,0,\"\\n  \"],[9,\"div\",true],[12,\"class\",\"links\",null],[10],[1,1,0,0,\"\\n    \"],[7,\"link-to\",[[23,\"class\",\"menu-reports\",null]],[[\"@route\"],[\"reports\"]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"\\n      Reports\\n    \"]],\"parameters\":[]}]]],[1,1,0,0,\"\\n  \"],[11],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[]}",
    meta: {
      moduleName: "dashboard/components/nav-bar.hbs"
    }
  });

  var _default = Ember._setComponentTemplate(__COLOCATED_TEMPLATE__, Ember._templateOnlyComponent());

  _exports.default = _default;
});
;define("dashboard/components/sensor", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const __COLOCATED_TEMPLATE__ = Ember.HTMLBars.template(
  /*
    <article class="rental">
    <div class="details">
    <h3>
        <LinkTo @route="sensor" @model={{@sensor}}>
          {{@sensor.title}}
        </LinkTo>
      </h3>
      <div class="detail owner">
        <span>Owner:</span> {{@sensor.owner}}
      </div>
      <div class="detail type">
        <span>Type:</span> {{@sensor.type}}
      </div>
      <div class="detail location">
        <span>Location:</span> {{@sensor.city}}
      </div>
      <div class="detail bedrooms">
        <span>Number of bedrooms:</span> {{@sensor.bedrooms}}
      </div>
    </div>
    <Map
      @lat={{@sensor.location.lat}}
      @lng={{@sensor.location.lng}}
      @zoom="9"
      @width="150"
      @height="150"
      alt="A map of {{@sensor.title}}"
    />
  </article>
  */
  {
    id: "lUmfer4C",
    block: "{\"symbols\":[\"@sensor\"],\"statements\":[[9,\"article\",true],[12,\"class\",\"rental\",null],[10],[1,1,0,0,\"\\n  \"],[9,\"div\",true],[12,\"class\",\"details\",null],[10],[1,1,0,0,\"\\n  \"],[9,\"h3\",true],[10],[1,1,0,0,\"\\n      \"],[7,\"link-to\",[],[[\"@route\",\"@model\"],[\"sensor\",[27,[24,1],[]]]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"\\n        \"],[1,0,0,0,[27,[24,1],[\"title\"]]],[1,1,0,0,\"\\n      \"]],\"parameters\":[]}]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail owner\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Owner:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"owner\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail type\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Type:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"type\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail location\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Location:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"city\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail bedrooms\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Number of bedrooms:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"bedrooms\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n  \"],[11],[1,1,0,0,\"\\n  \"],[7,\"map\",[[14,\"alt\",[32,[\"A map of \",[27,[24,1],[\"title\"]]]],null]],[[\"@lat\",\"@lng\",\"@zoom\",\"@width\",\"@height\"],[[27,[24,1],[\"location\",\"lat\"]],[27,[24,1],[\"location\",\"lng\"]],\"9\",\"150\",\"150\"]],null],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[]}",
    meta: {
      moduleName: "dashboard/components/sensor.hbs"
    }
  });

  var _default = Ember._setComponentTemplate(__COLOCATED_TEMPLATE__, Ember._templateOnlyComponent());

  _exports.default = _default;
});
;define("dashboard/components/sensor/detailed", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const __COLOCATED_TEMPLATE__ = Ember.HTMLBars.template(
  /*
    <Jumbo>
    <h2>{{@sensor.title}}</h2>
  </Jumbo>
  
  <article class="sensor detailed">
  <div class="details">
      <h3>About {{@sensor.title}}</h3>
  
      <div class="detail owner">
        <span>Owner:</span> {{@sensor.owner}}
      </div>
      <div class="detail type">
        <span>Type:</span> {{@sensor.type}} – {{@sensor.category}}
      </div>
      <div class="detail location">
        <span>Location:</span> {{@sensor.city}}
      </div>
      <div class="detail bedrooms">
        <span>Number of bedrooms:</span> {{@sensor.bedrooms}}
      </div>
      <div class="detail description">
        <p>{{@sensor.description}}</p>
      </div>
    </div>
  
  <Map
      @lat={{@sensor.location.lat}}
      @lng={{@sensor.location.lng}}
      @zoom="12"
      @width="894"
      @height="600"
      alt="A map of {{@sensor.title}}"
      class="large"
    />
  </article>
  */
  {
    id: "jwmkwbpu",
    block: "{\"symbols\":[\"@sensor\"],\"statements\":[[7,\"jumbo\",[],[[],[]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"\\n  \"],[9,\"h2\",true],[10],[1,0,0,0,[27,[24,1],[\"title\"]]],[11],[1,1,0,0,\"\\n\"]],\"parameters\":[]}]]],[1,1,0,0,\"\\n\\n\"],[9,\"article\",true],[12,\"class\",\"sensor detailed\",null],[10],[1,1,0,0,\"\\n\"],[9,\"div\",true],[12,\"class\",\"details\",null],[10],[1,1,0,0,\"\\n    \"],[9,\"h3\",true],[10],[1,1,0,0,\"About \"],[1,0,0,0,[27,[24,1],[\"title\"]]],[11],[1,1,0,0,\"\\n\\n    \"],[9,\"div\",true],[12,\"class\",\"detail owner\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Owner:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"owner\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail type\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Type:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"type\"]]],[1,1,0,0,\" \u2013 \"],[1,0,0,0,[27,[24,1],[\"category\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail location\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Location:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"city\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail bedrooms\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"span\",true],[10],[1,1,0,0,\"Number of bedrooms:\"],[11],[1,1,0,0,\" \"],[1,0,0,0,[27,[24,1],[\"bedrooms\"]]],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n    \"],[9,\"div\",true],[12,\"class\",\"detail description\",null],[10],[1,1,0,0,\"\\n      \"],[9,\"p\",true],[10],[1,0,0,0,[27,[24,1],[\"description\"]]],[11],[1,1,0,0,\"\\n    \"],[11],[1,1,0,0,\"\\n  \"],[11],[1,1,0,0,\"\\n\\n\"],[7,\"map\",[[14,\"alt\",[32,[\"A map of \",[27,[24,1],[\"title\"]]]],null],[23,\"class\",\"large\",null]],[[\"@lat\",\"@lng\",\"@zoom\",\"@width\",\"@height\"],[[27,[24,1],[\"location\",\"lat\"]],[27,[24,1],[\"location\",\"lng\"]],\"12\",\"894\",\"600\"]],null],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[]}",
    meta: {
      moduleName: "dashboard/components/sensor/detailed.hbs"
    }
  });

  var _default = Ember._setComponentTemplate(__COLOCATED_TEMPLATE__, Ember._templateOnlyComponent());

  _exports.default = _default;
});
;define("dashboard/components/welcome-page", ["exports", "ember-welcome-page/components/welcome-page"], function (_exports, _welcomePage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
;define("dashboard/data-adapter", ["exports", "@ember-data/debug"], function (_exports, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _debug.default;
    }
  });
});
;define("dashboard/helpers/app-version", ["exports", "dashboard/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version; // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;
    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } // Fallback to just version


      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("dashboard/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("dashboard/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _singularize.default;
  _exports.default = _default;
});
;define("dashboard/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "dashboard/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let name, version;

  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("dashboard/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("dashboard/initializers/ember-data-data-adapter", ["exports", "@ember-data/debug/setup"], function (_exports, _setup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _setup.default;
    }
  });
});
;define("dashboard/initializers/ember-data", ["exports", "ember-data", "ember-data/setup-container"], function (_exports, _emberData, _setupContainer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*
    This code initializes EmberData in an Ember application.
  
    It ensures that the `store` service is automatically injected
    as the `store` property on all routes and controllers.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("dashboard/initializers/export-application-global", ["exports", "dashboard/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize() {
    var application = arguments[1] || arguments[0];

    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;

      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;
        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);

            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("dashboard/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (_exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
  _exports.default = _default;
});
;define("dashboard/models/sensor", ["exports", "@ember-data/model"], function (_exports, _model) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _temp;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  const COMMUNITY_CATEGORIES = ['Condo', 'Townhouse', 'Apartment'];
  let SensorModel = (_class = (_temp = class SensorModel extends _model.default {
    constructor(...args) {
      super(...args);

      _initializerDefineProperty(this, "title", _descriptor, this);

      _initializerDefineProperty(this, "owner", _descriptor2, this);

      _initializerDefineProperty(this, "city", _descriptor3, this);

      _initializerDefineProperty(this, "location", _descriptor4, this);

      _initializerDefineProperty(this, "category", _descriptor5, this);

      _initializerDefineProperty(this, "image", _descriptor6, this);

      _initializerDefineProperty(this, "bedrooms", _descriptor7, this);

      _initializerDefineProperty(this, "description", _descriptor8, this);
    }

    get type() {
      if (COMMUNITY_CATEGORIES.includes(this.category)) {
        return 'Community';
      } else {
        return 'Standalone';
      }
    }

  }, _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "title", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "owner", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "city", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "location", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "category", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "image", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "bedrooms", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "description", [_model.attr], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class);
  _exports.default = SensorModel;
});
;define("dashboard/router", ["exports", "dashboard/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class Router extends Ember.Router {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "location", _environment.default.locationType);

      _defineProperty(this, "rootURL", _environment.default.rootURL);
    }

  }

  _exports.default = Router;
  Router.map(function () {
    this.route('reports');
    this.route('sensor', {
      path: '/sensors/:sensor_id'
    });
  });
});
;define("dashboard/routes/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _class, _descriptor, _temp;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  let IndexRoute = (_class = (_temp = class IndexRoute extends Ember.Route {
    constructor(...args) {
      super(...args);

      _initializerDefineProperty(this, "store", _descriptor, this);
    }

    async model() {
      return this.store.findAll('sensor');
    }

  }, _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [Ember.inject.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class);
  _exports.default = IndexRoute;
});
;define("dashboard/routes/sensor", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _class, _descriptor, _temp;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  // This class is for specific sensor details,
  // the index route is for all sensors
  let SensorRoute = (_class = (_temp = class SensorRoute extends Ember.Route {
    constructor(...args) {
      super(...args);

      _initializerDefineProperty(this, "store", _descriptor, this);
    }

    async model(params) {
      return this.store.find('sensor', params.sensor_id);
    }

  }, _temp), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "store", [Ember.inject.service], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class);
  _exports.default = SensorRoute;
});
;define("dashboard/serializers/-default", ["exports", "@ember-data/serializer/json"], function (_exports, _json) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _json.default;
    }
  });
});
;define("dashboard/serializers/-json-api", ["exports", "@ember-data/serializer/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _jsonApi.default;
    }
  });
});
;define("dashboard/serializers/-rest", ["exports", "@ember-data/serializer/rest"], function (_exports, _rest) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _rest.default;
    }
  });
});
;define("dashboard/serializers/application", ["exports", "@ember-data/serializer/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class ApplicationSerializer extends _jsonApi.default {}

  _exports.default = ApplicationSerializer;
});
;define("dashboard/services/store", ["exports", "ember-data/store"], function (_exports, _store) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _store.default;
    }
  });
});
;define("dashboard/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "YcBOkfQI",
    "block": "{\"symbols\":[],\"statements\":[[9,\"div\",true],[12,\"class\",\"container\",null],[10],[1,1,0,0,\"\\n  \"],[7,\"nav-bar\",[],[[],[]],null],[1,1,0,0,\"\\n  \"],[9,\"div\",true],[12,\"class\",\"body\",null],[10],[1,1,0,0,\"\\n    \"],[1,0,0,0,[31,0,0,[27,[26,1,\"CallHead\"],[]],[[31,0,0,[27,[26,0,\"CallHead\"],[]],null,null]],null]],[1,1,0,0,\"\\n  \"],[11],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[\"-outlet\",\"component\"]}",
    "meta": {
      "moduleName": "dashboard/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;define("dashboard/templates/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "GdzE/IZs",
    "block": "{\"symbols\":[\"summary\",\"@model\"],\"statements\":[[7,\"jumbo\",[],[[],[]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"\\n  \"],[9,\"h2\",true],[10],[1,1,0,0,\"Welcome!\"],[11],[1,1,0,0,\"\\n  \"],[9,\"p\",true],[10],[1,1,0,0,\"Here is some random text.\"],[11],[1,1,0,0,\"\\n  \"],[7,\"link-to\",[[23,\"class\",\"button\",null]],[[\"@route\"],[\"reports\"]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"Reports\"]],\"parameters\":[]}]]],[1,1,0,0,\"\\n\"]],\"parameters\":[]}]]],[1,1,0,0,\"\\n\\n\"],[9,\"div\",true],[12,\"class\",\"rentals\",null],[10],[1,1,0,0,\"\\n  \"],[9,\"ul\",true],[12,\"class\",\"results\",null],[10],[1,1,0,0,\"\\n\"],[5,[27,[26,1,\"BlockHead\"],[]],[[31,0,0,[27,[26,0,\"CallHead\"],[]],[[31,0,0,[27,[26,0,\"CallHead\"],[]],[[27,[24,2],[]]],null]],null]],null,[[\"default\"],[{\"statements\":[[1,1,0,0,\"      \\t      \"],[9,\"li\",true],[10],[7,\"sensor\",[],[[\"@sensor\"],[[27,[24,1],[]]]],null],[11],[1,1,0,0,\"\\n\"]],\"parameters\":[1]}]]],[1,1,0,0,\"  \"],[11],[1,1,0,0,\"\\n\"],[11]],\"hasEval\":false,\"upvars\":[\"-track-array\",\"each\"]}",
    "meta": {
      "moduleName": "dashboard/templates/index.hbs"
    }
  });

  _exports.default = _default;
});
;define("dashboard/templates/reports", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "lIafHNDP",
    "block": "{\"symbols\":[],\"statements\":[[7,\"jumbo\",[],[[],[]],[[\"default\"],[{\"statements\":[[1,1,0,0,\"\\n  \"],[9,\"h2\",true],[10],[1,1,0,0,\"Reports\"],[11],[1,1,0,0,\"\\n  \"],[9,\"p\",true],[10],[1,1,0,0,\"\\n    This will be report management; create, update, delete.\\n  \"],[11],[1,1,0,0,\"\\n\"]],\"parameters\":[]}]]]],\"hasEval\":false,\"upvars\":[]}",
    "meta": {
      "moduleName": "dashboard/templates/reports.hbs"
    }
  });

  _exports.default = _default;
});
;define("dashboard/templates/sensor", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "mPzkgt3B",
    "block": "{\"symbols\":[\"@model\"],\"statements\":[[7,\"sensor/detailed\",[],[[\"@sensor\"],[[27,[24,1],[]]]],null]],\"hasEval\":false,\"upvars\":[]}",
    "meta": {
      "moduleName": "dashboard/templates/sensor.hbs"
    }
  });

  _exports.default = _default;
});
;define("dashboard/transforms/boolean", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.BooleanTransform;
    }
  });
});
;define("dashboard/transforms/date", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.DateTransform;
    }
  });
});
;define("dashboard/transforms/number", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.NumberTransform;
    }
  });
});
;define("dashboard/transforms/string", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.StringTransform;
    }
  });
});
;

;define('dashboard/config/environment', [], function() {
  var prefix = 'dashboard';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("dashboard/app")["default"].create({"name":"dashboard","version":"0.0.0+7e9dd2f9"});
          }
        
//# sourceMappingURL=dashboard.map
