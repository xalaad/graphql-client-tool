var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/formDataBuilder.ts
var buildFormData = (query, variables) => {
  const formData = new FormData();
  const fileMap = {};
  const uploads = {};
  Object.entries(variables).forEach(([key, value], index) => {
    if (value instanceof File || value instanceof Blob) {
      const fieldKey = `variables.${key}`;
      fileMap[index] = [fieldKey];
      uploads[index] = value;
    }
  });
  formData.append("operations", JSON.stringify({ query, variables }));
  formData.append("map", JSON.stringify(fileMap));
  Object.entries(uploads).forEach(([index, file]) => {
    formData.append(index, file);
  });
  return { formData, fileMap, uploads };
};

// src/index.ts
var GraphQLClient = class {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.defaultOptions = {
      headers: __spreadValues({ "Content-Type": "application/json" }, options.headers),
      credentials: options.credentials || "include",
      fetchFn: options.fetchFn || globalThis.fetch.bind(globalThis),
      interceptors: options.interceptors || {}
    };
  }
  /**
   * Executes a GraphQL request
   */
  request(operation, variables, options) {
    return __async(this, null, function* () {
      try {
        const { body, headers } = this.prepareRequest(operation, variables);
        const response = yield this.executeRequest(body, headers, options);
        return this.handleResponse(response);
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
  /**
   * Prepares the request body and headers
   */
  prepareRequest(operation, variables) {
    const isFileUpload = Object.values(variables || {}).some(
      (val) => val instanceof File || val instanceof Blob
    );
    if (isFileUpload) {
      const { formData } = buildFormData(operation, variables || {});
      const headers = __spreadValues({}, this.defaultOptions.headers);
      delete headers["Content-Type"];
      return { body: formData, headers };
    }
    return {
      body: JSON.stringify({ query: operation, variables }),
      headers: this.defaultOptions.headers || []
    };
  }
  /**
   * Executes the fetch request
   */
  executeRequest(body, headers, options) {
    return __async(this, null, function* () {
      var _a;
      let requestOptions = __spreadValues({
        method: "POST",
        headers,
        body,
        credentials: (options == null ? void 0 : options.credentials) || this.defaultOptions.credentials
      }, options);
      if ((_a = this.defaultOptions.interceptors) == null ? void 0 : _a.request) {
        requestOptions = this.defaultOptions.interceptors.request(requestOptions);
      }
      return this.defaultOptions.fetchFn(
        this.endpoint,
        requestOptions
      );
    });
  }
  /**
   * Handles successful response
   */
  handleResponse(response) {
    return __async(this, null, function* () {
      var _a;
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = yield response.json();
      if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
      }
      return {
        data: ((_a = this.defaultOptions.interceptors) == null ? void 0 : _a.response) ? this.defaultOptions.interceptors.response(result.data) : result.data,
        loading: false,
        error: null
      };
    });
  }
  /**
   * Handles request errors
   */
  handleError(error) {
    return {
      data: null,
      loading: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
  /**
   * Executes a GraphQL query
   */
  query(query, variables, options) {
    return __async(this, null, function* () {
      return this.request(query, variables, options);
    });
  }
  /**
   * Executes a GraphQL mutation
   */
  mutation(mutation, variables, options) {
    return __async(this, null, function* () {
      return this.request(mutation, variables, options);
    });
  }
  /**
   * Executes a GraphQL query synchronously
   */
  syncQuery(query, variables, options) {
    var _a;
    const { body, headers } = this.prepareRequest(query, variables);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", this.endpoint, false);
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      if ((options == null ? void 0 : options.credentials) === "include") {
        xhr.withCredentials = true;
      }
      xhr.send(body);
      if (xhr.status !== 200) {
        throw new Error(`HTTP ${xhr.status}: ${xhr.statusText}`);
      }
      const result = JSON.parse(xhr.responseText);
      if (result.errors) {
        throw new Error(JSON.stringify(result.errors));
      }
      return {
        data: ((_a = this.defaultOptions.interceptors) == null ? void 0 : _a.response) ? this.defaultOptions.interceptors.response(result.data) : result.data,
        loading: false,
        error: null
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
   * Executes a GraphQL mutation synchronously
   */
  syncMutation(mutation, variables, options) {
    return this.syncQuery(mutation, variables, options);
  }
};
export {
  GraphQLClient
};
