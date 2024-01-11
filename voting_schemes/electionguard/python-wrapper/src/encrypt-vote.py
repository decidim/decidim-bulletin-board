import sys
import json
import asyncio
from base64 import b64decode

from bulletin_board.electionguard.voter import Voter

voter_id = sys.argv[1]
create_election_decoded_data = sys.argv[2]
end_key_ceremony_decoded_data = sys.argv[3]
plain_vote = sys.argv[4]
ballot_style = sys.argv[5]
nonce = int.from_bytes(b64decode(sys.argv[6]), 'big', signed=False)

voter = Voter(voter_id)

asyncio.run(voter.process_message("create_election", json.loads(create_election_decoded_data)))
asyncio.run(voter.process_message("end_key_ceremony", json.loads(end_key_ceremony_decoded_data)))

auditable_vote, _ = asyncio.run(voter.encrypt(json.loads(plain_vote), ballot_style, nonce))

print(auditable_vote)