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
    var PACKAGE_NAME = "sortedcontainers.data";
    var REMOTE_PACKAGE_BASE = "sortedcontainers.data";
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
      Module["FS_createPath"]("/", "lib", true, true);
      Module["FS_createPath"]("/lib", "python3.8", true, true);
      Module["FS_createPath"]("/lib/python3.8", "site-packages", true, true);
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "sortedcontainers",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "sortedcontainers-2.2.2-py3.8.egg-info",
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
          cachedOffset: 69210,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [
            0,
            1353,
            2577,
            3524,
            4619,
            5836,
            6942,
            7698,
            8880,
            10099,
            11314,
            12529,
            13737,
            14868,
            15853,
            17039,
            17823,
            18958,
            19975,
            20994,
            21894,
            22945,
            23884,
            25071,
            26145,
            27252,
            28267,
            29380,
            30535,
            31462,
            32520,
            33637,
            34721,
            35568,
            36403,
            37495,
            38431,
            39482,
            40413,
            41455,
            42385,
            43551,
            44709,
            45715,
            46713,
            47720,
            48846,
            50069,
            51137,
            52068,
            53134,
            54199,
            55297,
            56283,
            57305,
            58294,
            59315,
            60275,
            61193,
            62449,
            63738,
            65184,
            66491,
            67341,
            68085,
            69106,
          ],
          sizes: [
            1353,
            1224,
            947,
            1095,
            1217,
            1106,
            756,
            1182,
            1219,
            1215,
            1215,
            1208,
            1131,
            985,
            1186,
            784,
            1135,
            1017,
            1019,
            900,
            1051,
            939,
            1187,
            1074,
            1107,
            1015,
            1113,
            1155,
            927,
            1058,
            1117,
            1084,
            847,
            835,
            1092,
            936,
            1051,
            931,
            1042,
            930,
            1166,
            1158,
            1006,
            998,
            1007,
            1126,
            1223,
            1068,
            931,
            1066,
            1065,
            1098,
            986,
            1022,
            989,
            1021,
            960,
            918,
            1256,
            1289,
            1446,
            1307,
            850,
            744,
            1021,
            104,
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
        Module["removeRunDependency"]("datafile_sortedcontainers.data");
      }
      Module["addRunDependency"]("datafile_sortedcontainers.data");
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
      {
        filename: "/lib/python3.8/site-packages/sortedcontainers/__init__.py",
        start: 0,
        end: 2131,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/sortedcontainers/sortedlist.py",
        start: 2131,
        end: 78404,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/sortedcontainers/sorteddict.py",
        start: 78404,
        end: 100558,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/sortedcontainers/sortedset.py",
        start: 100558,
        end: 120383,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/sortedcontainers-2.2.2-py3.8.egg-info/dependency_links.txt",
        start: 120383,
        end: 120384,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/sortedcontainers-2.2.2-py3.8.egg-info/PKG-INFO",
        start: 120384,
        end: 132949,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/sortedcontainers-2.2.2-py3.8.egg-info/SOURCES.txt",
        start: 132949,
        end: 133279,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/sortedcontainers-2.2.2-py3.8.egg-info/top_level.txt",
        start: 133279,
        end: 133296,
        audio: 0,
      },
    ],
    remote_package_size: 73306,
    package_uuid: "e912bd4d-5fcd-416d-a8b2-77596c637efa",
  });
})();
