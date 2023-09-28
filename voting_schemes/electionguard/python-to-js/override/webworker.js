/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable no-undef */
importScripts("./pyodide.js");

async function load() {
  if (typeof self.__pyodideLoading === "undefined") {
    await loadPyodide({indexURL : './'});
  }
  return pyodide.loadPackage("bulletin_board-electionguard");
}

self.loaded = load()

onmessage = async function(e) {
  try {
    await loaded
    const data = e.data;
    for (let key of Object.keys(data)) {
      if (key !== 'python') {
        self[key] = data[key]
      }
    }

    let out;
    const results = await pyodide.runPythonAsync(data.python)
    if (results && results.toJs !== undefined) {
      out = results.toJs();
    } else {
      out = results;
    }
    self.postMessage({results: out})
  } catch (err) {
    setTimeout(() => { throw err; });
  }
}