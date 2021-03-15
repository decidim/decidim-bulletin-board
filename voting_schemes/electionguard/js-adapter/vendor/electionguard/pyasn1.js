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
    var PACKAGE_NAME = "pyasn1.data";
    var REMOTE_PACKAGE_BASE = "pyasn1.data";
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
        "pyasn1-0.4.8-py3.8.egg-info",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "pyasn1",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1",
        "compat",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1",
        "codec",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1/codec",
        "ber",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1/codec",
        "cer",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1/codec",
        "der",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1/codec",
        "native",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages/pyasn1",
        "type",
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
          cachedOffset: 172375,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [
            0,
            955,
            1489,
            2228,
            3379,
            4520,
            5840,
            6913,
            8002,
            8957,
            9905,
            11061,
            11976,
            12956,
            13800,
            14829,
            15859,
            16786,
            17783,
            18621,
            19561,
            20422,
            21394,
            22498,
            23752,
            24645,
            25569,
            26429,
            27497,
            28402,
            29535,
            30594,
            31654,
            32726,
            33635,
            34496,
            35190,
            36210,
            37104,
            37873,
            38627,
            39467,
            40271,
            41202,
            42094,
            42861,
            44082,
            44910,
            45811,
            46850,
            47748,
            48548,
            49642,
            50981,
            52030,
            52991,
            53906,
            54968,
            56311,
            57601,
            58921,
            60174,
            61464,
            62291,
            63129,
            64059,
            65338,
            66062,
            66707,
            67712,
            69060,
            69963,
            71035,
            72016,
            73147,
            74299,
            75371,
            76659,
            77596,
            78609,
            79427,
            80740,
            81620,
            82706,
            83815,
            84706,
            85646,
            86475,
            87832,
            88957,
            89695,
            90362,
            90872,
            91362,
            92732,
            93606,
            94751,
            95991,
            97060,
            98224,
            99185,
            100591,
            101644,
            102690,
            103822,
            105070,
            106094,
            107133,
            108286,
            109010,
            109742,
            110850,
            112100,
            113213,
            114112,
            114974,
            115970,
            116963,
            118089,
            119286,
            120291,
            121102,
            122365,
            123399,
            124617,
            125834,
            126878,
            128115,
            129072,
            129752,
            130612,
            131729,
            132986,
            133946,
            135e3,
            136156,
            137118,
            138180,
            139343,
            140501,
            141677,
            142686,
            143494,
            144562,
            145481,
            146494,
            147513,
            148389,
            149537,
            150555,
            151482,
            152290,
            153310,
            154281,
            155330,
            155871,
            156968,
            158034,
            159195,
            160436,
            161691,
            162611,
            163695,
            164549,
            165509,
            166295,
            167239,
            168278,
            169319,
            170291,
            171570,
          ],
          sizes: [
            955,
            534,
            739,
            1151,
            1141,
            1320,
            1073,
            1089,
            955,
            948,
            1156,
            915,
            980,
            844,
            1029,
            1030,
            927,
            997,
            838,
            940,
            861,
            972,
            1104,
            1254,
            893,
            924,
            860,
            1068,
            905,
            1133,
            1059,
            1060,
            1072,
            909,
            861,
            694,
            1020,
            894,
            769,
            754,
            840,
            804,
            931,
            892,
            767,
            1221,
            828,
            901,
            1039,
            898,
            800,
            1094,
            1339,
            1049,
            961,
            915,
            1062,
            1343,
            1290,
            1320,
            1253,
            1290,
            827,
            838,
            930,
            1279,
            724,
            645,
            1005,
            1348,
            903,
            1072,
            981,
            1131,
            1152,
            1072,
            1288,
            937,
            1013,
            818,
            1313,
            880,
            1086,
            1109,
            891,
            940,
            829,
            1357,
            1125,
            738,
            667,
            510,
            490,
            1370,
            874,
            1145,
            1240,
            1069,
            1164,
            961,
            1406,
            1053,
            1046,
            1132,
            1248,
            1024,
            1039,
            1153,
            724,
            732,
            1108,
            1250,
            1113,
            899,
            862,
            996,
            993,
            1126,
            1197,
            1005,
            811,
            1263,
            1034,
            1218,
            1217,
            1044,
            1237,
            957,
            680,
            860,
            1117,
            1257,
            960,
            1054,
            1156,
            962,
            1062,
            1163,
            1158,
            1176,
            1009,
            808,
            1068,
            919,
            1013,
            1019,
            876,
            1148,
            1018,
            927,
            808,
            1020,
            971,
            1049,
            541,
            1097,
            1066,
            1161,
            1241,
            1255,
            920,
            1084,
            854,
            960,
            786,
            944,
            1039,
            1041,
            972,
            1279,
            805,
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
        Module["removeRunDependency"]("datafile_pyasn1.data");
      }
      Module["addRunDependency"]("datafile_pyasn1.data");
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
        filename:
          "/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/dependency_links.txt",
        start: 0,
        end: 1,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/PKG-INFO",
        start: 1,
        end: 1532,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/zip-safe",
        start: 1532,
        end: 1533,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/SOURCES.txt",
        start: 1533,
        end: 6921,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/top_level.txt",
        start: 6921,
        end: 6928,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/__init__.py",
        start: 6928,
        end: 7103,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/debug.py",
        start: 7103,
        end: 10829,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/error.py",
        start: 10829,
        end: 13086,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/binary.py",
        start: 13086,
        end: 13784,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/__init__.py",
        start: 13784,
        end: 13843,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/integer.py",
        start: 13843,
        end: 16831,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/octets.py",
        start: 16831,
        end: 18190,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/calling.py",
        start: 18190,
        end: 18569,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/dateandtime.py",
        start: 18569,
        end: 19051,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/compat/string.py",
        start: 19051,
        end: 19556,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/__init__.py",
        start: 19556,
        end: 19615,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/ber/__init__.py",
        start: 19615,
        end: 19674,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/ber/eoo.py",
        start: 19674,
        end: 20300,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/ber/encoder.py",
        start: 20300,
        end: 48041,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/ber/decoder.py",
        start: 48041,
        end: 107749,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/cer/__init__.py",
        start: 107749,
        end: 107808,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/cer/encoder.py",
        start: 107808,
        end: 117217,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/cer/decoder.py",
        start: 117217,
        end: 120962,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/der/__init__.py",
        start: 120962,
        end: 121021,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/der/encoder.py",
        start: 121021,
        end: 124094,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/der/decoder.py",
        start: 124094,
        end: 126816,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/pyasn1/codec/native/__init__.py",
        start: 126816,
        end: 126875,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/native/encoder.py",
        start: 126875,
        end: 134877,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/codec/native/decoder.py",
        start: 134877,
        end: 142548,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/constraint.py",
        start: 142548,
        end: 164680,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/__init__.py",
        start: 164680,
        end: 164739,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/namedval.py",
        start: 164739,
        end: 169625,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/tag.py",
        start: 169625,
        end: 179111,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/char.py",
        start: 179111,
        end: 190508,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/base.py",
        start: 190508,
        end: 212894,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/useful.py",
        start: 212894,
        end: 218262,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/univ.py",
        start: 218262,
        end: 327183,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/namedtype.py",
        start: 327183,
        end: 343551,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/tagmap.py",
        start: 343551,
        end: 346549,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/opentype.py",
        start: 346549,
        end: 349397,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/pyasn1/type/error.py",
        start: 349397,
        end: 349643,
        audio: 0,
      },
    ],
    remote_package_size: 176471,
    package_uuid: "a7ae73ff-3529-45d8-94c5-f77cb39af2f6",
  });
})();
