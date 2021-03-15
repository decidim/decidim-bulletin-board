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
    var PACKAGE_NAME = "electionguard.data";
    var REMOTE_PACKAGE_BASE = "electionguard.data";
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
        "electionguard",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "electionguard-1.1.15-py3.8.egg-info",
        true,
        true
      );
      Module["FS_createPath"](
        "/lib/python3.8/site-packages",
        "electionguardtest",
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
          cachedOffset: 227205,
          cachedIndexes: [-1, -1],
          cachedChunks: [null, null],
          offsets: [
            0,
            1186,
            2113,
            3137,
            4045,
            5113,
            6185,
            7234,
            8368,
            9350,
            10365,
            11179,
            12463,
            13644,
            15013,
            16186,
            17121,
            18178,
            20141,
            21399,
            22334,
            23223,
            24162,
            24953,
            26217,
            27568,
            28786,
            30061,
            31179,
            32262,
            33486,
            34723,
            35923,
            37022,
            38062,
            39291,
            40495,
            41647,
            42811,
            43941,
            45028,
            46166,
            47439,
            48492,
            49472,
            50587,
            51793,
            53102,
            54147,
            54985,
            56128,
            57332,
            58291,
            59160,
            59946,
            60967,
            61975,
            63037,
            64142,
            65143,
            66212,
            67172,
            68289,
            69475,
            70751,
            71876,
            72739,
            73633,
            74527,
            75547,
            76503,
            77419,
            78366,
            79372,
            80552,
            81616,
            82722,
            83909,
            85073,
            86389,
            87482,
            88469,
            89826,
            90888,
            91969,
            92875,
            93886,
            94845,
            95887,
            96934,
            97912,
            98796,
            99761,
            100676,
            101634,
            102584,
            103473,
            104349,
            105279,
            106252,
            107557,
            108666,
            109757,
            110923,
            111840,
            112976,
            113963,
            115142,
            116098,
            117215,
            118268,
            119312,
            120388,
            121537,
            122715,
            123950,
            125088,
            126062,
            127215,
            128262,
            129696,
            130898,
            132153,
            133378,
            134578,
            135568,
            136509,
            137665,
            138648,
            139715,
            140487,
            141359,
            142313,
            143234,
            144075,
            145159,
            146250,
            147444,
            148483,
            149399,
            150294,
            151175,
            152089,
            152893,
            153815,
            154694,
            155634,
            156502,
            157356,
            158260,
            159164,
            160076,
            160935,
            161865,
            162759,
            163631,
            164532,
            165460,
            166305,
            167204,
            168044,
            168945,
            169792,
            170698,
            171555,
            172452,
            173282,
            174179,
            175068,
            175926,
            176869,
            177759,
            178799,
            179736,
            180984,
            182326,
            183545,
            184732,
            185569,
            186362,
            187007,
            187775,
            188785,
            189721,
            190606,
            191458,
            192302,
            193190,
            193957,
            195070,
            196147,
            197616,
            198915,
            200193,
            201067,
            202009,
            202952,
            204052,
            205108,
            206033,
            207053,
            208189,
            209264,
            210369,
            211581,
            212633,
            213462,
            214385,
            215631,
            216556,
            217562,
            218730,
            219979,
            221074,
            222229,
            223424,
            224576,
            225753,
            227034,
          ],
          sizes: [
            1186,
            927,
            1024,
            908,
            1068,
            1072,
            1049,
            1134,
            982,
            1015,
            814,
            1284,
            1181,
            1369,
            1173,
            935,
            1057,
            1963,
            1258,
            935,
            889,
            939,
            791,
            1264,
            1351,
            1218,
            1275,
            1118,
            1083,
            1224,
            1237,
            1200,
            1099,
            1040,
            1229,
            1204,
            1152,
            1164,
            1130,
            1087,
            1138,
            1273,
            1053,
            980,
            1115,
            1206,
            1309,
            1045,
            838,
            1143,
            1204,
            959,
            869,
            786,
            1021,
            1008,
            1062,
            1105,
            1001,
            1069,
            960,
            1117,
            1186,
            1276,
            1125,
            863,
            894,
            894,
            1020,
            956,
            916,
            947,
            1006,
            1180,
            1064,
            1106,
            1187,
            1164,
            1316,
            1093,
            987,
            1357,
            1062,
            1081,
            906,
            1011,
            959,
            1042,
            1047,
            978,
            884,
            965,
            915,
            958,
            950,
            889,
            876,
            930,
            973,
            1305,
            1109,
            1091,
            1166,
            917,
            1136,
            987,
            1179,
            956,
            1117,
            1053,
            1044,
            1076,
            1149,
            1178,
            1235,
            1138,
            974,
            1153,
            1047,
            1434,
            1202,
            1255,
            1225,
            1200,
            990,
            941,
            1156,
            983,
            1067,
            772,
            872,
            954,
            921,
            841,
            1084,
            1091,
            1194,
            1039,
            916,
            895,
            881,
            914,
            804,
            922,
            879,
            940,
            868,
            854,
            904,
            904,
            912,
            859,
            930,
            894,
            872,
            901,
            928,
            845,
            899,
            840,
            901,
            847,
            906,
            857,
            897,
            830,
            897,
            889,
            858,
            943,
            890,
            1040,
            937,
            1248,
            1342,
            1219,
            1187,
            837,
            793,
            645,
            768,
            1010,
            936,
            885,
            852,
            844,
            888,
            767,
            1113,
            1077,
            1469,
            1299,
            1278,
            874,
            942,
            943,
            1100,
            1056,
            925,
            1020,
            1136,
            1075,
            1105,
            1212,
            1052,
            829,
            923,
            1246,
            925,
            1006,
            1168,
            1249,
            1095,
            1155,
            1195,
            1152,
            1177,
            1281,
            171,
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
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
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
        Module["removeRunDependency"]("datafile_electionguard.data");
      }
      Module["addRunDependency"]("datafile_electionguard.data");
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
        filename: "/lib/python3.8/site-packages/electionguard/proof.py",
        start: 0,
        end: 653,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/key_ceremony.py",
        start: 653,
        end: 9751,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/election_object_base.py",
        start: 9751,
        end: 10025,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/decryption_mediator.py",
        start: 10025,
        end: 22655,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/scheduler.py",
        start: 22655,
        end: 23070,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/election_polynomial.py",
        start: 23070,
        end: 27384,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/dlog.py",
        start: 27384,
        end: 29178,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/logs.py",
        start: 29178,
        end: 34204,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/__init__.py",
        start: 34204,
        end: 34204,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/group.py",
        start: 34204,
        end: 48150,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/ballot.py",
        start: 48150,
        end: 84537,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/election.py",
        start: 84537,
        end: 121020,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/publish.py",
        start: 121020,
        end: 125175,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/data_store.py",
        start: 125175,
        end: 127955,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/tracker.py",
        start: 127955,
        end: 13e4,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/rsa.py",
        start: 13e4,
        end: 131775,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/chaum_pedersen.py",
        start: 131775,
        end: 149746,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/election_builder.py",
        start: 149746,
        end: 151824,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/encrypt.py",
        start: 151824,
        end: 169978,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/decryption.py",
        start: 169978,
        end: 196660,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/ballot_validator.py",
        start: 196660,
        end: 200742,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/utils.py",
        start: 200742,
        end: 203483,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/tally.py",
        start: 203483,
        end: 218431,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/decrypt_with_secrets.py",
        start: 218431,
        end: 232186,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/auxiliary.py",
        start: 232186,
        end: 233331,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/decrypt_with_shares.py",
        start: 233331,
        end: 241070,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/ballot_store.py",
        start: 241070,
        end: 243128,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/hash.py",
        start: 243128,
        end: 246431,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/ballot_box.py",
        start: 246431,
        end: 249042,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/types.py",
        start: 249042,
        end: 249112,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/schnorr.py",
        start: 249112,
        end: 251385,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/schema.py",
        start: 251385,
        end: 252327,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/serializable.py",
        start: 252327,
        end: 259888,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/guardian.py",
        start: 259888,
        end: 280177,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/words.py",
        start: 280177,
        end: 351663,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/elgamal.py",
        start: 351663,
        end: 356467,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/nonces.py",
        start: 356467,
        end: 358866,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/decryption_share.py",
        start: 358866,
        end: 371406,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard/key_ceremony_mediator.py",
        start: 371406,
        end: 386085,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguard/singleton.py",
        start: 386085,
        end: 386501,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard-1.1.15-py3.8.egg-info/dependency_links.txt",
        start: 386501,
        end: 386502,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard-1.1.15-py3.8.egg-info/PKG-INFO",
        start: 386502,
        end: 398500,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard-1.1.15-py3.8.egg-info/requires.txt",
        start: 398500,
        end: 398570,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard-1.1.15-py3.8.egg-info/SOURCES.txt",
        start: 398570,
        end: 400419,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard-1.1.15-py3.8.egg-info/not-zip-safe",
        start: 400419,
        end: 400420,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguard-1.1.15-py3.8.egg-info/top_level.txt",
        start: 400420,
        end: 400452,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguardtest/__init__.py",
        start: 400452,
        end: 400452,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguardtest/election_factory.py",
        start: 400452,
        end: 410674,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguardtest/sample_generator.py",
        start: 410674,
        end: 415777,
        audio: 0,
      },
      {
        filename:
          "/lib/python3.8/site-packages/electionguardtest/ballot_factory.py",
        start: 415777,
        end: 422009,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguardtest/group.py",
        start: 422009,
        end: 423275,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguardtest/election.py",
        start: 423275,
        end: 444781,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguardtest/tally.py",
        start: 444781,
        end: 446003,
        audio: 0,
      },
      {
        filename: "/lib/python3.8/site-packages/electionguardtest/elgamal.py",
        start: 446003,
        end: 446638,
        audio: 0,
      },
    ],
    remote_package_size: 231301,
    package_uuid: "b751a34b-e81a-40bc-83b9-12eb17eb31e9",
  });
})();
