var Module=typeof pyodide._module!=="undefined"?pyodide._module:{};Module.checkABI(1);if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0;Module.finishedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH;if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}else{throw"using preloaded data can only be done on a web page or in a web worker"}var PACKAGE_NAME="pyasn1.data";var REMOTE_PACKAGE_BASE="pyasn1.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata.remote_package_size;var PACKAGE_UUID=metadata.package_uuid;function fetchRemotePackage(packageName,packageSize,callback,errback){var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}},handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.8",true,true);Module["FS_createPath"]("/lib/python3.8","site-packages",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","pyasn1",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1","codec",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","ber",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","cer",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","der",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","native",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1","compat",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1","type",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","pyasn1-0.4.8-py3.8.egg-info",true,true);function DataRequest(start,end,audio){this.start=start;this.end=end;this.audio=audio}DataRequest.prototype={requests:{},open:function(mode,name){this.name=name;this.requests[name]=this;Module["addRunDependency"]("fp "+this.name)},send:function(){},onload:function(){var byteArray=this.byteArray.subarray(this.start,this.end);this.finish(byteArray)},finish:function(byteArray){var that=this;Module["FS_createPreloadedFile"](this.name,null,byteArray,true,true,function(){Module["removeRunDependency"]("fp "+that.name)},function(){if(that.audio){Module["removeRunDependency"]("fp "+that.name)}else{err("Preloading file "+that.name+" failed")}},false,true);this.requests[this.name]=null}};function processPackageData(arrayBuffer){Module.finishedDataFileDownloads++;assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:173533,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1305,2578,3525,4621,5505,6583,7383,8325,9177,10313,11190,12353,13370,14279,14966,15811,16766,17787,18497,19319,20182,21149,22104,22807,23789,24944,25726,26749,27771,28629,29541,30771,32080,33080,33927,34807,35775,36885,37936,38947,39781,40653,41579,42347,43405,44700,46023,47307,48476,49483,50408,51473,52800,54111,55340,56493,57216,58001,59169,60103,60948,61748,62950,63916,65046,66065,67369,68427,69590,70821,71857,73105,74166,75516,76527,77597,78556,79866,80848,81835,82360,82876,83717,84681,85779,86791,87921,89150,90282,91471,92466,93498,94425,95608,96506,97566,98434,99414,100266,101271,102377,103570,104435,105372,106577,107742,108626,109712,110526,111475,112678,113770,114910,115604,116307,117440,118700,119786,120676,121545,122537,123547,124667,125835,126836,127638,128906,129951,131163,132373,133429,134686,135654,136366,137255,138357,139571,140547,141562,142712,143695,144766,145931,147080,148265,149265,150118,151207,152118,153110,154098,154965,156149,157173,158077,158867,159825,160797,161866,162428,163521,164580,165731,166972,168218,169453,170551,171594,172339,172985],sizes:[1305,1273,947,1096,884,1078,800,942,852,1136,877,1163,1017,909,687,845,955,1021,710,822,863,967,955,703,982,1155,782,1023,1022,858,912,1230,1309,1e3,847,880,968,1110,1051,1011,834,872,926,768,1058,1295,1323,1284,1169,1007,925,1065,1327,1311,1229,1153,723,785,1168,934,845,800,1202,966,1130,1019,1304,1058,1163,1231,1036,1248,1061,1350,1011,1070,959,1310,982,987,525,516,841,964,1098,1012,1130,1229,1132,1189,995,1032,927,1183,898,1060,868,980,852,1005,1106,1193,865,937,1205,1165,884,1086,814,949,1203,1092,1140,694,703,1133,1260,1086,890,869,992,1010,1120,1168,1001,802,1268,1045,1212,1210,1056,1257,968,712,889,1102,1214,976,1015,1150,983,1071,1165,1149,1185,1e3,853,1089,911,992,988,867,1184,1024,904,790,958,972,1069,562,1093,1059,1151,1241,1246,1235,1098,1043,745,646,548],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData.data=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData});Module["removeRunDependency"]("datafile_pyasn1.data")}Module["addRunDependency"]("datafile_pyasn1.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.8/site-packages/pyasn1/__init__.py",start:0,end:175,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/debug.py",start:175,end:3901,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/error.py",start:3901,end:6158,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/__init__.py",start:6158,end:6217,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/__init__.py",start:6217,end:6276,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/decoder.py",start:6276,end:65984,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/encoder.py",start:65984,end:93725,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/eoo.py",start:93725,end:94351,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/cer/__init__.py",start:94351,end:94410,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/cer/decoder.py",start:94410,end:98155,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/cer/encoder.py",start:98155,end:107564,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/der/__init__.py",start:107564,end:107623,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/der/decoder.py",start:107623,end:110345,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/der/encoder.py",start:110345,end:113418,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/native/__init__.py",start:113418,end:113477,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/native/decoder.py",start:113477,end:121148,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/native/encoder.py",start:121148,end:129150,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/__init__.py",start:129150,end:129209,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/binary.py",start:129209,end:129907,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/calling.py",start:129907,end:130286,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/dateandtime.py",start:130286,end:130768,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/integer.py",start:130768,end:133756,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/octets.py",start:133756,end:135115,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/string.py",start:135115,end:135620,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/__init__.py",start:135620,end:135679,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/base.py",start:135679,end:158065,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/char.py",start:158065,end:169462,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/constraint.py",start:169462,end:191594,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/error.py",start:191594,end:191840,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/namedtype.py",start:191840,end:208208,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/namedval.py",start:208208,end:213094,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/opentype.py",start:213094,end:215942,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/tag.py",start:215942,end:225428,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/tagmap.py",start:225428,end:228426,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/univ.py",start:228426,end:337347,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/useful.py",start:337347,end:342715,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/PKG-INFO",start:342715,end:344246,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/SOURCES.txt",start:344246,end:349634,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/dependency_links.txt",start:349634,end:349635,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/top_level.txt",start:349635,end:349642,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/zip-safe",start:349642,end:349643,audio:0}],remote_package_size:177629,package_uuid:"0f179560-143d-4e53-99b9-b2784867a915"})})();