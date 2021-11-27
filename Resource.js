/*
 * External resources such as images and objs that needs to be fetched asynchornously
 * eg:
 *  Resource.define("pawn_texture", "/assets/fancy_pawn.png");
 *  Resource.define("board", "/assets/board.obj");
 *  ...
 *  await Resource.load();
 *  ...
 *  Resource.get("board");
 */
(function (_export) {
  const promises = [];
  const resources = {};

  function define(name, path, postProcess) {
    const promise = fetch(path)
      .then(response =>  response.arrayBuffer())
      .then(data => {
        if (postProcess) data = postProcess(data);
        return { name, path, data }
      });
      promises.push(promise);
  }

  async function load() {
    const results = await Promise.all(promises);
    for (const result of results) {
      resources[result.name] = result;
    }
  }
  
  function get(name) {
    const res = resources[name];
    if (!res) {
      throw new Error(`Resource ${name} is either not defined or not loaded`);
    }
    return resources[name].data;
  }

  _export.Resource = {
    define,
    load,
    get
  }
})(window);
