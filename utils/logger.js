const tag = (scope) => scope ? `[${scope}]` : '';

function log(scope, ...args) {
  console.log(tag(scope), ...args);
}
function info(scope, ...args) {
  console.info(tag(scope), ...args);
}
function warn(scope, ...args) {
  console.warn(tag(scope), ...args);
}
function error(scope, ...args) {
  console.error(tag(scope), ...args);
}

module.exports = { log, info, warn, error };
