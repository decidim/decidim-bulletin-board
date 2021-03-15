var Module = typeof pyodide._module !== "undefined" ? pyodide._module : {};
Module.checkABI(1);
if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function () {
  var loadPackage = function (metadata) {
    var PACKAGE_PATH;
    if (typeof window === "object") {
      PACKAGE_PATH = window["encodeURIComponent"](
        window.location.pathname
          .toString()
          .substring(0, window.location.pathname.toString().lastIndexOf("/")) +
          "/"
      );
    } else if (typeof location !== "undefined") {
      PACKAGE_PATH = encodeURIComponent(
        location.pathname
          .toString()
          .substring(0, location.pathname.toString().lastIndexOf("/")) + "/"
      );
    } else {
      throw "using preloaded data can only be done on a web page or in a web worker";
    }
    var PACKAGE_NAME = "rsa.data";
    var REMOTE_PACKAGE_BASE = "rsa.data";
    if (
      typeof Module["locateFilePackage"] === "function" &&
      !Module["locateFile"]
    ) {
      Module["locateFile"] = Module["locateFilePackage"];
      err(
        "warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)"
      );
    }
    var REMOTE_PACKAGE_NAME = Module["locateFile"]
      ? Module["locateFile"](REMOTE_PACKAGE_BASE, "")
      : REMOTE_PACKAGE_BASE;
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", packageName, true);
      xhr.responseType = "arraybuffer";
      xhr.onprogress = function (event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size,
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil((total * Module.expectedDataFileDownloads) / num);
          if (Module["setStatus"])
            Module["setStatus"](
              "Downloading data... (" + loaded + "/" + total + ")"
            );
        } else if (!Module.dataFileDownloads) {
          if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
        }
      };
      xhr.onerror = function (event) {
        throw new Error("NetworkError for: " + packageName);
      };
      xhr.onload = function (event) {
        if (
          xhr.status == 200 ||
          xhr.status == 304 ||
          xhr.status == 206 ||
          (xhr.status == 0 && xhr.response)
        ) {
          var packageData = xhr.response;
          callback(packageData);
        } else {
          throw new Error(xhr.statusText + " : " + xhr.responseURL);
        }
      };
      xhr.send(null);
    }
    function handleError(error) {
      console.error("package error:", error);
    }
    var fetchedCallback = null;
    var fetched = Module["getPreloadedPackage"]
      ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE)
      : null;
    if (!fetched)
      fetchRemotePackage(
        REMOTE_PACKAGE_NAME,
        REMOTE_PACKAGE_SIZE,
        function (data) {
          if (fetchedCallback) {
            fetchedCallback(data);
            fetchedCallback = null;
          } else {
            fetched = data;
          }
        },
        handleError
      );
    function runWithFS() {
      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
      Module["FS_createPath"]("/", "bin", true, true);
      Module["FS_createPath"]("/", "lib", true, true);
      Module["FS_createPath"]("/lib", "python3.8", true, true);
      Module["FS_createPath"]("/lib/python3.8", "site-packages", true, true);
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "rsa-4.6-py3.8.egg-info",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "rsa",
        true,
        true
      );
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function (mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module["addRunDependency"]("fp " + this.name);
        },
        send: function () {},
        onload: function () {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function (byteArray) {
          var that = this;
          Module["FS_createPreloadedFile"](
            this.name,
            null,
            byteArray,
            true,
            true,
            function () {
              Module["removeRunDependency"]("fp " + that.name);
            },
            function () {
              if (that.audio) {
                Module["removeRunDependency"]("fp " + that.name);
              } else {
                err("Preloading file " + that.name + " failed");
              }
            },
            false,
            true
          );
          this.requests[this.name] = null;
        },
      };
      function processPackageData(arrayBuffer) {
        Module.finishedDataFileDownloads++;
        assert(arrayBuffer, "Loading data file failed.");
        assert(
          arrayBuffer instanceof ArrayBuffer,
          "bad input to processPackageData"
        );
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        var compressedData = {
          data: null,
          cachedOffset: 56567,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [
            0,
            391,
            1650,
            2799,
            4251,
            5759,
            6826,
            8049,
            9481,
            10896,
            12125,
            13546,
            15095,
            16445,
            17924,
            19301,
            20914,
            21968,
            23161,
            24479,
            25842,
            27092,
            28248,
            29662,
            31106,
            32270,
            33550,
            34814,
            35956,
            36934,
            38436,
            39504,
            40630,
            41924,
            42997,
            44313,
            45336,
            46508,
            47472,
            48697,
            50040,
            51334,
            52733,
            54174,
            55244,
          ],
          sizes: [
            391,
            1259,
            1149,
            1452,
            1508,
            1067,
            1223,
            1432,
            1415,
            1229,
            1421,
            1549,
            1350,
            1479,
            1377,
            1613,
            1054,
            1193,
            1318,
            1363,
            1250,
            1156,
            1414,
            1444,
            1164,
            1280,
            1264,
            1142,
            978,
            1502,
            1068,
            1126,
            1294,
            1073,
            1316,
            1023,
            1172,
            964,
            1225,
            1343,
            1294,
            1399,
            1441,
            1070,
            1323,
          ],
          successes: [
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
          ],
        };
        compressedData.data = byteArray;
        assert(
          typeof Module.LZ4 === "object",
          "LZ4 not present - was your app build with  -s LZ4=1  ?"
        );
        Module.LZ4.loadPackage({
          metadata: metadata,
          compressedData: compressedData,
        });
        Module["removeRunDependency"]("datafile_rsa.data");
      }
      Module["addRunDependency"]("datafile_rsa.data");
      if (!Module.preloadResults) Module.preloadResults = {};
      Module.preloadResults[PACKAGE_NAME] = { fromCache: false };
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    }
    if (Module["calledRun"]) {
      runWithFS();
    } else {
      if (!Module["preRun"]) Module["preRun"] = [];
      Module["preRun"].push(runWithFS);
    }
  };
  loadPackage({
    files: [
      { filename: "/bin/pyrsa-verify", start: 0, end: 380, audio: 0 },
      { filename: "/bin/pyrsa-encrypt", start: 380, end: 762, audio: 0 },
      { filename: "/bin/pyrsa-decrypt", start: 762, end: 1144, audio: 0 },
      { filename: "/bin/pyrsa-keygen", start: 1144, end: 1524, audio: 0 },
      { filename: "/bin/pyrsa-sign", start: 1524, end: 1900, audio: 0 },
      { filename: "/bin/pyrsa-priv2pub", start: 1900, end: 2284, audio: 0 },
      {
        filename:
          "/lib/python3.8/site-packages/rsa-4.6-py3.8.egg-info/dependency_links.txt",
        start: 2284,
        end: 2285,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/rsa-4.6-py3.8.egg-info/PKG-INFO",
        start: 2285,
        end: 5856,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/rsa-4.6-py3.8.egg-info/requires.txt",
        start: 5856,
        end: 5870,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/rsa-4.6-py3.8.egg-info/SOURCES.txt",
        start: 5870,
        end: 6775,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/rsa-4.6-py3.8.egg-info/top_level.txt",
        start: 6775,
        end: 6779,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/rsa-4.6-py3.8.egg-info/entry_points.txt",
        start: 6779,
        end: 6992,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/transform.py",
        start: 6992,
        end: 9192,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/util.py",
        start: 9192,
        end: 12178,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/__init__.py",
        start: 12178,
        end: 13720,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/asn1.py",
        start: 13720,
        end: 15475,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/prime.py",
        start: 15475,
        end: 20580,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/randnum.py",
        start: 20580,
        end: 23244,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/pkcs1_v2.py",
        start: 23244,
        end: 26677,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/common.py",
        start: 26677,
        end: 31345,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/pkcs1.py",
        start: 31345,
        end: 46860,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/parallel.py",
        start: 46860,
        end: 49186,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/_compat.py",
        start: 49186,
        end: 50672,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/cli.py",
        start: 50672,
        end: 60643,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/key.py",
        start: 60643,
        end: 86334,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/pem.py",
        start: 86334,
        end: 90310,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/rsa/core.py",
        start: 90310,
        end: 91971,
        audio: 0,
      },
    ],
    remote_package_size: 60663,
    package_uuid: "75b9a602-9617-4046-98be-42a2d131e6df",
  });
})();
