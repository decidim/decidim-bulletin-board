var Module=typeof pyodide._module!=="undefined"?pyodide._module:{};Module.checkABI(1);if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0;Module.finishedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH;if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}else{throw"using preloaded data can only be done on a web page or in a web worker"}var PACKAGE_NAME="decidim-electionguard.data";var REMOTE_PACKAGE_BASE="decidim-electionguard.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata.remote_package_size;var PACKAGE_UUID=metadata.package_uuid;function fetchRemotePackage(packageName,packageSize,callback,errback){var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}},handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.8",true,true);Module["FS_createPath"]("/lib/python3.8","site-packages",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","decidim",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/decidim","electionguard",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","decidim_electionguard-0.1.0-py3.8.egg-info",true,true);function DataRequest(start,end,audio){this.start=start;this.end=end;this.audio=audio}DataRequest.prototype={requests:{},open:function(mode,name){this.name=name;this.requests[name]=this;Module["addRunDependency"]("fp "+this.name)},send:function(){},onload:function(){var byteArray=this.byteArray.subarray(this.start,this.end);this.finish(byteArray)},finish:function(byteArray){var that=this;Module["FS_createPreloadedFile"](this.name,null,byteArray,true,true,function(){Module["removeRunDependency"]("fp "+that.name)},function(){if(that.audio){Module["removeRunDependency"]("fp "+that.name)}else{err("Preloading file "+that.name+" failed")}},false,true);this.requests[this.name]=null}};function processPackageData(arrayBuffer){Module.finishedDataFileDownloads++;assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:16207,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1074,1798,2776,3888,4979,5983,7045,8282,9373,10254,11137,12165,13174,14201,15211],sizes:[1074,724,978,1112,1091,1004,1062,1237,1091,881,883,1028,1009,1027,1010,996],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData.data=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData});Module["removeRunDependency"]("datafile_decidim-electionguard.data")}Module["addRunDependency"]("datafile_decidim-electionguard.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.8/site-packages/decidim/__init__.py",start:0,end:0,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/__init__.py",start:0,end:0,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/bulletin_board.py",start:0,end:8838,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/common.py",start:8838,end:12724,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/dummy_scheduler.py",start:12724,end:13123,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/messages.py",start:13123,end:14031,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/serializable.py",start:14031,end:16848,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/trustee.py",start:16848,end:26178,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/utils.py",start:26178,end:28528,audio:0},{filename:"/lib/python3.8/site-packages/decidim/electionguard/voter.py",start:28528,end:31681,audio:0},{filename:"/lib/python3.8/site-packages/decidim_electionguard-0.1.0-py3.8.egg-info/PKG-INFO",start:31681,end:31976,audio:0},{filename:"/lib/python3.8/site-packages/decidim_electionguard-0.1.0-py3.8.egg-info/SOURCES.txt",start:31976,end:32622,audio:0},{filename:"/lib/python3.8/site-packages/decidim_electionguard-0.1.0-py3.8.egg-info/dependency_links.txt",start:32622,end:32623,audio:0},{filename:"/lib/python3.8/site-packages/decidim_electionguard-0.1.0-py3.8.egg-info/requires.txt",start:32623,end:32656,audio:0},{filename:"/lib/python3.8/site-packages/decidim_electionguard-0.1.0-py3.8.egg-info/top_level.txt",start:32656,end:32664,audio:0}],remote_package_size:20303,package_uuid:"22726144-a16a-4075-84f5-ca8c740fee2e"})})();