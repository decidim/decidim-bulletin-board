var Module=typeof pyodide._module!=="undefined"?pyodide._module:{};Module.checkABI(1);if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0;Module.finishedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH;if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}else{throw"using preloaded data can only be done on a web page or in a web worker"}var PACKAGE_NAME="pyasn1.data";var REMOTE_PACKAGE_BASE="pyasn1.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata.remote_package_size;var PACKAGE_UUID=metadata.package_uuid;function fetchRemotePackage(packageName,packageSize,callback,errback){var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}},handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.8",true,true);Module["FS_createPath"]("/lib/python3.8","site-packages",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","pyasn1-0.4.8-py3.8.egg-info",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","pyasn1",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1","type",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1","codec",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","native",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","ber",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","cer",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1/codec","der",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/pyasn1","compat",true,true);function DataRequest(start,end,audio){this.start=start;this.end=end;this.audio=audio}DataRequest.prototype={requests:{},open:function(mode,name){this.name=name;this.requests[name]=this;Module["addRunDependency"]("fp "+this.name)},send:function(){},onload:function(){var byteArray=this.byteArray.subarray(this.start,this.end);this.finish(byteArray)},finish:function(byteArray){var that=this;Module["FS_createPreloadedFile"](this.name,null,byteArray,true,true,function(){Module["removeRunDependency"]("fp "+that.name)},function(){if(that.audio){Module["removeRunDependency"]("fp "+that.name)}else{err("Preloading file "+that.name+" failed")}},false,true);this.requests[this.name]=null}};function processPackageData(arrayBuffer){Module.finishedDataFileDownloads++;assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:173986,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,957,1496,2229,3308,4508,5641,7001,7978,8907,9802,10808,11757,12876,13882,15134,16117,17073,18096,19244,20391,21194,22360,23359,24401,25185,26511,27495,28483,29008,29528,30317,31548,32628,33860,35056,36244,37424,38451,39683,40771,42008,43162,44235,45240,46518,47322,48488,49336,50440,51530,52595,53738,54445,55171,56292,57551,58636,59525,60389,61387,62386,63514,64691,65693,66480,67747,68794,70014,71234,72271,73519,74480,75177,76060,77158,78397,79356,80387,81528,82494,83571,84726,85883,87071,88077,88918,89993,90896,91893,92894,93768,94938,95955,96852,97656,98643,99610,100671,101224,102306,103358,104515,105764,107049,108001,108942,110219,111355,112096,112795,113875,115146,115855,116593,117760,119133,120131,120976,121856,122825,123935,124985,125989,126821,127696,128624,129391,130445,131649,132632,133560,134512,135451,136332,137251,138406,139403,140561,141505,142461,143156,144084,145006,145928,146613,147515,148304,149352,150359,151005,152114,153115,153974,155085,155911,156801,157638,158944,160268,161260,162278,163318,164535,165820,167158,168349,169598,170840,171790,173081],sizes:[957,539,733,1079,1200,1133,1360,977,929,895,1006,949,1119,1006,1252,983,956,1023,1148,1147,803,1166,999,1042,784,1326,984,988,525,520,789,1231,1080,1232,1196,1188,1180,1027,1232,1088,1237,1154,1073,1005,1278,804,1166,848,1104,1090,1065,1143,707,726,1121,1259,1085,889,864,998,999,1128,1177,1002,787,1267,1047,1220,1220,1037,1248,961,697,883,1098,1239,959,1031,1141,966,1077,1155,1157,1188,1006,841,1075,903,997,1001,874,1170,1017,897,804,987,967,1061,553,1082,1052,1157,1249,1285,952,941,1277,1136,741,699,1080,1271,709,738,1167,1373,998,845,880,969,1110,1050,1004,832,875,928,767,1054,1204,983,928,952,939,881,919,1155,997,1158,944,956,695,928,922,922,685,902,789,1048,1007,646,1109,1001,859,1111,826,890,837,1306,1324,992,1018,1040,1217,1285,1338,1191,1249,1242,950,1291,905],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData.data=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData});Module["removeRunDependency"]("datafile_pyasn1.data")}Module["addRunDependency"]("datafile_pyasn1.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/dependency_links.txt",start:0,end:1,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/top_level.txt",start:1,end:8,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/PKG-INFO",start:8,end:1539,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/SOURCES.txt",start:1539,end:6927,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1-0.4.8-py3.8.egg-info/zip-safe",start:6927,end:6928,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/error.py",start:6928,end:9185,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/__init__.py",start:9185,end:9360,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/debug.py",start:9360,end:13086,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/namedtype.py",start:13086,end:29454,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/constraint.py",start:29454,end:51586,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/char.py",start:51586,end:62983,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/useful.py",start:62983,end:68351,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/base.py",start:68351,end:90737,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/tag.py",start:90737,end:100223,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/tagmap.py",start:100223,end:103221,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/error.py",start:103221,end:103467,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/__init__.py",start:103467,end:103526,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/univ.py",start:103526,end:212447,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/namedval.py",start:212447,end:217333,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/type/opentype.py",start:217333,end:220181,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/__init__.py",start:220181,end:220240,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/native/encoder.py",start:220240,end:228242,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/native/decoder.py",start:228242,end:235913,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/native/__init__.py",start:235913,end:235972,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/encoder.py",start:235972,end:263713,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/decoder.py",start:263713,end:323421,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/eoo.py",start:323421,end:324047,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/ber/__init__.py",start:324047,end:324106,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/cer/encoder.py",start:324106,end:333515,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/cer/decoder.py",start:333515,end:337260,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/cer/__init__.py",start:337260,end:337319,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/der/encoder.py",start:337319,end:340392,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/der/decoder.py",start:340392,end:343114,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/codec/der/__init__.py",start:343114,end:343173,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/string.py",start:343173,end:343678,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/dateandtime.py",start:343678,end:344160,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/binary.py",start:344160,end:344858,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/octets.py",start:344858,end:346217,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/integer.py",start:346217,end:349205,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/__init__.py",start:349205,end:349264,audio:0},{filename:"/lib/python3.8/site-packages/pyasn1/compat/calling.py",start:349264,end:349643,audio:0}],remote_package_size:178082,package_uuid:"5a60e09a-d26e-49f2-a966-a1ecb2f9adf4"})})();