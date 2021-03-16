(()=>{"use strict";var e={d:(r,t)=>{for(var o in t)e.o(t,o)&&!e.o(r,o)&&Object.defineProperty(r,o,{enumerable:!0,get:t[o]})},o:(e,r)=>Object.prototype.hasOwnProperty.call(e,r),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},r={};e.r(r),e.d(r,{TrusteeWrapperAdapter:()=>o,VoterWrapperAdapter:()=>s});class t{processPythonCodeOnWorker(e,r){return new Promise(((t,o)=>{this.worker.onmessage=e=>{t(e.data.results)},this.worker.onerror=e=>{console.error(e),o(e)},this.worker.postMessage({python:e,...r})}))}}class o extends t{constructor({trusteeId:e,workerUrl:r}){super(),this.trusteeId=e,this.worker=new Worker(r)}setup(){return this.processPythonCodeOnWorker("\n        from js import trustee_id\n        from bulletin_board.electionguard.trustee import Trustee\n        trustee = Trustee(trustee_id)\n      ",{trustee_id:this.trusteeId})}async processMessage(e,r){const t=await this.processPythonCodeOnWorker("\n      import json\n      from js import message_type, decoded_data\n      trustee.process_message(message_type, json.loads(decoded_data))\n    ",{message_type:e,decoded_data:JSON.stringify(r)});if(t&&t.length>0){const[{message_type:e,content:r}]=t;return{messageType:e,content:r}}}isFresh(){return this.processPythonCodeOnWorker("\n      trustee.is_fresh()\n    ")}backup(){return this.processPythonCodeOnWorker("\n      trustee.backup().hex()\n    ")}restore(e){return this.processPythonCodeOnWorker("\n      from js import state\n\n      trustee = Trustee.restore(bytes.fromhex(state))\n      True\n    ",{state:e})}isKeyCeremonyDone(){return this.processPythonCodeOnWorker("\n      trustee.is_key_ceremony_done()\n    ")}isTallyDone(){return this.processPythonCodeOnWorker("\n      trustee.is_tally_done()\n    ")}}class s extends t{constructor({voterId:e,workerUrl:r}){super(),this.voterId=e,this.worker=new Worker(r)}setup(){return this.processPythonCodeOnWorker("\n        from js import voter_id\n        from bulletin_board.electionguard.voter import Voter\n        voter = Voter(voter_id)\n      ",{voter_id:this.voterId})}async processMessage(e,r){const t=await this.processPythonCodeOnWorker("\n      import json\n      from js import message_type, decoded_data\n      voter.process_message(message_type, json.loads(decoded_data))\n    ",{message_type:e,decoded_data:JSON.stringify(r)});if(t&&t[0]){const{message_type:e,content:r}=t[0];return{messageType:e,content:r}}}async encrypt(e){const[r,t]=await this.processPythonCodeOnWorker("\n      from js import plain_vote\n      voter.encrypt(plain_vote)\n    ",{plain_vote:e});return{auditableData:r,encryptedData:t}}}window.electionGuardVotingScheme=r})();