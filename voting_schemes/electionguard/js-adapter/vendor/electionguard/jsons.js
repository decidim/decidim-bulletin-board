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
    var PACKAGE_NAME = "jsons.data";
    var REMOTE_PACKAGE_BASE = "jsons.data";
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
        "jsons",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/jsons",
        "deserializers",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/jsons",
        "serializers",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/jsons",
        "classes",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "jsons-1.2.0-py3.8.egg-info",
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
          cachedOffset: 71453,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [
            0,
            990,
            2076,
            2567,
            3312,
            4480,
            5813,
            6970,
            8109,
            9179,
            10169,
            11226,
            12555,
            13841,
            14976,
            16237,
            17434,
            18535,
            19593,
            20872,
            22131,
            23445,
            24618,
            25661,
            26601,
            27530,
            28949,
            29956,
            31367,
            32564,
            33858,
            34733,
            35746,
            36881,
            38202,
            39221,
            40438,
            41487,
            42484,
            43685,
            44795,
            46026,
            47057,
            48276,
            49191,
            50428,
            51554,
            52573,
            53546,
            54700,
            55844,
            56928,
            58160,
            59434,
            60669,
            61689,
            63001,
            64169,
            65230,
            65797,
            66627,
            67800,
            68990,
            70174,
            71134,
          ],
          sizes: [
            990,
            1086,
            491,
            745,
            1168,
            1333,
            1157,
            1139,
            1070,
            990,
            1057,
            1329,
            1286,
            1135,
            1261,
            1197,
            1101,
            1058,
            1279,
            1259,
            1314,
            1173,
            1043,
            940,
            929,
            1419,
            1007,
            1411,
            1197,
            1294,
            875,
            1013,
            1135,
            1321,
            1019,
            1217,
            1049,
            997,
            1201,
            1110,
            1231,
            1031,
            1219,
            915,
            1237,
            1126,
            1019,
            973,
            1154,
            1144,
            1084,
            1232,
            1274,
            1235,
            1020,
            1312,
            1168,
            1061,
            567,
            830,
            1173,
            1190,
            1184,
            960,
            319,
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
        Module["removeRunDependency"]("datafile_jsons.data");
      }
      Module["addRunDependency"]("datafile_jsons.data");
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
        filename: "/lib/python3.8/site-packages/jsons/_meta.py",
        start: 0,
        end: 268,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/__init__.py",
        start: 268,
        end: 8100,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_cache.py",
        start: 8100,
        end: 9220,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_key_transformers.py",
        start: 9220,
        end: 10522,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_lizers_impl.py",
        start: 10522,
        end: 16232,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/decorators.py",
        start: 16232,
        end: 22804,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_load_impl.py",
        start: 22804,
        end: 30828,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_fork_impl.py",
        start: 30828,
        end: 32078,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_datetime_impl.py",
        start: 32078,
        end: 36937,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_compatibility_impl.py",
        start: 36937,
        end: 39157,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_multitasking.py",
        start: 39157,
        end: 41470,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_validation.py",
        start: 41470,
        end: 44100,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_extra_impl.py",
        start: 44100,
        end: 45371,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/exceptions.py",
        start: 45371,
        end: 51507,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_dump_impl.py",
        start: 51507,
        end: 55876,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/_common_impl.py",
        start: 55876,
        end: 61551,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_time.py",
        start: 61551,
        end: 62090,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/__init__.py",
        start: 62090,
        end: 63998,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_enum.py",
        start: 63998,
        end: 65236,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_nonetype.py",
        start: 65236,
        end: 65843,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_mapping.py",
        start: 65843,
        end: 66748,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_list.py",
        start: 66748,
        end: 67828,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_object.py",
        start: 67828,
        end: 74804,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_timedelta.py",
        start: 74804,
        end: 75253,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_date.py",
        start: 75253,
        end: 75792,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_datetime.py",
        start: 75792,
        end: 76648,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_string.py",
        start: 76648,
        end: 77480,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_primitive.py",
        start: 77480,
        end: 78248,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_iterable.py",
        start: 78248,
        end: 79395,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_dict.py",
        start: 79395,
        end: 80522,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_timezone.py",
        start: 80522,
        end: 81040,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_tuple.py",
        start: 81040,
        end: 84286,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_decimal.py",
        start: 84286,
        end: 84856,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_complex.py",
        start: 84856,
        end: 86008,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_union.py",
        start: 86008,
        end: 87267,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/deserializers/default_uuid.py",
        start: 87267,
        end: 87786,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_time.py",
        start: 87786,
        end: 88257,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/serializers/__init__.py",
        start: 88257,
        end: 89742,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_enum.py",
        start: 89742,
        end: 90336,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_object.py",
        start: 90336,
        end: 102970,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_timedelta.py",
        start: 102970,
        end: 103337,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_date.py",
        start: 103337,
        end: 103913,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_datetime.py",
        start: 103913,
        end: 104798,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_primitive.py",
        start: 104798,
        end: 105504,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_iterable.py",
        start: 105504,
        end: 108059,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_dict.py",
        start: 108059,
        end: 109870,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_timezone.py",
        start: 109870,
        end: 110374,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_tuple.py",
        start: 110374,
        end: 111849,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_decimal.py",
        start: 111849,
        end: 112132,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_complex.py",
        start: 112132,
        end: 112368,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_union.py",
        start: 112368,
        end: 113593,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/serializers/default_uuid.py",
        start: 113593,
        end: 113974,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/classes/__init__.py",
        start: 113974,
        end: 114081,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/jsons/classes/verbosity.py",
        start: 114081,
        end: 114991,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons/classes/json_serializable.py",
        start: 114991,
        end: 122833,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons-1.2.0-py3.8.egg-info/dependency_links.txt",
        start: 122833,
        end: 122834,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons-1.2.0-py3.8.egg-info/PKG-INFO",
        start: 122834,
        end: 130256,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons-1.2.0-py3.8.egg-info/requires.txt",
        start: 130256,
        end: 130270,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons-1.2.0-py3.8.egg-info/SOURCES.txt",
        start: 130270,
        end: 132225,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons-1.2.0-py3.8.egg-info/not-zip-safe",
        start: 132225,
        end: 132226,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/jsons-1.2.0-py3.8.egg-info/top_level.txt",
        start: 132226,
        end: 132232,
        audio: 0,
      },
    ],
    remote_package_size: 75549,
    package_uuid: "f3cc2c08-cee5-4117-912d-ead262ef91e9",
  });
})();
