const pkgJson = require('../../package.json');

// You are than welcome to extend this class to customize class name/default message/parameters
// more adequately reflecting your error state
class Exception extends Error {
  constructor(
    // To support patterns new Exception(err)
    // and new Exception({message: '...', innerError: err})
    // we accept these two universally trough first parameter
    params,
    defaultParams = {
      message: 'Exception occured',
      statusCode: 500,
      innerError: undefined,
      fields: undefined, // Server validation scenrios and similar, to show field specific issues
      augmentStack: true // False will save resources if you use throw instead return (which isn't recommended)
    },
  ) {
    let constructorParameters = defaultParams;
    if (params && !params.stack) {
      constructorParameters = params;
    }
    super(constructorParameters.message || defaultParams.message);

    if (augmentStack) {
      // Capturing stack trace and excluding constructor call from it.
      // This requires some explanation i believe:
      // implementing exception bubbling trough async code is still
      // painfull in Node. So we are using stacktrace concatenation to workaround that
      //
      // So error handling pattern becomes like:
      // try {
      //   await someAsyncCode...
      // } catch (err) {
      //   throw new Exception(err);
      // }
      //
      // It works with promises too:
      // new Promise((success, failure) => {
      //   originalPromise.then(_ => success(_)).catch(err => failure(new Exception(err)));
      // });
      Error.captureStackTrace(this, this.constructor);
      if (params && params.stack) {
        this.stack += `\n${params.stack}`;
        if (params.message) {
          this.cause = params; // 4 Sentry to see it
        }
      } else if (constructorParameters.innerError && constructorParameters.innerError.stack) {
        this.stack += `\n${constructorParameters.innerError.stack}`;
        if (constructorParameters.innerError.message) {
          this.cause = constructorParameters.innerError; // 4 Sentry to see it
        }
      }
    }

    // Saving namespace for exception type comparison (comparing types itself is tricky in Node)
    this.name = `${pkgJson.name.toUpperCase()}.${this.constructor.name}`;

    // Most commonly it will be HTTP status,
    // but can be any other convention dictated by library throwing it
    this.statusCode = constructorParameters.statusCode || defaultParams.statusCode;

    // To bubble fields too from originated exception
    this.fields = constructorParameters.fields
      || (constructorParameters.innerError && constructorParameters.innerError.fields);
  }

  inspect() {
    // TODO good idea to have beautification option
    const errKey = (this.stack && this.stack.indexOf(this.message) < 0)
      ? JSON.stringify(`${this.name}+${this.message}`)
      : JSON.stringify(this.name);
    const result = { fields: this.fields };
    result[errKey] = this.stack || '<no stacktrace>';
    return JSON.stringify(result);
  }
}

module.exports = Exception;
