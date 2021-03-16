# flake8: noqa: E501

from electionguard.ballot import CiphertextBallot
from bulletin_board.electionguard.utils import deserialize, serialize, serialize_as_dict
import json
from pathlib import Path


def create_election_test_message():
    return {
        "scheme": {"name": "electionguard", "quorum": 2},
        "trustees": [
            {"slug": "alicia", "public_key": "..."},
            {"slug": "bob", "public_key": "..."},
            {"slug": "clara", "public_key": "..."},
        ],
        "description": {
            "name": {"text": [{"value": "Test election", "language": "en"}]},
            "start_date": "2050-03-01T08:00:00-05:00",
            "end_date": "2050-03-01T20:00:00-05:00",
            "candidates": [
                {
                    "object_id": "question1-yes",
                    "ballot_name": {"text": [{"value": "Yes", "language": "en"}]},
                },
                {
                    "object_id": "question1-no",
                    "ballot_name": {"text": [{"value": "No", "language": "en"}]},
                },
                {
                    "object_id": "question2-first-project",
                    "ballot_name": {
                        "text": [{"value": "First project", "language": "en"}]
                    },
                },
                {
                    "object_id": "question2-second-project",
                    "ballot_name": {
                        "text": [{"value": "Second project", "language": "en"}]
                    },
                },
                {
                    "object_id": "question2-third-project",
                    "ballot_name": {
                        "text": [{"value": "Third project", "language": "en"}]
                    },
                },
                {
                    "object_id": "question2-fourth-project",
                    "ballot_name": {
                        "text": [{"value": "Fourth project", "language": "en"}]
                    },
                },
            ],
            "contests": [
                {
                    "@type": "ReferendumContest",
                    "object_id": "question1",
                    "sequence_order": 0,
                    "vote_variation": "one_of_m",
                    "name": "Question 1",
                    "number_elected": 1,
                    "minimum_elected": 1,
                    "ballot_title": {
                        "text": [{"value": "Do you agree?", "language": "en"}]
                    },
                    "ballot_subtitle": {
                        "text": [{"value": "Choose 'Yes' or 'No'", "language": "en"}]
                    },
                    "ballot_selections": [
                        {
                            "object_id": "question1-yes-selection",
                            "sequence_order": 0,
                            "candidate_id": "question1-yes",
                        },
                        {
                            "object_id": "question1-no-selection",
                            "sequence_order": 1,
                            "candidate_id": "question1-no",
                        },
                    ],
                },
                {
                    "@type": "CandidateContest",
                    "object_id": "question2",
                    "sequence_order": 1,
                    "vote_variation": "n_of_m",
                    "name": "Question 2",
                    "number_elected": 2,
                    "minimum_elected": 0,
                    "ballot_title": {
                        "text": [
                            {
                                "value": "Choose the projects that you like",
                                "language": "en",
                            }
                        ]
                    },
                    "ballot_subtitle": {
                        "text": [
                            {
                                "value": "You can select at most two projects",
                                "language": "en",
                            }
                        ]
                    },
                    "ballot_selections": [
                        {
                            "object_id": "question2-first-project-selection",
                            "sequence_order": 0,
                            "candidate_id": "question2-first-project",
                        },
                        {
                            "object_id": "question2-second-project-selection",
                            "sequence_order": 1,
                            "candidate_id": "question2-second-project",
                        },
                        {
                            "object_id": "question2-third-project-selection",
                            "sequence_order": 2,
                            "candidate_id": "question2-third-project",
                        },
                        {
                            "object_id": "question2-fourth-project-selection",
                            "sequence_order": 3,
                            "candidate_id": "question2-fourth-project",
                        },
                    ],
                },
            ],
        },
    }


def read_messages(input_path):
    file = open(input_path, "r")
    return [
        json.loads(jline)
        for jline in file.readlines()
    ]


INTEGRATION_RESULTS_MESSAGES = read_messages(Path(".") / "integration_results.jsonl")


def integration_results_messages(message_type):
    return sum((message["out"]
                for message in INTEGRATION_RESULTS_MESSAGES
                if message["message_type"] == message_type), [])


def integration_results_message(message_type):
    return integration_results_messages(message_type)[0]


def trustees_public_keys():
    return integration_results_messages("start_key_ceremony")


def joint_election_key_test_message():
    return integration_results_message("key_ceremony.trustee_verification")

def joint_election_key_test_number():
    return 886328318859599089638776138842935792901365373881215619109825518352876974339163786902274304863398929993879376646731679957603761140016158218040780303021373333559620258137274792770627996719130608200169052303576653699507738535110639658991465592891887415497982734234949227530624177570739615640997537507602146969172162565327269772057717410497250386425045732340681251012603399716573673777430466754043137040816217827486878468051685019707804906982917906781733234748592340847773972283845917382502666829042153209969753188599942016836117334460806012523736951994424568494390878707405007010678259644987926740991859186633625913898753029385565132494079948976584717409906688403178325219444566097189506011920914175877919268761194735189534141673829387015727309197911299771426488466046446906577408203828692172437783632724782150377705051715994851989608999795510024096859876307259164195557795270507082098130298431578913835238330231225995577853396217262450374463226557794849606423541758311127149890775740089355342466677296238538842718195191400866052346433032340326124036898266179959493039830961324911792151532071102693845671802154495704810396957175285895996684800751805928433793054000765764485219563084444107844599399922937957860357804646318830647666635837

def start_vote_message():
    return {"message_id": "decidim-barcelona.1.start_vote+a.decidim-barcelona"}


def end_vote_message():
    return {"message_id": "decidim-barcelona.1.end_vote+a.decidim-barcelona"}


def deterministic_encrypted_ballot():
    return {
        "ballot_style": "ballot-style",
        "contests": [
            {
                "ballot_selections": [
                    {
                        "ciphertext": {
                            "pad": "uacijuFLuJ9NQCzgTFyttyNKqNSDrS+tMWWsW0ii4Uyy/o6xvJXlj8YUO6sYBn8jFSb5fpvyrCQ84tb6vxtRZvs8+czqXLcUgq7Nzlnsnd6VHMbD/oFf7lq/BZmpMWJEHJx/iZVEZDr8J7qvDne+W8SGhF4bwX8d4y7HJq5A2EhulDzwvOScSm+6iaENZMzfDzv7PF6qQMm5Z5YVBfPKe02xaHvDlZFewQUdzLBTs9u64phW3skHCfXmCJ+ewGWvRvKRb4a2a2kYVx3I9bQxzChGKfOxzmLhKZb4C5w1EgXTwyN2tuZyR95JHqsEsswP4Bw40yRd6LUha5v4A7fFzFLfnjIz+1d3RmTf7W3ZJSI581dBJVTeLe8P31S+lMoj8NvVRCxp6ukXkOFJvYJNh59KWr9S8V0a1EyCatIQT4+gKpgpX406T2ZJaeZgYe38D6xE7rS02+qN23CxDCYYPvUw7Ouf3B/1xuY3n83rUjEXIlmfssdAP8jdCkkRW7R+Fb4VWdmIO07X/iFk3CwiYW6TU946cruCZeesZOrNiiFcUUYVuZtX7BTra0VKuY9hgk2QIaii6k3j+TQZ/uYjBbyB4ATGKkVY1ySGCIYBtvC2+5F69zghcWE6QZxW4cBgX6AkSxYDms/m44Fq2tkGDVxfH+gCGJq/mY2ZiEJJFLM=",
                            "data": "scPemtnXT0HPXWa8LjizdXLwK9Py6/1+TdFsdre+B8uSGRmDHi0N1Cj+s3IgDo0VwnP1s+cC62bhaY2ciNk2jhnfh0zwHNxKcr5vLZLbDgH8EHy0Eq4vVpcMG4G0c1hQj4bX8399zYF62WxTTRHumcAtzYCkWla/Z5VzZ6p862pZ4z/xvqKD8iG+IL+g/nsxNX6y9ughNKMkoIOw52B2gf4NGi/jJA53+nuGrA/Hdu47rL/V+QlF9BL5zYfqYZFQw+kjYJTdFgRvMsUNAlKlX9cq1h+v+pHl/TktjiKdz8hUqXn1kxWwFQFTVcs8I1bTo9jhhRpwv0r1/MGrxZjuoVOIE1PG596YGgSlg7uNIx3bMMNEWQksdYgUDnMxq36k4AsHEwwfbkCtPxsifCp+ToIkhaPhLEdQhefvOcWGIYTWXwqkFeTlf8vbrttvzEYqvsuODTRNYCdeEnyJ6EhHToM+BnOJJD9EwdVL6vhMiq/NCldcmJelC/agLCqJ4vQyX/Y93A0tN46cpBVN7hsD7J8cd1nwnZ8ov0FRdD86OuzkLouulqJI9cmmEeoYdzZln2r+5d0/hCRe49DHBqypLB6HlU97px8+mdy8yiuj8lZ5OG+TF4DY5h0tBymzl3p4l2Fd3i2XGTkCfZTacK532mKs1vz4sr0qr/Z6i3l91hs=",
                        },
                        "crypto_hash": "Qv0/3ZurN/vcE7MzoY5gQq5kkXJGrvq8pze+zk3DQ8Q=",
                        "description_hash": "c3MK/rIvA4poNcCvYKo+q4nww/SJ68nXaIoJjM3lQ9c=",
                        "is_placeholder_selection": False,
                        "object_id": "question1-yes-selection",
                        "proof": {
                            "challenge": "EedIeVZ3twmGNyWL6alr3ym7GLWlmESgInQrN9qauxo=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "F1Rfl5FLcE/Nq163Tsk+fA+pKYIC4kQ4t6CurzkGA/8=",
                            "proof_one_data": "BIeyUDn9BdNY44ZnZqaK7D8Qd1mu55eYdtb4fRs6/SgOuhhnUoJ6OEVkvpx0Fd1ZHnxP005EmSv5CI1VYVkNV44WZSgy3PPixjBkr7zM6HeOoM0jJJdi574xZKEHMkENe63Gir/snlwqm64CueSmoJeITRuxvhhYVK/ydS7noa+xWv/KNlQ08RHFLsxmWmaUDLVPYVV1f/RWYyd0gQZWR9UhC51oAZjJ4w1YrIzMyRFWvmTZvLG1HWWXRSzrX22elw3dmn9Udo9KcczYdU3/J+obeja0qTpK67bllJ5UC8PmYkxR7TnMaaenFva7EPEhwuzDE2uswHYczGqg/9fXex8GvVhn1HEY27+jXkotAylbKE3JhYApJtKpqvy+cBxNLVjQxAiDh5lDWizpIcPosTm5iAD4L0rjtcX2s7IT5Z6VYnYSupbSywLRJyxtFYONvm3ecmKIayX2qHLJYyUZI3AQ5r9StLZ2e6WF+olcwNSrJDLV6kIjr79f/xEqPAsgNaXZHwSBhbGCCEij1jld0JhNsLx5VSleiSmjb3gGrt6EqmK0JyKjLqsh7q9n+NyF7clDBwdcoZ7q+HH31/85KlhXPlBIWQYvCoLzoVsMCMHKlUqtjNnjdIiJFdvG/RTEd+zJM+4cNozzRMmDVDA3r2ArgxZzHpydrtZYmSvYxKU=",
                            "proof_one_pad": "GCx3++mqlhzRXmhf4zbTLnsMflFQhUWlGsNyL+dufP7csAsPQdhqxjudEjgeIkVEVZDZWSmV15H7O6ndBqnDCDN+6igXT8t36Y4zmrjvU1SJ7mTJDE551DdpuyEoyesLGBLZVEWEuCAZXBkiwefrGvJSIajr+gq1IXCsnYll9ln6e0GF7nsukME2tjBvwV1u5wTAhP91ITHZDhipGTnryWdZj6X8LR3Ty8uD1pLE2RvqbPaEvKskKFxUTBiO7bWkXmCIFGjIUQLLTbqAyOGelxOcKr7qq8RVb5/GwchdXylkfxDr7JWjnPGJgOJdQG/zo1TBewjKjo01qhY7HrRA7eMbCx0LyQO0ICiuLJcqViPUIvBur6XRnlpIu+lJ3MN8gIARXzpMUVLEvQ6ssnueE8hnMMNdxQJvJsdWs8GgBREioIVlW9YCA6gv4iwy3VqOU9h+6qE01Cz4U+CFz/WDxYjT8Zwh2LdWH4VNzGO3C1Efh/cWIKmZO9bxgJ7b9ksGcSZBCbRwms/mRdgw38Qoh53ZyFe/LXl7lwsK+4R4dJUYZxzDuVRwlFlRAW/CXbtbL08QRkJ2g9i/uTEyci/w6iyhcmsSGro+LpOah1S1k14HeTyHR1+BqBJWiZ44KWu9zBT1s8sbQy9iNk9TheFZfBOoS8hmXLn/gRJYcr/Szqk=",
                            "proof_one_response": "bxFF/FE8PYei+G8j/aq6oKRkzaLeCkJenKwxJAtlLi0=",
                            "proof_zero_challenge": "+pLo4cUsRrm4i8bUmuAtYxoR7zOitgBnatN8iKGUtl4=",
                            "proof_zero_data": "f4k6x51MDQZMURtlWfDlqTfjPVEJNkfs441119MMab+H21riTpOqXP9VSLH/v/tdYvBnmvv+ncVoGN65QbpOjl12kF9YHHTAhYcq86ueqbEFoR5XoEAFSdwKnoS4ZGm1cBScEJUfqpek1hMJBH42s8K9QoGNVY0XKmUHY7jMn7EoY55f7EI6GK73S+tB9GU74byX7Zq3eqBpu7AiT21M9LhczWUcFe13WixY7vxq6zLGOeQYY6T50ucpcpeQKsE2tCsW3XrwHB39cKSxFcGY/U37UXoJVY2iV38X2olgXjzAFpLrf6h1sgQFLUBPFPvWVhbW2nBzYScyLx3HWRrLJi1GYjvQilgPx+W6HxeXylv6Go8+suN+B7GhjFK8IG8s0AhxTIs+o3mdBMGU7sbE8fehXQLfVHhs8syQvgCCJy8M43rIjRw4NVzrmshzLopr8d2EUlua6T8o1fUrUpUed5jxZYg5ZfZ2F4DRAiiTjq35NoPg1PBQlFInLHxhTnbWPOOgsi543blvcMlGPYlcc6In6tBg2oe08LF4Oaqq5vo7haT6c6pYIhGUlB8OZQQ0mybKIRHyh9irhUtSpudEGtBQerUfkD1BX5Vuuh1FahRDDtxW7TJ6sSZtc1pZG95iiWmsl71mrI9Znf6kgRUCNEuM5PMs0tLgMKZ6jMlsAkc=",
                            "proof_zero_pad": "b3s1aTlBIIpj3pqWTVCwgcK+6DRATgy36732pQW2DObH5u4gawC8QF9BSHDD0agra64s2UDVAMLc8MVVhbb/QGMPXqNp6zCXEPyz1bE2xH7Ju0YM+eMsjck98F6SboQo8QjRYLxgXERxNiJVG8fq4uGc4000XWcjAJG9HSHWJdLGEa2OL26biqUPx3c1ui66XRXYo1K0WyfCO5tPX0jv2RyrW+XY6s7RXsH+uWvFS6eHRTkdW4n0foRQnHzrn/cEw8onhHrvqH92kGRJgDZkWpxHfd8n+b2I4gE2NglkWLgN1ZaxUmqfl+W34YkM1M9NtcaGD90YJiia4s89mu3qZ3PcTwg7uaxlVS5YoTs9PNYrUjt1Pb3PCmiz3hKrqv/mSzp82VcclaVSILT75raV+wnfbhQTFh2TZr/HHhBrU52rjDykfilzPDVxKw+L4SxlMJ2+JNaeoZ6/x6sBcjFLbabC0ic9zj36Tv0XxtQVc2yYECS1YSiG1QMVyH/ahbzkqzdhnkMjM0PREjLv+p4BrPcanBUMytXQfOPopVWCYbsoMa+I5mS56tMSSzpfcj2DxHzZn6Y18rqA5rZjaXe+9/e83iNfhp+Hfenr8O9S1FHK1EpRW8XC3ZkqhODT/tKB4Ou8sUFY0E0TIGV8sP394SVf5f7PBsmwOEImqUpYbTo=",
                            "proof_zero_response": "HczDlxuIL/2WmZjewAB2n4Ia0FxAH6Ka8ZCJuraSQ3M=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "i5PQlfQVvg2D71jov5UKgkECZRi0SUOejblplQI7w9x1Yo8RBk2DEA6tGLqVqdb/6SIAIDU+k0LKMKjHQJ9BweNhF2tvE+Z0ESOWGLqdPAjculalJuvqyBuEJe/lG0XO6e6Hq8hiv3Ydd/LKU8Q8K7dmDjag4f0fbnGPBjiR2WbOHDCCucEKlvMcOXOKD2dWjI41leIA7MO1KuEPzCeWO5v3CkyDD8WtnP0+oEVP4HzgBVhXDsq+rZaRsW0K6qb1p1DW5KQusMl/kWHjtzXG4rJVI3n2FyCz9t2ajSiLEDIcOUNM9xxNg3aY29aDoqf+0LWrHcU+PKyvjU26XXCBcdO/iVZixDfmwf2EVGmCGtsKUs2cJ8mZ/kQYp6y3GG98ScOtXdI0OQuyDRLLQRF/WjgZH+3kYQi3uEcihI23+suIZTJRREj6yuuVtMtoYq5wA2RUiyo2+0iuf8G5zv/knD830H5WNAzJiUJARs9uEBiLVJT230RS8YFQgCUQlVXhqk6hmaVvj/tY8fBlgY0e7R+McWPvCbn4tRLJQRQHy5dQLqk8Mi+22OU5okqeDdkYOP5ZhlV2pvlkeFDyISJvqr9A94+ksaWaGwWwd1hpQQwpUHudQD/sbJxH5CkgTs7qe77D3AWq+Caz8nK1YucZ+hZzoj/1KXxQcMu23L+mXTo=",
                            "data": "A9dmDAKmhnVZdQ46Sr5ELday3n6M58iUgXlcGIbelVorpr3aLTBDLae/Tim2oqtduJdov1bPkaj92I8EhIVLbaDiL9EQz4SAnsL40+H/9sCGGkiHn5f6XboOFSx+FnScj2Z6jM7R/hBm3QN0ppj23IlFW7L3k8S1InkVJYSoV6rpYdP5n9IrfmkQ0EVSj0F5gXg0is30cHNp4USVNgjv9lMTpDzySjzXbO7Tptp0alRJ/+AqyZJ2uuMlLNqrbmkfUYacMFZvxh5EYfAnZnGsN8SsMWMhQNKJxx2goPbAWOXSiRRtjpTbzxiFkqwfcZw9rbv9ut5gIjuGak13r6NRxDDUlbkP4RH61C4gvC4toy0qLwHofhroG4OPRS43wd5MlBJ2DtdVuJQAB6oAdWTnmqqrWBSRqoTNsYQIiwPYYajB4MhJ/2Me6APqCRHLXZO+K814m1zlwczcSdxnMYEfKO1XYXaE/aMQGxfPqpBP3xGzlujGecJaOsIa7pFmt3k6jvliECpzMT7vt6xrAIWWOOCJatH95XquhOcwtQtYCXZunYtRHAA+QTh4/yy4tR0w0kmpuj9BwptKdYySvXHHhhq/J0RmW6DvQ5lhsX2QvEr2/davORd7Iq+2Lem7TolLlpxchKqcNL+sKW9HRK5FOModUAbg+6IX4tWuVk679aY=",
                        },
                        "crypto_hash": "lzOtcLtj9QgASXcv84Aqu1YkFWVTEZRHY/LQoRjC7BU=",
                        "description_hash": "xg/kj/ZypOWVd1DY2wyi7o2H79X6cAHBIg6yrTKI9Fc=",
                        "is_placeholder_selection": False,
                        "object_id": "question1-no-selection",
                        "proof": {
                            "challenge": "PaMwMTbowS/GuS1SuIjhvsvYBM5uIQcXPvJVZAtpceY=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "upURWQgWx5Kwc76/973xza7xjPq5Y491RlisOrRtpqk=",
                            "proof_one_data": "MWlwaTxRkJgMdEj47knWIb/0MCxAG4Yx/rYYtht0OJ63JIF0/k7WWuHPkqBHo/abfhFRZPwDwVP/536UCXJoe7UWL2AMA6NydDa0foLe0iTOjQizPf/iW9alt8ONUN1E46a9gyrPzsGs6p4wy+i58wzjHnrlZtjhN1L7Hm/V+suAA8da2pStSNdkxbh7To7B3wo/upGvvr2FiHCY2ybDVKyelixp8l5q0K6BWD4P/pOu5NS1WnhOXAOk8j2LOFuvuTiMWmd1kng+eBxkt18Rw8o+pU+FdNyszIIceytc1uV5jvtDlMq9fxxP3rAjG7R1Fa8GhPvUW7cugjDQNVTtWLisedatYVgaO0UfVFBYe9bNk9Fqryx3PdDLLcjWF7uakEzuXfmEpdLsj0Q7eCxWNQJclM5quZLdDvbqANtZaRzu4RkOS6jpf4y1uNUXaZE8WxsZLfnNDfrr3DIVu5tdaCkzdbPXV5eSwUq1nO/o9Fx61yioun0EvHQi4zh5y+zxb6ssGyJ7AX5gw30EWulGnbrnya/oGewiRVYjnmyUxzi+1eg/vhZkBcTaqSaszjmWwnkNoCoVunKSCKvUxNSrkUCFIdNSHxasrElrp68nEb29LR4DtjGKkoJJLpYkEXjTTJSdUGqHbvlr1c8pEJWz2n9p5jaD0JzeMort0VacpT4=",
                            "proof_one_pad": "/zrrTWEj9DZ1MLU1ixKdq9zflXPtnGqdMJZ6ipckKA3AQJ29k4f33CibMtdiSEKCYNvqFW2yPVNg7YPbpTn0iErMv3s3Tbz1JWDizXuzz1HkZrElr8WxelqvQiRpNuC7PtoA8Ca0qMQPhFaQEarDW+lyxNj9eZZm8RF0nmntz7bWbRu6BCDqKjkimkLN9+nRleu6n5wH4Fju5/KvXQC3yntpjg+ZpRukDwdpKHAonbOxrvs1gr1lzJAa/oY6NYr+8+2AXPgcYKHKtsaCa7foJcUiTVGuUd5h+nYccYN3JqjQxFrBHnqtz6L8Ngv8RDZ/apeT8z2rkSTY6JkeSrQOwIw8LWLnO4uvk+sW1hf7aSfKEsAbEv2tQb+q9TVm5hDdT3Q+z8ydzltRSqMccxPSyZZZHr9zxCo1qkI1OxW5DW6/Otfykw2BJRzCrBdahPxgWIoqqhWEhzAfqSLvJN7Nxq88SP+9NIO+giBGkc8Cq6r3t/BP7wCMVHZSQsIwzrB4T0HxTqu+jcOnQiQL3aSTk0PI+i6vjHy8vnmTnBD+c7HLwDO8r7sUJ7+yiBuB17JXmH78yNmEhl+3inh8GqPw6VrIObio10sC5d3GPkenzznxvgcVOQU68k1N0kDjLa5d/SpNI/kClHNLhi4ptDFbVV4LwqYsY9jbU0Bl5mkmVPQ=",
                            "proof_one_response": "GznetFfN08nrETYCVkZpPKWFGn7XKacKupR9GEJDNeA=",
                            "proof_zero_challenge": "gw4e2C7R+Z0WRW6SwMrv8Rzmd9O0vXeh+JmpKVb7yoA=",
                            "proof_zero_data": "dewrv2A7qGqrYbBzV9M/79B0OiFNFryl+Q0Zn1v+1Vveqw709bBWsgTCHe9ySgyFwWlOkQYGDntMgl8ImONd1C95vdtWU59OXZ7zSFE5fMwI5z3YmInTU0nmz+RfPYnXO/5aNlzf/yCpYaHoVe9qP3dty4NE/gQjKCO6/tKRBbqY8PP8rwoelbHjTtRHb8YzMDxrN6u8alosMJITY1WzSCdv3xL5y4g9nvuJUTYUs+L5PhuJ01nMjK1FGz8/bAGcqZi+kU39gHxIAdtV756zlAN+kiMhZYFTCdC0NjGCcfdGm+Klj2nQSps7gu5ibWnaLaiqNDuNLbF4+WxVjFsiwdnK2ZCD51jmwE/MrRqrbk6r6KeNR89oRIN4vJ5QPL24WTtzh9XwXGf/1qk7snnJSFKgXmKkBClPdOKjeh4xzmGZ5RAU4qzEQAQ+AhV1fLjm7cWkjV4w7RJLkjrOXPfizV/wFOPD5Aq6XGGbRjUYbnAGsevQaOCeo6kJXzA3NFk2tVaha4iuIZ9wljmrYIm/Jn5uhcb1dHBYDd/CVjCWyyh6u2Z+JgIM5wYOHmiFyavfXPHaRIV+pGrvcTlXkpuXb/D/LP5EdWSOhJVM6Tx6vLCaeQqO0VuRWQrtCBcA+4Af2ZS4Vj7wEu67oFr1IBE7cGKBVo4wTm+NsB2YZC9r2dc=",
                            "proof_zero_pad": "+S9l9SI2/nUU9y3HmnUdnc2MtzpGrSwYWLPSrr7kDPPq3Get1u1P3ea4cu5qsUoZLjgENTgzlApTxVlcXiHD8HEUg8QHVKgEpk8Q9XvgXpOrLpPyrr4W8PLwXGtlTsWeYP1b5PkXQ6ddZ8ZLld+l/orIePfV/BaLAv7bVHCMP6gceMr3byfA4VUYhOA48ugh9cV+/jr/aOoICQpqB9KNYImL6N0IEFqUVKFnXmS2CG+wdNcbQ+54DdYy4Lz5uiNVpQ3k10hbqm8nm4wJilvPu21RRwqk5VR0Nlk2nAJnqNbHY9MN0noz/1/FDhdykgL7kmRsJO1ex63N8lk4GNXQFmD6jQh8LtRxZyrGKmqJNgHeCpVJLXS01EFtEWZw0gPnNv/cQkM+dNxnpc0evYN8wP2zq8hVe8WRj2qXy10aMwa/RTzajCyiCDS+IfxkC+eBOCexFAXC2jhgmA+nkFHOXHo7n61AuiKuD7WDf0GQ8H0qCVuLG6NpmflFkbALRvX1slQRP968avSXvDsONmYIatlHN8HfWJEsbPjmgHFQYxBmrstyvop/fQoOUJoIeAzleC3OIV1twPK4G2g64zZKLGAip2OMxl9ZSVtjAupStFx70rWRf1/VYz3W3prrT2ZnbT0EYK5T3qZ7w6d0W++86x2HzO8SSVLYA+emZIiIpw==",
                            "proof_zero_response": "ycGttouI/hGVwSLPru/jm9OidlkEcUN3EZU3o8yZAmI=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "mjSzymqbCBh54DloP8Bjq1Epv99H+gcocm96eOO3AH5l6vTZ/XdxvfLvg/IQzlOGuyjyVdCyAbcDpro+r+jgJJiOELy49FQdlENzFBpffWAjBHqseaNbObNjkgDPW/vWf7PjpKzp5QfuAsUB9xtzv12rKvFC9tcYCicYV2n1KwzcoWi/ZQqZUJl4NpJUc6GFpt5AgAMhu0j2dyZfNDvHcXy1o9O+TARs6aK9gKC+PKmTtXV3X0LFq1WlI9oZfwXHra6B93bLANL0v00Jr8kjVDkQ7CSjEyij7QnuhxYhfZpR/29q8ulAMtdcL/YiiRcDGK+V+Rs5eDeFHQWj5k2Hc/5lZ8z8cR8G8BUd4oMzFX9ZGY6kVaJhomMqR3VLO/qDGLEjB9xeNJZLTGk9oSnb80x3ZjWNq6oiOjHLgm3zXCgcsAv42utk8AgB7oJD1p9qxtg1fhI2qzIk6rCH6IxA7Hfnoa5nGnN+VxPxki2vg1shUOPWUiiTYQJR6VSamSJW7wNTttgiS03+7gtfIgsxaNUm2b8aYeJV4zvjh9cjLRwPadMbzaLA2yUl1PuvkahYu/ZKzxjvCv8hAlC7iJVfJmWpnoXjpETkeUVvZxDuf9fgf9UDAz0kVcINl6e49Tb9D1WOr/7bVOpw7vFE+1ixuPmqE8e3/DgiNCIeW6/KweE=",
                            "data": "1CfMLORnhBP4CJmmpmSfJBRGTfLOmblgijgm83yOlvSlrFiCdnuV2WRTka483y7G66a8R4yp9EMm3El95ij+9/WeDXQiLmNXWTQhsyWfOjVAFvMgsQAfCvOVDLbQWnWDZJvp3M5JetSP0ZcR6HEXQNjIXwj1iDxJRS2bXUhAXeGabLWKtxumXxb2un4HQLXH4HWLY1a1GgHgMzX+pzujLJ+jHZ3cpwstWS0XB0SY8h3AdHcyHuDHMPPPTFgGg6wGPBrdxMx9Rg1L2nqnZdLSgWfIjMNeE0+dwBtW/tSIbfpM9erHZCbQ5wj/3vN+adfzDSdGyBLFcyA6YWtpaIhvch6iDrKR6fBYBf2EbgLRY25Rctri0x7OT5Zzqlph3DmA2e7siDSUNhWi99LUNYKfGH5i/h2KwADnkE+kKbEC75rM6yluPN1nDm4/BBK0pruB2K5Us18S4f23TTskJiB9gvi3tc1n2zvJBbcmg887HAoRZ2h8qtGV3iH4RtVAwDNWNO6slicRIU4Ryzjd/UZK1jbj8GtPz3dXT1EN+O2EfbIfwi/WCXHtD7VIxOmyiSbUeLbVZspttS4lAz8pwhP/49sm4oOob9uP8aj8PnZZIBxtTXcxCF8o/E579i20iaU510HX0B8nh/F1juB4y6rUXqAicbQvSlmGijvHcR2BnVQ=",
                        },
                        "crypto_hash": "9ISne5C2xA8+n10N9Oh9/LTH55uAPBBNNUfJcvkp8js=",
                        "description_hash": "y6EBY9uv5/gVkIz7ZM/OtIT/5eKTB2+7tCDlltxlFF4=",
                        "is_placeholder_selection": True,
                        "object_id": "question1-2-placeholder",
                        "proof": {
                            "challenge": "Oxn0CT2YiCP6tfuLOOSp46Yj2UoMQyqfZCqk7i6XWIc=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "/GjWHugzP+hhpV8azNRgChfqv2bEmc/EU6m1KkZ7Upg=",
                            "proof_one_data": "tkF3UWL/EkM2SifkiXju/5lrTiV9ACNZds5XmTYRP+SqoPJNOXZu+Z5tHsdP8dUSvlEzSf6ywCznTRQKFfc4lJoCoIVhQvBmqyMMqTZsV4UKINkaaPmshUyVAWa68pj5nSTfA/wYfvESrj9XINGa8u3Kz4V24NJHp7kQOyn4WxTKAluD7WkgZo8zTVHZ5U0TLi0PNC6rinUSA/iC3aD8UXZAAkSxaaXPavCD3HTk1L/dVt7xJICGhk2xTpX6eu7sPv/33rUD8hiM4ffbnhdIP9Tki57p7bOBCeWeMLHhV9IRksO2W5uH+VbA57JC8hfU3Iih39HUqdwVSomLhTumUay28LlqEVgpk2TCfQgxHv9PYfq6hsNGIFw1E0b3b4BYLJoABzPBo8QDWlJj1bjZNrR5bQf91cYF93CaPnyp7UJDa4ixMmFeNhRnDECd3QOffBl9jW3ezN2um0q3J9dySaYlqFJXla1F7G3XbZiBlWzNyXTaMF2EwQ0W25fZFT2pCAhQ99Q99tZtFn880656HjoKg9rnaiJ32XsePptKzH6RtTSSNRgPklRdK94VfuLOYVDWH9gizUWetPqEo5A6CGnWGrtvahIv2uAk1MrJ/zD2HO8HeoMWYsBcuUwxc6eY6KQgnwFblpScUZSiFv5C1sAhAxFvdZjT2r9UOvQ4A0s=",
                            "proof_one_pad": "EHVd7zcEmkBt4uieWde5XTJPIPUYXv0/cOFGaKxjg22drt89S3sEJwYmcdL0+oiMVWZMLtSl2Dtk6ZsLQ/8oxoMrISFqIVGt3R8H+gNGqdm6H4M6RKsydHaMmV7bDjDjM2+txSymUiIo6kE3xkRqz4OGdK9mHQwXFf6Ma4KttFSP99ZSRIyQE5I79aEC4vFQwrHiElWhq87ZBmhgnQh89u9wnCivk1h+SC4E6er1okzV1qB2on7a/X0P+fKO358uONfz+sJcxk6zO/Gbf4dJcQz8wrhJcNG5oOQSZt1/vpYrhJZh/ow1pnuibd3vNO/EXWoPcbxO1FqplFGskVfda4Jg0UFBWDCTxfz08kG6ehGVFFedYLcZ13TSRJ5uVLSCBihc7zBU8xwE/Go9KDhL0wPBTobDUHyAqvJe3bJZb86TueDHW1ojcDsAyEoQqV9wkP0tvDyII3bcbAytih6Mcpp8rPzdozDrnDG9kZQj2K3dYcz8jexOTYdBc92Gz5T+KjAZIU1lSuSqzl6eo2pPUxOUqJ2GegoaQ6soG0+SY2joJaL8kEWT3UKIiaDQDmWAtPnzWX5OW1ISD6kz3LSy2nZOrQctvI/ISJbO1++wSYdVvmWAYe4p3bDugOIxBWmcUrO70IY166ITUIJjBDc5cc6dXu4uej3Mi3E5aS+DRyA=",
                            "proof_one_response": "+ukztA9R0njoOCDVDpoC9Z+8qccFtY9PQ0w15uVOW38=",
                            "proof_zero_challenge": "PrEd6lVlSDuZEJxwbBBJ2Y45GeNHqVrbEIDvw+gcBTI=",
                            "proof_zero_data": "/H10L5qMA2ZtlFggldfJLshJmPPq9sI7JgUF+e3st882m6eCVzVx8MmPZMTXVJs2yHZOX7rIQRe8JD4gMRuWSjvSq0mHjYOCNxGSe093eR03LnriKRk6BwArjL2GdMxRVWlKpEBf8pTeRb66sKbAEntVBoYYqBQCeSfRBodOuIgXZ6NmMaO7sMV6nqLGMZqBqstPNQaFM5yv8Fheo5rJYpZ6FWUQ+T4OUWd5rDCTzdDG7jwGX+bwIeuH0pZtSt15T9GWzd6U0c4l/NYikEtaXtg2vgTf+YeCA7PyMrPpNt6YNmYeTximG/1ov5D2tgH1f3FfjOR6ANXX1zO5bZcdNcH61HwiubeV3uMAQr39y+aqmSRwINodIPfLBH3j7QLY8jeV6N9qouUJ1pBla4N4kUMMFmOp/uWRa8cNsPwuRUVtdWfpHp0vVIxtowYpf1OWHMaECLaWoMkRfSLpjtGNGUswZSEaa34kcgITVT3mISY11BW/nplZ4R+YcoM6nu9nelglkGW9mZGtmwsbd59NTrKdRy2c92j9NB4x0OZlwX1+RZn5NolOl6ewIx9+o9zX0djm9gxqI9+og7rasDC1L2tcRUGUXhYGnk8Mz5v4Urp2pI3XJfk5gFBR5eg+auk8vZggxJnua4S4k7lUunJavyhTIET1kiZz5ugHr6VEsnU=",
                            "proof_zero_pad": "4DgENqHPxPnlod+aSjaZ0r5yOX6IQpaxxUjUBjphd1uFw4DFRViKjZEt/OKLPP1GSYTVjgNWMd31gAS1AED1XKR2zuemxGuSZJY7lBAa9sxc27uOu9PI2z8fxi+5s5OWHLd0/bmn4OfQUK0MdoGaek2SLLOJ5BDS/0rPy7SooVh4jMOhaeK2jJvzqJXCYIC7RW7GS7tbJw8tD7AJ95+ShRbH+3S+yqf/eMWXAmLofpwvdpl1imnTjhYYL/CDJKZ+shLLH6gVv5YqwXV8cUz5XL9Shg+0pVyWoHuZNjOr6h7dSSAMrRmF8ej2NwkOdW2UyOLMJj6XcTFNg+oiQvTFZ328/UiClHWxrMVHMD3sQy65u61fegxEnWrrrKOYHwUfJIlpf9Z6pauE53SEpx82uGjJkqb+cKyu9gF0Qso5bfM1Mu9IrIXOkfXgQ5gQVALqpt51QYuLVwcGWzhLQmWI8uB6Qyo6A91sz4ZYI7ePrLkpCUNPE+T4yqrqnUCr2+gvIU0kt30BZx/A43OODklnb/4GxN5ZZsE3pW8116Z9T1MvEMULnZ8IRxo/GWsUyh3UtszT+5kaL7zq6BLQhtDDUuCg7y9g1UgKsyRkfe6W5SWOK3dfZp0HEw8gyYS22EPDkrSrmo7PYLkAaKXCTp3sTcUssmrekDe3WHnFvwjWra8=",
                            "proof_zero_response": "T7bSR+Su46zA8i+rJO4Z6t2HCBBwI+aFE50oTQuN7ig=",
                            "usage": "SelectionValue",
                        },
                    },
                ],
                "crypto_hash": "Ui1oJuxPA9ly9KWopYsT19veG3iaaTCihKHvMKp1Ke8=",
                "description_hash": "zRhfoa+0QfJYxeAyBST7TF7+ApGlwQUyGifvlT798/0=",
                "object_id": "question1",
                "proof": {
                    "challenge": "Wrai+gbjIzp8nU6c25eKrv05+SCij5IJzv4PVAyOpCo=",
                    "constant": 1,
                    "data": "AnOrHwqOLLm4dI81tkuOvX6LnHd6XfBCBP3eDMC2mNa1oEYR+YG9ymM5SoRuyMQjVkeiTlHqRnX7cpvBwhf1H0Sj/zTN14tUPeH8WmLOcz6SsXf7PgrkvqW6ys8i9Gglj2q4WW7baGIk83Ef0zsfOpmFvz+gAFOenLP0eQXs8DeSE9s7o0KZA2DiTsops01ga19fBHHcjv3X0rMka8XcZ55K1Aj5X7i2ijGJQzXIvwvmsGCM1sfngKBWyRbGSJAwPFlBOTWTiNP34CFROpn4+VdOH0xtrHeixJeGgrWJPpQZoM60gTnMfu6nxDV61uJaGe+fEgnpvIyVRf1INjMU3dAIPqQCxPxh0g9++5CCPI6o6BKpI6EKupuLWKyELvoTMz/kylzaYyWwHgkmHTXARLFph/5/2/WYmJSfByXg9EljwFNIVLvLCJ+AAhw7ykUEsFgfHf2YGWsUY+R3DzWM0/gmiSm3wvd0K/Q3cfo0IZz+GFASFexssFHxGu0lfGHwMinmDh3Z4B7LZ7uCNBr270a6BWii13DrAFNYwP5RpqmqLQZIpFm5lwMD9JdQfDPlZJxysGNq7YJSH8qIv7Rs6imu7G/VyWDXEmya7JONA4k9sow0pOS7+M968FyKzLtj2aJ8R2+xeXwikIJcf1gQM6Wn/Ew5HG/Qy/7j0tQIq0I=",
                    "name": "Constant Chaum Pedersen Proof",
                    "pad": "NS0U97HWsffr1mIEWVt8punLguBdmEn4Pg7O+YmZL6rmGiDufFFfzPWLoU3Hgvc2q5FhlTnCyHEFUtxSnRBIJwY/YCSNC+grtf6z8j8w1GfzABjCN2bKSqbf/PgO3tsIkY0BQQe5NZ0s8Hkkyq4OEj4TxNFyw8E5lCN6tbGTgzBbxpqk/C31sy4MzsWHBFGVA0+pDhLslOjGZDu3AVbV/nhcAA1X4XJ4pBsuGU5e+mAhKTA8agxcx2KAwU+72MpHkCdsw51YqLCSXNY9DgzQFVBe2fVz/5yo6dZPctgK7slqTDj+MMqewazdKf/fM6bGVLFi9ib1wP50TCxbn8YAXKzsRP5mAYHrEAMxUBIIOsU7DUlNDN6A18USKaddpcbxKbAAToMVEvB38glBxl3GsHTJ1OcJw5fWewycmq31vS9Uf5v7E8X8mw0IwZvGg7TQFVPCzWpLbbxX625Rx3Cfjo8Ns0hesdWnKmyBzVoKNzRVHqBji6m5V8APIZP/GQhFeqyR0XWYOGWaJEyMei9Gyiq1W7J9LBwInGnBhXk9O8ChhkyXdbGqEgfoZfDZySy8tGi5S1Ecp7y5YNqYARxrY8XB6SRQTkjqkV1V45qJHRcQAHQB4bTO9RH5IXCPuKVjiK8E3lBW/TpxAMkA0gR+Esw2pHfMAz/z2RQnRTwrDho=",
                    "response": "JG3UKSYdnxicm62H3o9/0GYGaKkRm0XgGJhKm7ptbQA=",
                    "usage": "SelectionLimit",
                },
            },
            {
                "ballot_selections": [
                    {
                        "ciphertext": {
                            "pad": "b+n7j3whygYRwVpnSp0Ig4aaKEpxUK0onpFrWwklWkYIw/LrXkD8R4dA26zMI1jduiwYIleQUWGlWvfCmQ3TFTvmN/Wuw46rettq0tGcGqlWx0vLEivlCJCc3KaQ5UhZzF55v94Dv91U3J7BTzJBJAWSyWBz7pV9QKEeG1GilxoohgG8MgKLZGUpuBl9qj0a30fgV5y6oTzsybZkMqR0ZFAcIGY+Kq4AdSWIeBx0DYKXrmF17wvwpTBhaInQgBXSmmsgYLF0K5zCawIIg4EhIJCNIyKO900n9x8NnDPImldanYe0FfEbnS1WVty0TDJA0tnogL2aX9qgghs0JHdmRsJHbThYVf0kWhYJ9Pj8g9Ow2ci5RoYmmshmxPFF8i4IrprM2U15ROw9i0CSFnkQrqgi3NNTVS87ELLQSYty0599SzEp/pJTXuC5CfNIR4+LnvYcE9BV1axZQKeczBlZHQn/WmTm485b6x8+3trWMSbdu5iX4mBoPN+Pr8T6WPC9xDv1dgdeujqd73ycddFNUhW0Bf4+YHtFPTBP5X7Vm0uwaoYRSfLOaJp9jNMVZbyTstlEn2JMBsFYv/Tx83FXMeIFc7DMbEmYwa754MtYmjENPPOAZk3a/fEIURLxcEKl/2vawroL5AmLIeHPGPg/L+KgNyD6d/KpTba93vSRm3g=",
                            "data": "zeUGx0CQ/7Yi7IZtoT6Zale9JAmOLUY4egzKe3FZxlfF7p3FrNKsrQTGV5CGyiZm3+gGxFKkN+UsQALnIJIfKlYQIfIoE9yf7AItD5xiDS39xNkaXbrEBOoe4SpY6Ng+6VRctcvKMRLYfuKe4bGEgi+zyaS9ekbEd9bTReTP7ZNPKN/TrsIoIVgFbnxSWNZG7bchi1k31H6HqCTLLEjD/GHPuS8Qv5KjoemmTEJMfQTWlO1Tdk3Let0Bt8hCBbhw473+ZM5sxEkSANhslW4PJdDIeQFxwL9DWkqKZdgzwbzddIW7f6o2sptmitOogXj5B8A6L/W4jQoHFj7cFk/HnNqNnhjaBBAZGCp4SBC1lRekD5EthWA0armoI+clQFkbia2sRiI082+3EnHmwYz/azGkW/vqg+pVzEtvZ6I3O8EniK1cb9L/PSDAtJyEuYY/tyqmBrRkm1ADBCbRu0WhksZr9qeEAYQb6LPQ+Q5mzvqUVNXOL7JZBMH4i6iD3HIuVvL/ha8HIBzzNXfKc2Rt8UiAcwH61WQQG4A90pZEGWZ+ifdw05qCG+3BSBU9T2++i/QSYnnIpLac4cfDpmZd2ucyAw0MT5VoCfW/nVdxLfwm2gJ/8j86m3gH7tLlyqR3zkqol9SMFSGgjvVUh3bMLw8X2/Bay1Ejb5SPv5zHljQ=",
                        },
                        "crypto_hash": "V1cdKwBbZLRfmQvLd9kYpMbXOY5l0Rlm+dqJTjwWzs4=",
                        "description_hash": "jAgyxUa0BczRK250nLL0MvZyGBUwaT+APxk024CsAfE=",
                        "is_placeholder_selection": False,
                        "object_id": "question2-first-project-selection",
                        "proof": {
                            "challenge": "q1F0MvpQOgrzus04Q4LMrhXj+V5GriUGNjRuDowEuq8=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "gaye2/zQ06FsbLPtPRig3uG+jHuhBB5UrpGLFG2dd7w=",
                            "proof_one_data": "l2HI1pEentvdgzd+m+mMuVTmwqNo0HcFwvzW2HNPtIwEx8fdbdF9YHYztk8RTDI2a8dPQ4zSKuP6n8gy2QdEKeemF9IK4YMu12wMyLGNpGaO3+pAV/YRk7UPn17zVOP0mkoihNE89Nuc1UQKT2S7W/8MFJKa7j6zxDmdgnTYRNUFkwQhWl8ZpeCJkux4Y7BC6TPfHbwfvJRJtbsOK0voFoTWph6zk+3VOKOx90fIRN2IE19dzOW3VgXWEk4/fQy4UVHgYbuh7mlPmtzKIEzqZ6gehSmuBcVqO7CAb8zDpi6zSQF8geasG3Ke47/hYuem3nLkJZNBMuP9TOtm7XIx3WtFuLmeS6PLgZ2QPFiFXe6t2oMMo1znsVSefwkyYiPzDQM3rOyGpi7YS29DkRkYhoQAp3Hchpz9esa28RAMGqm1yo8zGOuzFn65mwpxDJjeAwqx+JyIsfvuhFX97K6SmGmInAY4Tt0R0Avy4DepvD+bjodKO7jCo2S8kbNNxvwBmQMWIIcvq/VVQj+q7b2GG+j6HqGEhoBDF+H1aSRgqPew4Z5dJY2HInJ/mjW/Bf0IRZX/eicZ5bLr1MyD9qdzqJFIo9OnSCrxdPux3gs9l26AZOPAJ6U83YbzC94KtSM/UXfB/zdMMYTJyrwfpa9OyUqkYOF6o9uTaxYxAwnSyyI=",
                            "proof_one_pad": "4usc8w/3KpBo2PMGcLAhhc7Lns0LngUKUhATbepQTbrZ7zwhj14yZe/1sY0wXpL68aIIVXKVnuE6eD85u1+oPjkePqQXtyM4H6utmAgTPNJxd5k29YaAxiz8pkNECMVeq+Gd4pd1tm0czcpbypu6/GZelKW9ovRSo2qgIi10twgqXojIy/afXdz8Z4D7n4GMfVKCWuGR212hLK7rXwpTYme71F4HcK42Z/srb583JAkwcTIF0Ou6zWBQqatYY7Na7AHswVnm5O/wRqflTj0kiD9fZdsR1o7QYvc0tRjRUlTW8KXTBG7UShQbWQLwUe5YQxOjMEWrnlYxeWJAGxGefmKbaarj10rI3NNHF2jSYSe2LZZ7LE4zS1bpICCF2v8SmNC+8bCmlULanrO0ELyqSR7cZM8rQamB5NlFxGMvKr0FabgxRvhXsCkmJ6zWrLkgU1jfDMNiaCSI7SO4V25LlaMG45c0//Jhi5HzGAPai2dX5o2Px6IirVJuwHunqoaK1d9c5hKuJNUCiAb5gh7qJH9CAa7ZRq3N/T4Fj2/OBVWzuv6z2K12ewqfzZlJlmYainO2P3O8TEf5d85uNT3t12pt2RPhMo8ToOxE9irf5sQannVOiKynfYTht78fi0gWHttAY2I9SYxSdHgWLhwt+vTvqZaagubjtAbq25SZ0HE=",
                            "proof_one_response": "FtfiTS+cTxlWG8ZdyhpLb3j0uTlr6OGQL9WPI6Gon6s=",
                            "proof_zero_challenge": "KaTVVv1/ZmmHThlLBmorzzQlbOKlqgaxh6Li+h5nQvM=",
                            "proof_zero_data": "iQVLoih4uMAJYBNXPgRCFOGgWKlTAlow8MnhAxFiSWC010qKTwBN2zM9NthziLNFitRSjTpact4h1lGMgDfAKPmJ80GAVp9qVMaRA9Fd1xPlYVhOmQhr3XBH+uU07/r0YudbDsAgMJ4ud5fMt14ZUy01awJpmvnRKha2nGKd4e/BGTTs9bpxH/AG62W84wMi4Srf8DrKJRFZnOCwztJuRmTqldYzbBQ3bMC3gwucjf8a6EwpZj4as9I7m/wSfa+WDKQ+OzvCPAlpRd/lIGia3EdXGpUK49r/acTzSR9rd4O3JPY+jQsR75L0rbetki+qbEoNCBzB/3y3Q1WF4KXJvF4w14UV/62VicOEDUbZAa4ORFXDP7BJ3+oeyBWZR4uSrYvuBxQAh5RbmokbvnKJdIl+KXwfmCZudSSd53xrVgQtKdZqiR1HFxjRHZ0tx8qPn98/+wvVWJBhM6jgtDzZUQUQ71ZK+YHLot7/fd4EpqO40ZeQbiZBvsTIqKqWaQxg3C2muCDWoov1cJjWV//HdEj53aUCr0nOCJxoDIaMhGetC9/HHd3MnmX1HU/imwmfE5lCrnJJz3x+/0vUr8l+yLvjYXKBPLyEt9ODE90Az2RjnhwJ5fDBo4wTnTnxviJS7AcKPnVKV1sl/7hdf2WqoPwsPZYqtfTf+TtkC+//L48=",
                            "proof_zero_pad": "dAUUof0nro38e+QXVeO/h+s1DiTT6PJTNBcVmAxAMGKJVjePbZoyjW10Usl9N8xQppM/mEE3ppQKBxkiAAmi28/pgKBx99UdbRqFSHutJn/GXBGa1su+UQZb04YmE3uKTWf4oDDKSFove2EtOoQyZw5JiEWODM5600bHLMwMh0Aq2TeOf46PRavJV4etZKyD/aMptgpsGaq2qhtYx9MN8l+RrSDTLWDKe9BcRBa4OI5YS0jYdwQn27DSiO0Qe4xclhXMhJeTxNB1AJyZvTYhFenvY9nGeAoE4SA515Y/ciK+g4Xx2sIdMtOLaih7KcT/NvLZ7sRad1cRZ2mEHH5Xxe0/X9UcT64gzZ3kjSk+OGFbvr+itgh994yRNOLX1AJmI8wWqOrhcbfyHqaeSguyv/rPzbb9QeIvNoUrBDCsRCP238p7aqhlvN4dt3ULhE7smOpbdj/YukOq8+IbIGXQHiAlEW/TMTzBgZzdzU2NUY5ymFk1+lTQrC1MwJXLk+PrxRrjdEY4ediS1vYQMKnvLYNv/axfQ7lx1oFE7yj6WCrgUifbr1WTn2MFkFa6+3AF6GDY8p8pE+On67BwjIhVzkLWZ7foHsgRuUj351Q9bcRoMGAMCYLW5xVw0w2UOOc/Ov4HHJBsa+RBKiX2+hZYADFCDjGJFX9tjSOi3CSAPXk=",
                            "proof_zero_response": "9G9RDgtp9HUEhhAPXYiINZpjd2J1q8Lkkr5ESa7P980=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "svYMkYbRm8BYD6ai4xFRs+D4A9lVZFXus5UCFXWUBB4yn7VB56trI0Jkyxb4t01vPBNqnKK/+OzLnxwgqpqVvQDPqR8O3LTWAycmKy0qsRSMeskwjg8DvEbJg4UsOJCC0AhNQZNkxA3D0hV8K8vQO0Y4aCXVvNM+eupb/zqYJpAIRc6RVWCsVY1hnBCaLMif6x0MUg1kdmP2MzQ1RLMrgt7OjUsFZuVua6unedjbwijkXHIU+uVAL+FKMZVj96PEo6TB/1kYE1U48YqWc787TcDN9ew2HN9H2QR7qfOIOEPmoEnjeieJnN/0203KGoAZDVdWMsIO2PWDo6uPDUevqOnR/q23MdI/0q5g2OBDW3mGY4wSuSWJ+K468bPuPVrSHqxrgoQKx1vZWUKkEIVHwu93nkLKmx7bw6UI5A5xGvVam5q26L6ypq5ZzEUoEiLToTVUdnN44j8/q8WCYZB2pPupBUEgLCmmF9kBBw9Cezx0NnrXY/8D3zsKeFoXZq7pg9v4MhwRlQf4LZ18wM9wMR9/w5L0dij5zNJvoD7j8eCq7m2ES7fmawP8WI2Wx1s7AZDyb6KtVOelmhNc17AL4lavWxav1sH3jF7qRZu/p98tMfh3Dhtx1c7qPQq8q482vXXVzy+XGM4JOabRQ9DeQg4+ky/H868WFBk2Tf3si+s=",
                            "data": "2jEICcaRfZKQcLg0oLT9v/MG1qPKlDYtdJig6qs/XhFaZcFoHRfnG1eAN3TPi89uxyLblNmqcplE6OEpBDnJALcQrpxfwJl1vfQSaQYSjfQntN+vblVUZbmYb5Em4MUkIGsJC7UGw90ZU2zFhmr4L+ScqQoTEYYcc5nz+FKhixFix8mm3GJMCgV8H3zFAqPzjpCfY5c/V//juXB5Vy5u5b9z+Ha/8MFUfv7Xyb7+EDE53NL0l6uBT7unfu9XP6biUVcZkfodGc5iblSjDCFoz/+FmZHMnOkkOsaP4c+CScNUdpDDyTXAEBgqIt1a6xTyXzpsR4XQ3ui4tBhnb2L/nPFIaRPFJmJXRXE4EaYT6RrVHU4U8LwNBdrNmoMeXltNfOjjZmF5eEXEPTztrPjS/rSJC8V01p++S84q5O+EEBgVXTIFWsyNt5hfdOM7lkqn12NNatSfaXM1AZO1/NGXb3ZRzig9WXzwJAzLMHr0MLCMcphPQDIZKiqQwNbt/fNWL1Ro2gdoJ7JCWIMSp7yzNa29x+wNBqiwXv0a8Exf5Korl6eRwP7fEBRNDX4KnY3Np7YIYRaZm8fpHzksTQYyEjabtm1JqlX0FcJ365NcBdhdBLb9IWkY6V0FFTpd6hkaoii/MV9crEtnzW+Q+JIMdwWxpznWzGuMFJzSJXG1Fv4=",
                        },
                        "crypto_hash": "xPf3qRuw0VZJk/KrELdoNiY4xBmSntLZcBXkv5acTFc=",
                        "description_hash": "bjlPFhEuXXZgUWUmvfvrUGqXU63SW6WsayM41Yyf1Ww=",
                        "is_placeholder_selection": False,
                        "object_id": "question2-second-project-selection",
                        "proof": {
                            "challenge": "d8uAwL+Lw/KRq530YWYdoHG+8nF28MOpqWDxipSJd+k=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "pXx11xD8AE6VL1Edh6lCVtO11tfR8WfGfzfUBnWPQ1s=",
                            "proof_one_data": "oGRYBPH5FpPGnKtXRe1rTB+sOgpiAeDOMMmgAjVX9Iq9eu+Nl3OL1yRstZaq35k/DtNQOyWQfpf0P1ye9/B9ZVEUg5epeg904Tn4UOBuciZhDQLeLzcxzomcMuzfDJFzf3WbWES2uggilzzd7UdtvU3Qy/UxWpWsE0bS3ZmlXHxhIj00+woC4adAhhugw1hTekn/Xr+riIjdBm7pDYdID6I/45b4EHry0aVdT63Bg7hwJqMG7gqQjX8kF7LjZl2u03YbjNBH3nTJQ5wRBuxOIXDW/VDI5AGH8ClzbKJEfZAEuSEcYqXWosQ2fId5wfxrBWYaMHWZ77kSfaO/fJ6aqX24j8CijZ1p3En8meS/89GkDRkT31K1LFFPysCVX1dXbhkT0Z5TH0ngHfalmgmjBXb+C55OC8cyd88/cKMi+nYX5YCHqhdrnUSQQlNEtH51GveYty7SCWaK7dWq7loYw0YeeICqaE/3vgU5XcXlfA0V4MdfT3c8guKZoJ9LBx1uKqp1on6EakaX+tmERFKsxeWubGrFlZnTCyr5pcdkxYar/AJJA3JQNxrsoY5RXG7VNxRbn8MMSbMqkNpb7rm44sKZfGdWHKBza53GSqe9zjdqmcPK9M4ipCg51MPoSuin4UEE1HDLx0H6BqRQqG7TTcQPm3/T/tHJTPy8MOzD30k=",
                            "proof_one_pad": "ZsLwxikrqkl/huumrd1xZhgIPbHk5NEHstDkDHINNcmQH5M8l/c5tuBMYOlr6xB7QrDD0yJnog7OIsjhCiBdWDGIYgJGU8Hr007+SFKFQlvjVg2Hmw6CweYwtayhSN1Wl0Kk3fMwpZStBZZhIYrgIoKHWHMSuISMs2vgciUJzrLKnOpiZMnKUW7GeZMKO7WOEmwjdCDz0U3EAo08DHj6Y7dIXtBnCjPeR8B3XvOupUCcH6Z9q6bneMLiyZ/AJ72cIKs+YkYRLfW6vu4vqLwMUNcK26cqHrXB1Jozv3ohGlEbNsTQorUL653iYdkDg3ziigViH7Q9BTB3csRnKHTn9UIGXmRKkfAvm+Nq9eLnvreMAuVn9VmSz2r+cVD7efzidTU4ZlEjciwUU6OvW+k2cdBYJBhQv6l4ERMuoUdh7pOA7kBJMgTDhNTaNMERoij+8P3exb9s1BzTJ4iqzh/OezPauHVtBv2vp/w83hXzlPjoxTuqMp6UNPGl6RGuTbNS2FsvafROAFqkgCYDyJlPhPemfoM60mMhlLo8wUtpwmW2V+dT9dH4UhNIOMNqXIvBtBjcerTEeqX9OvTl49ObiVp0WvIFI65uFsQ5Oh42TgLvqT91pHvhpzPX1vg87C6N77BCf6ZWpTP55zLsdI3rQt7mxhbDOMJ1Ex7Mt9QNEc0=",
                            "proof_one_response": "rSqMsZTnzvJUGlTGCwS5wABeWXTnzuZAdBKTVufCtvI=",
                            "proof_zero_challenge": "0k8K6a6Pw6P8fEzW2bzbSZ4JG5mk/1vjKikdhB76M9E=",
                            "proof_zero_data": "xs3ksYbIfj3y1Q/nbFK4F8fvMIfdyCTmyuKMUvbZ42dAmwDC1oI2NNTaKQjY7TPS3Z/+gw3Lcm4nprloRJv79Hr75YS33sb0oXR/IFfp5bRBzquUWUx3QdO/6hMFDZAnjfXrWgJ+pskMY95eoaEYkvo1kt2wQsXtWchxWMC9qACuZ0nkZV/ZwKjzf5Dt3W4gN9g4ufiXkyyAdHHwgK0Suc6uKDwJnb9H13rPYEsj6LLABDbsDN5tYWuoF3OVwdKAOo507b8LoEelO+W72z1vddQrWQ3hvT5iF5eFcve4kanBBHZJRtcXRm3kf3P72ihO6qYJAIk62c62Gox5GpXMtDKQZ8VOw7jMu0mIzpPnI3zy/eOu9smMyxIrEVqELZTEg8tXzY3hwMesssPVxD3/1wrdJHerRBwT1i6NqXofCTGQuzebT9qtzSrb1diHhQocXYGqGd9LTzpSGLkMb1deItCaY9sxdvJHGmMYFlBnGcbp1l6kj0gDpyuSgUtScUYmaRjTEOWp+Fo7Vp55NZglc+ZHuQ/IHfiqX8dmUkukxmcL7DDFLCJK4I55KUyJE5I0Utpg5kQCszDwVNySI8K15pkyh31VW5OnGHj4/lMTN68b/vbk1fM42NlB0BG/9IlBZxDde2e0EaOnyDsxuiSzH6GQQDa2yDIKl2uLf9jwGzY=",
                            "proof_zero_pad": "elTpGZ13UBLzkOhZAk2MvC2vxwZ0neTwF3EY6jlfNEAmki9igv+WOs3/wV6jA4zfyNFcTpHDNyxsgi1d462s50FtqZMqJ+ABHAnhorQTJnfyPPca6kDep5vXcBfzRvaO8sxZOaRYi9b3xEJwYyeAoFb6KGRoFRrC1AJ9Mv5QkrNW+3Zwt+UGhWmfdQAZYOeRpGpWQeBGTM8LEcrhEcLa2sC/XByNuj0Y9v9jaOkntnSO0y4QPEyBGPw3YktVwqMuQdPEjZ0BF8Yrsx6mptg7nOJsKgYZr3NY2fbjDDVtQSHOEQMIEYGLMaS+ujWKKhmTkBHSWtRlchSdsQ/n1d/nQREH3zBEMk0Ox75EfJ0qzv3dk2tJqBvRPGJvECvlXcF+HXQcVOjrxetwI09TcDImIRnSONhAf+RGGaeKBngvR0zMKgCP39wauxJcxlmvgsEVgj/k0woD3jCmfFBXuVLWFD1C+CgdAmWjd8bY/1FFM0awDMF6asjepGcjQg3AhH5KASAScSz5DHCjP+/dyKU51shjXhXTlvA2mVYafejAxIpZgV+ZLl3HrsFnHhOi3t4HebUZpB7g1yNM6koT4hgCoy4Xsv/zAydJE0XnZqFqwOY8TzaYRN/usTrvp4SQqxUM4Kcb8rM3Yy2FGd3rM04n762Ld4nOjqk0PYY2nflx3Rg=",
                            "proof_zero_response": "/bXLY7ncmQNXpo9dD6gdkxfCXNPejWVpPATqyzLCAW8=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "9Do2Ae+O2Ze5iE3dDs6vHr4qHa2Ki112xFX0k5vS4/+g253fHMis9g/7klpfV7ynAQ2B482zWk/0s/LvYUqDA0IGhT4rsG3P44m/lvVGzEv2OiMWJsydvFHv74N3nXhP/1gl96oMcjsbRnAqteGvBazcn+m1SOYTYOB25kDgYtsaZVkg0LsbF5ihlvN5XbuQT7C6l2zrr++jbAoygHhqkXCZUc6pK/hUObPwpNfTOit87mvELXttjCRBWHdnAs+r0jveUXK47UMAI7jkdi/YmuRZMbf3Pz61wpq5rsH5VlNZb9+VR5jr21Z7fM0WapGPDRnkEvajuZgTEIHw6NzFe3YyO7fpBspC6sEy9HfSmFQ2ZQFtMpghxYwkVMqa1ZIO/x6Jnkgz6Zg+cBzK4xe1GewdzNgzyzeDIo8eSVGkkHJNL+A5wn0lmoYyVt55HcYA+MRqgWyQ7zZgGhOiz77zOejCpMhtYaurBvok6XMH/b/W/fQEsMwzOSnE7Sl62Tngp0IRVJ25RqD+xGqGEHlR008F5NaGlX+yT4NW/WPGR1HY1FlII5SMfHqzA7dQq8NdbkAOqMQE1UXu0xigVNsStyhfnOx2cZxZcpPQYlcAw9DER+fb4YJ6Cy/qTVDneuMK3FCvGqGZjcFYZZEOPOt7zT54BcYTygMTN1znh03XAzA=",
                            "data": "6Fyb6VJzw8xE63TWHfVG2kBypbC7o19c2nubO/Cv7/reqAZOOd0HqKXUFSPcr7SOcPuTFAo20LZigQqU4Ht5JDap57pe0gAdZwgFY5t1/AgiBgj1B9E6Ht0xBYJZ29UQb+h3JPBmvMLyhIWQrbFhx5k0i//G4pLldlT/GMrjOW7DQ6oHpEZp8TFjtwva5CK5B+pSXtIvBUFAS6PNNqp5LaXHJlJfonxMM8xA2KbQKO4zeN4AuU6uV4xOy7YpoHLIr6ijbgsPZAjcXG7lLd66xvRWsaWZ+RT1qkFLJG2NPdIySxHwNQdP9RLKTNCQCINTlNsr/lqa4qW7AsldKcfV+KFU43+PCfgC3l49+8pWxQTERdi5Q+ncOZR1Ej/6MTcGZhAUZ5CPjGSg+qvZRb+aSnwGEg/f2WQGLj1lf30M9PGk1pqKfg37q/z7SzcQw47U7YlIG18Rn6ejaoh1BWwt/ZiBoP73gI9AKZ6z6e/xxSzz0wsEor/P8VqA8q8uTKaX9dOvVYxJpPdv+zAJJcjSdffsTVBSF/bM8ao5SOYYHZoBpicL6rDUBTOR5XpureCyklti/9u9qEfNZjzHb3qKnO9L40jnPO8o4aaQ+v8/+pLq2JMcR167rxTS3sZSuYZ1iNy/xYN4o3qR0haGfNMYC2sb+cy+Rdl2MmD4gKaKd08=",
                        },
                        "crypto_hash": "3Kgy3fOBoIZB130hoDMbBJIspdliK4iZgEQB7dJSnHw=",
                        "description_hash": "3awGrhlJF9pCDbCB4fyLqacb892o6VVSoBA7KXYgAuI=",
                        "is_placeholder_selection": False,
                        "object_id": "question2-third-project-selection",
                        "proof": {
                            "challenge": "cJLqQFkwLCK7/jIOG/nYDUvCEJ3MZSIkqUMdXqg9BwM=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "aggdhBUjtTEPuSD81XQcR5sjtnIxu57pU2po7ETmZ/U=",
                            "proof_one_data": "fXhi7B9JhI9tSiWP/D+7g2jQI1r/HrW/RlB9XTFNZrGzDxNettSJXLKGoIgUxZHArNB7ZjwzipYvurQXBwyLKRKfpD7ve1UkLTmkxE1t8mbpN+o8+xPB66tUzzFqsoJVPpPuQWjiKsDmAzMoDqw55ikoW8fDX04qTsKwNaOXBMA3DQiCSSE0DqQUKLJjgPzWq2yYfP/H3s2PdFPy5NV2g2cKDkNsKN1HuSG0JKxTrBmUtXXNrJvng3ddxngb8nCUwnanMxGyUQ5OhR+p1mJDIyqX7xwA+RgbnnDYnZXS7Z3XFp5XHa8GpxcHzl3X6Z5T0zt6YUymPSnSpjhvYCWhEoSBWbwiVBzNBijUOvUQoCtSL5aJgY75wrpLtvxP+qtaP3rLt25kErCiGr2ze6Pj72BxuyA5XqbquVNUUrFsF+yiwQ/uLCarf66kTSDE/Ibe54YvCyi/BDhecqWkt557riftrrl/3XhxHTBQCrVEfNVChqzZjzBVd8LP7ddNHba8PbEehsaZmyXUPGYBLGBuRtI5lVd1+P9GFfkK8ICLq1+eoUnZQ7MwG6toEa72IwDL3UxZ9hgA4TWFmpopmE9I4XKN23TzCoKxuAqpCuFHrJAmJlDuaD6c3psHJUBDplIXU+gEoqGPNSzinZzMFxL7Jb9MYCjs9G1A+BPc3C/HCeY=",
                            "proof_one_pad": "2iQSfDARnNxsThtIcDBn25W7HYYo8unSyNdVMFHIQBdDyZ3nOfrQej4xQofsVRNtAvh164xeI2LUTZlD3I3t0RXfKEmRLYcPXn0IzdRfcO+cLna2JkkA9NML5oIDr4AxmVUnhBfpnJNROV3U8fxzwR7/eWlBxblCCIWMYBYO5z84inBUVPSHhf6KwbOgVZzYcL297UrUMSQa0AfESM2DuKcg8Zt62CfzKXIez6XgNnWPDxXd0m/lm9ikDopjStG5mkW1+BHATiwS7ov7XLikom0NyEEcG0GU4qv2tKrGo80/4t4mA1ZPMi3Uy0oebwAda34cKuPAKf3SIgzKOOUMSvW1uFGgeSQlxcJDbC8XVeujxNHAR3mcUYKU1zH9hbW9LiJVvMH77DDDdqMVf+K/05GJJZuhVyuIMLWGqZB1Dt2kTQtTxY9C5vZTqeXLlscptxlKndT/LAaxga10c0B/MGbBGVsZG40p4C91r4BTPpDtHNWL594xOmmky59xvAkDAyso9crjENf60UYkf6S7zGV2T47Xb+p7tljKzKeBlDMmEJIyLKt0vN/HIJdXHya+rleWPhaUiA1nfhlKdDAL0zouP2ecJuA9M+0iTKfgzi+++Vqi93s23Vl/sQwuEesV5qucwp1ObimJeWCwqOgEyXXiCFBGulvY0ylCwzpb5sI=",
                            "proof_one_response": "zRDDPjmpsizSs5k/BWU8fP4Q/JRW0STFMbak4xC68Bk=",
                            "proof_zero_challenge": "BorMvEQMdvGsRRERRoW7xbCeWiuaqYM7Vdi0cmNWnw4=",
                            "proof_zero_data": "HwkSYLOmFDzY+5MLCuQxyGH1AEqMkh9UMh1aZR0glnRjRdvxy69jQLFACM1JHwBTZwe8crOnAL5euIewu5et21MdaadY5ZWyJs0pYPFv9Wdw90QoJn2rcDA9Kz4oDPfMBo1+KzYcD5uDzXoYb0iM/J38CseRB4r+CaShla1PjWrRJcNU4kevHpqfB+j+gnJxvb4MdeNs+CkYDSa6/NINa3ER+CpGusCVEyxTHrCh5bAbbG96KbiYruWk/fwPBWmVDoeX+r3bWy0nRTDxWnH3XAoK2jjAAkXv3bqE4D3twhA2uaiQQMKhWKoRXYg4l8oJOKrRLmlE9oQ5JD0dl2BYWqIdNh/xaoH4NPO75qPSpQSNC4SIhFWgX41nmjiGhZ2iRuskaRCoyCNFl0RmmM72U1AwJrezlpI1bVLU7Ks3bPEmJs+P2wgkjz4JS6AkWNlVbgRfsYhM16XipXNiayhaUQYy6moXEgKRLR1xrsIplTFkfsNElqRDGa9rh+xf7TqsnVRT8Lur/iC4kXCBY1s23LDQhNqbFzKTXVNfmgczvr4jBoEiaUJyDnQWaRtaA/h6adGLcbNmUObT3quySSCFvyQUWcUPqPDK+Zzrl7zJgo6JZIVE24+bXbHxSe3LijodreT3kdCevEG0L5/sTlT/VKOc+2Svvp8voPQqFX8Rlws=",
                            "proof_zero_pad": "ueC90gA6L/D6Kz8XMr0Yu9GOckjWTJvyYl5fhYeUmlkCxAi3RTOISvQLyga4G4Hoj2Mdro15SxN780elBTqXmPlVyPkDiuP/E/TAcbCvKTAZbTeK6ULlkPC8z/dVpLRXxi5cAhicbLhRBYXfHQTLaTnrcmvBL8jDw68LxOnqA2GhAPXObLQ/KsgldEBNclBe3b9di8ZmzVTw2ZQy9LmBGk7dNH0iN6ZxxEly36FOsasYZlFF4lC7ka+w/1MnbnsBGHXGVg+JKdkpWwTtx4Do3127aefm6MtDWyJjpPxjhTOIfxk3Vnd6i2sYF3nPnH6/sTxjzLpFDumu3s7zz01koC4rH7bcPKKCVEKVTOTyOrWFg92P1zKhw91Knm9BhJlIpCyf90gxK5GnAIY3KgDMWlKdrGPwN2lf+VMOcdyEbEPZ3jz+EPi6rYxQwUa2wC927oA5tW81ImLB4zWrClNsOPYG2voFjJA/8+HYl/yBv/rjbHni5nzXKYkkekLDVQ45Y5F5ZWU70kC8zQU0yZCDv/k9+khFTinTgIUYmOS1a8OC94sZpvBKVfjPiyeuhDdtzOyfEEokDkioZsJXZ69j25dZ57x9IirWJQvgWl01xeSdfncW29lXsCIQXsUF29pZ/LPX6g9c9rp3B8kfKXjT5Yz/Bo1eHxOGRqC94PcvJWU=",
                            "proof_zero_response": "siISl+4IPA7kp5TZL7UBAF4ITwUcXP9HUwqOmX6SOpo=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "kjYzfl4rsBvI2+mDFmcai6j8+E7KilUF7XFnwkDoVKxKMzcerCEGYyeOoMDXUJ3rHVOxOj/Af+c+UmK391ZXBd4pEniE4xZ9sQFsSNYhi4gNlWSgOhqCuppkzxslGY8n2x2InyOgUFXpH36PK5pofQSrlutcuVTjzjrH5gKgoplIhL7qwMRHDK/DO07UMlNC3BZAiVyZ99LYV118Lmg5C5vY/GQ2CWKOl/Sy0Pcc4fBw1Da3vCLXtSEPzcfG/IOFKrFwhXWJF2plYgHbRkbUsCbKDuMUuNgMo2Jwnuh/xAW09T2SxR4eme3KVvDGKVUAciZ+/tZrJ/4o+fxUGhicAbd5Yj2xQJn8V1PDwHtZ5pBWEk0RbQoTCICdha/7yB8BTuohNV3kf/61JfKMgPsW083lzFGDY40UcSZHwryRrcO52+z8xTkxOuG6T+GXeTAgbnX5PzFW4tSZ4/dRmz5iG6mnBSWgz0ZfXEopGRvffrcQVJMdGRo8L7shiuqedolljfAgy1bxeWcgXGt4PW03ZrJCJTqcm93BVy9O36J738C6nszg+McVvSfDeT8vNYt/ebYEgUaMpuTd/FIhr5gIpEYKW8Xu7+2BuTFxokrZAdzKo2gm8FDWL2hBAnVq8y6hW3vGAZc9VT7VCdcMKZpFdKL2Z2/nnmHNk/SR3LVTE7E=",
                            "data": "I5w6h7Z6GhI7ECfnaL/h2b2kOx66sOoNe2lrYOUwX2OR3o6p/XdPAf+AkUt4THdTlKHgiRdSjuyNYIoEyxiI2yOj/jSizf5DPzHxD7QDPx1MGMVI3QGxXLijgNDFnj7X1j0lvtx6aBG5hxEsVcGqzugDqgZut4Hn0gbmApriANZDrrF0vnOhxsrSI44mj8G4GCUfhmupkrQPnEISAd865viUyBQA3TQkuqXkQbkPY47BYA/f4BRuiLwnr1ZhO0PkOB4Wto3k0oaSAAGx+uwi8QsGKyQIQMw82lbvlEgkcyAiRsjDO3qcTuwT6vlVqgPOJE0LfjhtsBCv2+nkwfABCP0V5ug/ed6/o2aX2Me+AxiAqN/zb0h7XWFtzGozvP59WeKI5i/IU1/FaIRlOpzow1PgvxorSzPMg9VHJWSSan2NdTim7NKT4mwz2zvhijWlIqCHrln6BVzBM1gXpJ+SfOgdVXkzWLc8gAfKvrtTsZxy8sp9fcMUlwpvZCAS/bMdgyXxtsiLWNLCXSLbTvbgCF9G+Oh6Ze7BRuBanmNElPHVOEZi+L+GsMmwt6WzP+6HlPU0Oin12w6sEakYomf7pj/mfxHxCT1cgiUZEY5qvykXiRgHIs14uP5xicpYsBIQvntHWaCDZT4cu8ZdkPC1kZeylMMhexpP9BFHLHOhPW8=",
                        },
                        "crypto_hash": "/aQF0HTFgNsLEMmJWF8znqFAgLLuCYG5d5SY9ErXgQY=",
                        "description_hash": "Ohf3z2bx9oBzmBWqKWkcJTZ3vrFLrvM4ovNVNcg9z/M=",
                        "is_placeholder_selection": False,
                        "object_id": "question2-fourth-project-selection",
                        "proof": {
                            "challenge": "LsbCpfffhkSYXFGqmKXpCIsa1tpdODcACSmu1+tDdLg=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "l32YUVzxl/vLEemRcaffRg1TnndxlrzGL5dmoLknJGY=",
                            "proof_one_data": "7G/QxAnQajmPZs+EstgmGzQPkVvM+H1fh2nCRnioHWvsWFgzRIcUZQn4jA1nGzBjraKlqE7D63Po6DChpVnw67SRrjYrM6Ih3dkwOLgOZ3S+5+Fnn6QjTnHZfCSplLamDQHtWopzazFbB1ghCUc3pXvGeUMG7mLKUlv1+JCnFkAMmKnSNK/VHxSnLGuzy9tdMIPahY4ffmT45xc7pUXjdVfFSntgIep9tpNLlSNdZ/I5bWR0nexkH2oHw2aNrcDbckV/xmaDbfFqjaKEePWaz86oQc28yRlgL7eL91cYNKDmMwajYc5lpga4DZ3Ty/fWeNnptnvNMOaVOt94RgnBEe4KTHe+ngSc6hWasNKsbYb32QsvDOJ7ErpUbOAlLXgUNEbUMPHNF7fQWQBMHHSj5xo0LTxl3ZkJmtjRTUFfljtXM27BGFSrlUnGCp/LJvVamqHlEzQWt+o6MvzkrtfvV5BI/xVxoSaINxQHi7vXTvzUbe7Ky/nnTb29uKUXtfOJPEIMvIZk9XUO2m8mF9COKya2Ydks57XsdXBp/ImeP4Y7MKsfiijH5acbMt0Ipg6ILiDcy9SkuE65GnTuDF5VTc+vKysaSlM5GAolZSzS01irUwG2ChulzCjKO4bKh4HlBdIa5c61Y1E90x1OKnvj9aTGyP7qX+dBYoZHgDiz2Bo=",
                            "proof_one_pad": "ncI/S50z9kGfUMYU3g8vkGCkDJ4ZQQK8de9yZNU1h5nTN+LEh3a5mxmDBGiWGAxJJOq0fzjLEnfP50YXLa6oRjp21+HwKkiBNqpEsvkWI/tDGsTuKVQb3DfHLHO3dbhL//9TBt+vUvNLoj+IJ/ARi/NLeXbVbvNsL/dI82pJGOWlvyaqcnMpwYoVPkbqTmtVgqXjm6XzjL9wqh3Wra2r9YD37Y0aXfFqzec53vp5RYMbRVyjUZsD/v4I7RjpKwiWQbiVerfeumCLbZG6ZWGUfOTDBjQcillIZL4HhLjv46u5jGtfXlR6mCKB7HfPCclG5divL7VdCkbHUA0VOV8DBZovBMj5/3l2OvX+aOcuiAOV6FiKMoB7Ua0oPvy5WPrgmldafCls+I4e4zrMb5HLcOP1O9KH+03IKr5RUBEQI2XWEBruOl/yDvMoauSjIgJLE4lTveIQhyYFU2e1rDm1uGSTVZ1AW5hxQE7M4Lq2VTlSB5HWAqQyERknM6Qe1eCqzDPZqjIQUAdytMGVeIC+Cvp+E3DWF4ky6XIUbLd6nhKzOfo5rUW88YnEJhjEptudcM3sazTL5GRRoPSOUNzpmEhcLneEXnqdb7IVQrzh+XmxsvdaxPTXkYO7+yDMtOm3cm9w+NxUwr+D0dUi5BqHMcaVAf/axmyDtAgsXiIXpxU=",
                            "proof_one_response": "wyWy4Z8uZ2fxUbBfk/8gGrWy0URv3TYqXeqei3or3Yg=",
                            "proof_zero_challenge": "l0kqVJrt7kjNSmgZJv4Jwn3HOGLroXo52ZJINzIcT5U=",
                            "proof_zero_data": "TlocxsQ9jlaHudAtZNWOjkYuU+RggFEBAE239gVNntpkFnk3JiG+OI86IcY7ccjXVV4qtA6URsww9sq31FRxZdqBC7l8ZVwKpGR4oE848jMHqGptARriaRAgv2ALUGl1La9+6BW1N6f5g/2e9m8ErpjnczwHExqR7HUtxWu25YIr9/1dhJAvmP54ZvTpgmyUAZlVej2+DeslPEwy+A0ztO7ssnQpJ+hJ6tDZpQ1LdKETaJZHX9QduYeQurua2Ibx0v1Jhm4LWdqYOHCl0L00llCqYC3hnG/sVhnmNg97a6CcXhRtARRYgt4KtVTYNU9VRRqV5YCX/IotJ1YfuJ22kLilvU+HOKq44dcUmsgYNnePlZtfyAtoQmXCh+pup5Rs17yIgJpoE1grrhJWG49a0YoA5bw4XQlRrZRSc8nAj4JnIn2LOH65fYIdXbBwT0+4pbJQb/LCiOumumHfG+2cObXn7kxgI+uMPkYPH1x7gU/3LwdwWsDw3JwsH6MhO9oTHY3WUV4/cHab/wJqNLVqii8FmQF3q7y/FbeAKrFnT+q9qQVDGxp7qlNff107din4+Fjz2oGFnlga2JLC68PxV9Ee7UqWmrE54GDpzRRUT4iv5WHu2UiHXA+axUaTcSf8zH+8qg4dWhkk1xhmGL+lDfa1mPok0Iv3pMkw3Tu6atU=",
                            "proof_zero_pad": "R54R3Z2sUxfnjbUfldgvahjygHqUgakWgY6dcIVvKTJRRGNrxUWRd5hoVdAZ8g0pOvNqpTDdGGWXj85C3OgrZi69vipPdN7d8AsBT+t8FnsJ2MgiADXaumMNC9l5B9xZ2lIuU+RW6b4aruSzp1B6YTUkeFusFLCZbSE16V6YMi1WVOJY+tYb3ZmBg6+cUqKs880SKFRHjRReyjDl+bcEy+RQQnUnr4sfJOGmPq4fIqh525KfhPQatKd/v/y6aj+gkBQksg2JyACOHTYA2ojU/njOBR0aHt//7KOIVevMyVn73yvbs5LiJ9kboD6agXmKZBvG45zWIijqjHGzfyA2dpPFxXWD8UQ+qUQzb32u+vU0epAQAh7C/TMqUG3Fygi3eqMoBf3nK6lQUb7jvc1Ftt06pzRFtBpKPDoYHg/QpwoZ1ALS0irSHR0iaObhIDnrav64TaOI09lGmRi1OijQvQ2AsYOO3vfdNkd4L+vGX/nMy+Lz/TBZ83hieZZlw98ey/x2Z8ucKYZN5JIcTbRLiS5WxmxARc9NpSLslc1sEz6xVeg4xWgKmJLnz/TCuiWwFPXQp7oWrOp4cxGz/F2Mz78WVLvdiwwdQ+u2LqHcMYVrGIJB/KCtX9Ly00XGM7frpPbAMxF59vBaxUzSjhMjHijC7hwiHm0SBvINaCaxD54=",
                            "proof_zero_response": "BmXU3SXcySM8L0KsaykJ0O+6G6uTBQwSknD9wNrYg38=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "lgGe5LO8hcuvzWjSN+SAhU0hqI5oeulObnLUHHOzFux8tab70+3Eb2zj2aD2d3+hcE0nQcJUrPLF9udQb45QLbjQTCCSFr93UMHXNf4P9fJWKVFt5T5I5KtAnoBZ48nHf4vFD0UedPZpbJ2UwMstUBvRY8xKv4l/Nyi4W4eivrYdcZr1fKxtkXA38ZQ9tiJ8813/rsS6pak7Gf6VodZaAFIwexIEf9ziyQwk+3yYjz0cXbOa4SBkx6djmfchgOWoMdYIsOMIKi++SQaiaYkhypH2gklA+EcMh1OYcNNUYBfu4+65OAuM3sEVof7/2awI2ug63GMQn9X9I/IesZV/05YwUcMqhCSU3khynXfvrhAuozEmxYAkqKgl0eQiZ9n+AQyP2U6ajPmbZQtAggnqS/3/FNI2azQJKqoUcA5Ttabveie8TeQS0Z7PC7gIzapj2RghHV8ucTH6NH1sdYSmmIThwBa1D7GpUOO0LNeIZp7YjkkreBeS6wMSLwiT80P33PbaSNfaYDzyAEH25e0ZiWpheMEnWGD5F5lEAV38sKoNCGso65ydlgHIKZKqQbw8jZejaXFqDVAzu+AfaqnIn3dUShIbYkvmURi7tke5FijsvHDEBZeREj0OqJSlKHhwrk9w45tL5KcGisLMVp+qv8PsW6DbcRVuvpqCTO/ksj4=",
                            "data": "tFNfxcdK175eiVndd6yg9lDKPKmshf9xD0Uh8stUkRG2anPiRTiCPhZ93fGe2Ym4Hksv7Ck46VCMLmGB114QhkigzucTtayFfWVvNZcddYGBBknp5+cdWbzyLX5SEuxCsfgAIcCWc/jcMChiQ6FoAHq4EFq0RwOsHTCl8gCl2lzcmFg/9O2THuWz8jA9DMfqF4WzmlAsSikbaUmfZ3+W7Vz9loblA3QzYfmqJVMrcC+LNY5twDCdjQcD43ik84Bjrt+ZgkljQSBesXmtrJgw2w7rZ1nh5m+pIrGPvoY9neQ0eOeO0wWOWswBu/ttyC6hCNdXJFpEjhPmBlFAYuIDNF7WtVn46cu5IMEafWmP1c7uvyl2NDstghGlGSSOBwXRxH6Is4KxgbHisQp8J+tRsdpWcBJASXDSmDm/JvNF/aM6SC8rh1mtwZKTKaj+1LULQBZpsJ4Qhp7HuuCKPGRHvolSEN3HzojQG2CtJtC9IV2eUAz+8GVqeMidTME9m/+bAsBYvdjrjvooKQO9aCqMHKsyn9ot+VQEweqUX4CdDoGoVjQBr69mSDlyPWpS4WJ1c1m5c9hAJBVia3tjBRMJgrSwvUbNj6ak3qntu8mbBQA4AvErl+Cxe4XFUqG5s036zmiZkJ0tzD6UGnkUiQwJL5BIzmuhFk0YECU6CPRoI5E=",
                        },
                        "crypto_hash": "23rZVlek0lsLKOSK55C0z5w2V6v4pWsbrzyVQKd8uok=",
                        "description_hash": "NCj5AgDVV9P/iNO3l9KKW71AbIp6mMUd6/mPrsOydmg=",
                        "is_placeholder_selection": True,
                        "object_id": "question2-4-placeholder",
                        "proof": {
                            "challenge": "pxyFOnk0Umv1SQ69Oe3CqnjRn5+zs0kSEkk2ndH7ZuM=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "1A9FDeAeVznJyc2Zm6ZaAl/ktw4fc+Zqq8WP/XcgEMA=",
                            "proof_one_data": "gDhRIKZSdPqaEG/0QifKEiMg9WfbVe+1JVtYk6/bL+7j5LLwX8qM50vZzcktWtpGL2/0hMfcRn4Z7mrAjYE1vl/EOOm4CAGM95WJHpGWsCAw0RkD5LnLrFpSv3/QCvQGo+ljIlC+gCXcgf4BrEz1I+lzT2G569ECxbgqbVflsHfAvOop2aCuqyw1MQ2SkLowBtyM3vIndjNWvllrrsOI42rQqanZ6ySFft3p6v5yTN7bYBzzgG6c6sawVjiyg75dzo5n5bipbAF8yugXse8Q62TTGUwXVh2SzQWSuCO7gZ4wp8Vp5pz7A0N4EkKHLb+hff71eoBP0dB5JocgXhXFqoWLYuqQtWQ9KIZisCeaxfelq2l5E0nY5k0JoCHZm7qRwyWLFNx0/raVA8Lb+qUlvwIdgWXS5zm1vX0yLQbzLVLCUNrB5nLyn1s0QjSEsCJ1ho99hahU4CtBmnJvlNYkSQG81gsS4DM1iQGcdg1+smdhAGzcoWHgC9KPvW3wmY3tCWLBOtYuIFKyqZzpmXCeRC1mqHY3/nOY5PYtvVna6JcQNwMPZjxk51/hItexlnrFZpEZLgTBBjtaD6kO/RX+2bECJt3gxIOCkHk1XzWf2EgihUkHk7i8flRqOu/w2/Io1+YcgWAL+Mlfvpz6s5mX//qjexSEABafNSZ0DmAUNhI=",
                            "proof_one_pad": "UeQxEUt4Ul0NXWmDePTCtS9z2/6HkohQq9oVZg+Juqjyi22MHCka1sIcj5UJvCTP3cYzihPp3L54ElkmdduWKqVSpZasRYidluuAGAVU3q7Viir7OVK20QXaNlMqbreCWHVtxFPmlmyhX5V42i2Eyl+/re3YcjgmHGBNr9Y1uh97ehn7uOmJfPDklbnTHgmDSx5bi8OHBK2D21/kULDDRv9Id8/vhb845zO2MGrPjnFDt8AAOMtXtGKOz/ihJA9pqfsGTkG3dkxulhHnMgG+vV2lbZth4HVHjqI9hEy9o34Je/kSQ0EDm0/qsr0zOtW91Kvv2rBdfFRV1aa2vCO4CZ6paVISgq7NofRuoI7eEGLCsVV/igQ2oF1tURs7IQ9Gmw/pFtg8I2DLIUkwI1V6/om5JmHD9R9Ycv21GBiCvyMoqX+tVA6V+hkd/RHgpWYvacfub1IZNQ76nkWFUgFFMVuu5QbsN2bZVvDtP5/HHnz4B7qASwQjGGisLt+LF0xVEwnt5dADuACuobV9Wq9jfpprFyx2M+s9Wqf1ZlmiZPKm1goZdSmEAS7mv752+TyOrHQgAYTvAds5/PAxBT1aY2I3jC+fWRISGFMtiS/2rXPw5cp1O0ulhqYADEoT7HuTs2/WcEZfgz41OAsFcvrIIUtVpCde6RrOhbscP1OX+i4=",
                            "proof_one_response": "jZPe9bNKDE1Yzbsd2o7hiWfQwiri6tLOrElbJgF8StM=",
                            "proof_zero_challenge": "0w1ALJkV+zIrf0EjnkdoqBjs6JGUP2KnZoOmoFrbVWY=",
                            "proof_zero_data": "QpUALOpcMYczhOSxffC9CM40q86EW6FSOmx9+ZQv7U8LB/5FvnRQ1DEHW9j9AIdaM2yDnjrVH9DOZHBycjmGhPqeE+dQpAFMRzr/AOSLSYHICRKW5g+5WvyNXXl48hnVz3Lnwg4zZpc17+Esp4x5QmeIghVL6xjA+ajNm675Ezur5yYuRIrS3fTt74nSdpYJbYY6bVRqEF+ZldriN0Zgne2uy2KtxI/BQ58Y4Sb4a26q6AKTGcq7CfWdlJUbMq933GzStO6MMZiyNKCeo17F7w6M62KpSrCqKGYeCRYjgFucZsxxKYNwXwLR6OdQ4ue9f7DWz1Byi2G+QueNnxz1mq07Y0vuZFjPFyZkjKVufNZujGnipzWN8zpEXbTsyMgqUeJ9dpk7ePxqwp0ayZ90o/W8b0L0irOqqWd31p5f82wNmdZ14iuSxjbfG9pKxnYeKC9SPSI5/n6JecbuIToqyGV1aY07tiKCNWzKxCZ/ZGCOX5wDh2mM0JvOVGIszhrUQHqeDee0tR4UY8WbMuKCGhX6kksBXTAgdlyXGwFKwaTxuIN+uY12v3lJ6Yd41GwpLDd1gBpbIITYVUAt2pnmOAyKVIt03Cziw5Qx8YrYYn7yNU09X69xNrbhACa6HZYYnhXVAypsuFxbwSURBm3ZFWjX8FZOZzkhKHnWKi2SMjM=",
                            "proof_zero_pad": "vLAvqz2KAyhIUrVG2Q5Rfj2lPQJjj3b+nBv0gaEZc9gJnOJjYaqf24DRDTNeXTtFqRMD5tqOdF6yvbBZoH04n1ms/A0wUaUa0JeQAc9qUsfFt4pjGDLow0sSoK6l4JNX8eMzT2uJHs7KCKVMl7lWwVvBqYP65Ps0gW732LjVWss8NIk6EnO7BVKi/gkkyi599Sy4N0bOmrZgREzbt8KKuaCxovhclHkaFxAL5KDJ1MYpFm/94aVtq23BmaIHKWc1fuLIZIH8myHh1lrF0+y9dkR+JXdw2hZUqfkj+0UKEX/LVfapV65tZRJtoqyQJKraY/nKFFepBIs28Cyks/yi2TDJkjhTKCWh1/AmhBoP29kWBmXCh9/2Tl3l2EmWK/T/nEkY6A69eTKGuLLn0unEJbJgZgagHpC83Z6M+1HFaBqWyccNEl0jFOUgxxdjl4A8nGBRUY4+Z927DFLYw/hFKpecjsNlvRZIBwzc6Mb0BjktbZCWla0nFLaJbPN6ZS/c6SeNVx3mQP5xRwc1W4sAVrRPNzlWv63A5eV26Lqh+7ynsP2kmANYER5tcZAO06umZUaFVciuADSuc9QrGSSv2x8chvrJaLGm8z5FKvVOV1yCXRm3KHI/2P/lQhyLraZJVUKL7KYIpxzItrkghsCCH9Q8Nhm8zG4pdKzDMF9FpLM=",
                            "proof_zero_response": "tMnUV2KRBykDp2TCne6Ok8Xsor2hBWLwq5zCDTMIzfY=",
                            "usage": "SelectionValue",
                        },
                    },
                    {
                        "ciphertext": {
                            "pad": "GjtbdBC2cwIFPIlwaUb9kqtnkytub5bpBmjvzPX11sIdgNfaBl4XNRX64cA7LjTl/WyyHH/q58IrgIuVueykkpBFI7lwT54fUWf/x7xFWDtbyqGrratsVOPhOxA70jtL8flyYzpFhn4UWGp+GD39T3t0VEAK1Wj+wT+Upq/I/zmMHw4ThSTp0OYFu11zhz0htGFtI7GGJowJvoUyqbjsea8PKcVA5XXeidSGGKLTRZbIKal2rTqRKc3MrewgZdTI1Cs1wXQ/lszO2JjJMMClV4rG4+bmBHb9nBxlMPcQb7cPOb/NdCzEXKGKEZPLU3eZXgPNuK+N+4qD5sy45cqaoq/8+WwerRiY3Yu18QOAnz8ZxvhWBH5wZJE5Kzl8iUY6hMFB6itAHeEYys/QnndhNlrhP1zhg8JU7XSsu5oJcwXi2X4+hyf6vJhdBCiXAKp3o4ZJZ9ul2TABsX/El/kgbhvqBggBdtf8AmN3tO+qBPnFYVtNKafj8o1Y0cFL5VcK/kr29PFQ3IqReR7OTQtvXAFrkO9NMaXzwuCii0PQ7jGWlelou6NiU7vmpKixsJ35XHXoLv1Fswpq1nosyN7hN1DtrSR4vX7OM/z6rhk5h8PgBCVMkTzuuTin4xxF77Lb2AHlsrB0ECruvqFY2dLmMcT6Y7qJggP5vGRQNxBWDbE=",
                            "data": "Cho38cd60BAjzPm40UOYfZQ3wWrK1aHuZj55E+X/zgI9AWXIT6Ush7jWfHTwMu49FG3rNBfCi0rRXlOwU7eS5brSP2APLFr8YsnX5TQPipXAE5a/w6ZQQ9qwyZ7FicoprYJPmOuJY3RGZO6r0OxP0zYldo9Owz7KpnDQ/OvsS1GSOfs3J7A01GqR2huWk/kjDBAFTEfE4e0D+OqvT6HcPkWiox9/IFenMArvdHM+Lo/zV1T69cOq1B8CZqzkCSrl0G0Xu5YjYee04RPt/UWZZ2UNkIj2fIhxBEacomvITUGlH5XH4O5bzhYwy58JCo/xfuhv74dnL6iQUCb2HErcsMGtaojYxERDi/tk6ij8VvyLhovFaGTAogeI43Qqgp6U0g79SO/yKWswhqJCnY7E3g8R/iiHGAQ/n/EfOSjwyK3OBiIQ4a3sveZPKSw1F9BrsRHxJidGs7V30g+tKm/O8rPxs7hJrIfLpuk6GvVj1GdA5GbZN3+Z2btRQuB0AZYC/bYsc2HKyqHiFNaWu9eJRkvSv/8Hc/sn5YvQ9//7bEviW1KoYrKQ7FwPo0Q5yTVJ3KKRpllQPIlqp7ez0+sbOyPcjygl6K5gb0Iunamqk1Q59hwqEM2prlHYv8QD4S5vLv+/uE/9lq/soxOXhwEPWhT5JA0mPUhGs29Z1yTuet4=",
                        },
                        "crypto_hash": "snlxIQDLYW6PxDlDisJSM0i2TrbhMu+4s4N34Mb28vA=",
                        "description_hash": "VUI4C6B1Ra8xpXKP+4V5yrwcDUsPBbbOe2l4JpE+KA8=",
                        "is_placeholder_selection": True,
                        "object_id": "question2-5-placeholder",
                        "proof": {
                            "challenge": "dO0kvcfAs4+4lcbFRKAmspj5vhD4qRlCBWxBOKK6df4=",
                            "name": "Disjunctive Chaum Pedersen Proof",
                            "proof_one_challenge": "sBFCmuGn/7nzfwXJ2u6cUBkoNIP0gVJF3epAs8hS8sI=",
                            "proof_one_data": "Xd4B/uoFsDL8DFj3rv6slr+siryMmRfizs9yuPns7oPTc3xayil+hn2GozlqTBaQNbdZZt8HRyniuz7IYrrEuAECFyG6IzsXb8plkYOdf0uUmNZf/KSosPUyNGiDyuLwMPH3C2IcOJl4dh81UHt5rlWry+tBbtkX7dw0E3TY9a7b22+/b0ux9vW4+qwVCBu2L/X2XAH/VkDgYjAUkbrJno86HudjrEkSuc0VnEFvemGte0ocaP7QBWKaeIqy0+fw8ZtADedJ23CIzXK0ibnpa0aY0z8S6rER1ZIExmW7dfBn03+kV7tRZe/AGhqE/N3bUAFSorurquPPepslLkvWhg5WUR9VAczFqydPS13dn890dIxKZ0lmKmTMg8xFg8uKXkWp4WrTp2q7E1Yht9hmiZOwMg9GpcagafXc5GkmXhcC8PLNJLfJt968i9WFLivV6nez/Hsvq7gK3buVQXM6h53Tds/cyuF+rsmAcb3/4hPWOZcPlanRCG5YJ8HbucxZxF6t4vwR4iDBDsIr/+/gZU1B0kEVGYTHHLNp4iJxxhBiclYAgS8NTCr8PDt0buS57MWpFI8P2hznCU0oZ94lYk1pG10NpWOlwP0t568iaTLEArklfXx0EcDPp+wQjjj2/I67D9zHVfReoLoL9DTVB0HuRjPFu8ZGI7rQ7rOym5I=",
                            "proof_one_pad": "dvY42b0brmW1VmpLvC8qx8q6fOTywKImkQ2+++hL8fQO/hbvplLDVHpBF7gkW76ZEx3wQqu/Vug0X5qP3uCvmTauNgksWS1aSEN2mmivNnE1XV23556Zhps7Te9z42Kdm48W+KWG42XND5IbvF7jMa1l/8MFAfydmXf8tJS5fX3CYHqOnqxyrvp+68RkjaNjga+39fhMKjBj0iaKPTr2nOH9kJZ9ER/Q+EPxvjZ6b/JDPk+LUzjL/yHJcg2fP5b5u/KusgecDpiD21/aK5le8fENMwDsBi1hzU0gUSLjm00QtE2NeoKysMaNO9apI+kh1eP+/WT2Hn88lswfHB6y/Mfavigb1XvxxTTLS8zvi1vjJJicX2WHtMhzXfRuvdtzP5q922GudK+qC4JP2yPrMc0IIFfz5LtehCVenzab15EXuSeV3F6384HHqtvJRZAdLmunsGxzIerqAmEe1Cic/t1mGlVGEAtaQzQoUifMzqCpPzAj770k8iNxd4hbUwtQPFykyQGDh4BxWadr0JU0t/pKJ6N6NZDv8VwNtP07EE0yFHvwWfAH1OguhTWs68ehkkRqmRFjvtRmvRY+RuHvqwS3kwcVHNUyWetz7jG312qW2Ew74xR1U9a5X7skZmaYciUZuekIoeXYDI80zYHsGY92OsN2UjOtLYzUndbzBeI=",
                            "proof_one_response": "WFPejqMhsStbT8WO3491yc+D83Yw9E7Ce3MTAS84qlE=",
                            "proof_zero_challenge": "xNviIuYYs9XFFsD7abGKYn/RiY0EJ8b8J4IAhNpngn8=",
                            "proof_zero_data": "7IHDVAERgeyOKtPSxtSM24W++JzWeEBSrLRcMnzuNfdL43atHwJqdH10Qgz42uUj4Rm7wbLsi2uo5n71Mj2FJjxb7RdTXH/dwidJWzVh8rIJOiAzVSdEBiLorbC+NUIDfDW5HZLbQtUScDhB257wNBMSTbLPlh0hS2NUCP2gpWRrmlma5aZsdvFgHsWYMFR1gStqnNJBPM389sGJpbyTikHM0OYFX8GqmyqhjcE55cyCRoAHlBebRTzJ+P+IOOKHjJ4uGJvif0szxREvH/h2QPQgv+c8F4eYmoQwGRr0pXRZsRRdHq7iRsVbLcKKdJpyA+fTqCBRwg6x9vAzhV3Y7dSwS/mnTi2TZMoOwgpkrg5DYOa4itZMvrNMpNWIT+98O5xyxVihnndYP2lh9qtg7Hqsf1YhdZMGiMepsUnrhG+GteLOBMCZETjGiMONoIyleaqynE9cPRwXDQEATwqBiE1EUrViD+yp+va6pACWWVJTm8uzLX0gf0l/1oIUhbId5whLb7RNGAJu5SqkW0ZEf9ic2f2LOjfUBztb81mH9ylxYQHhd196iTCSNrWa5tPXSCphebjNbOYYJnmEVmVAGuyEeqyf7tjt9xKhSb2cvlEPDMJXjCKqDw4J+Px055kO1QBaF+n7T8WDXVz3WMcUStmUJLqZFei2Vp0jHYp7R7A=",
                            "proof_zero_pad": "ZDylWYszZ1tdz3730ODQqKOXhVAlGFS33hWsX9E46+p9L4U/aJU//coeAr87LRs/Q2H7OQ/lIrl0WLepTB1P5zX7z5/1ME4iczXiFUxFIH17G8fD5dcfgGTGnC/4A8pMJplpVKIl3LCm0PBXrm7QDuTds5Pv6A8mOGeCZvIfdRnXjNSBf7lNKsDJfdEV4O0+oK2qrKLsjcXO/O9WczY/wMgWkJFv4eGkSlkC/7v/nxM+eWRSPa7jg7hA5fuamoul3l2dxdvPJGQjBAZY8uHYdBa1CfVXAGDRF48tit0l9KAsf/nNZYw0PbvjfkzYvIbck/mFHN94q0hycKTaSTCEWJOU35knWAmizCACV7ccojm7vKBxX/E2AoC3HtVdhWMzfWLn6evqLtoK4AFF2beuziwF3ZZbDI8wQdZJ34yG01Kk1PjbpdxPFU/5bz3Pl2NreGPUWQ8IsI4RU7VzR9T8hMSq2nm3iCotTkAhiU3yj7660xepzBH/2oL2IXjmDRlO4+ppQvYwuFvJ326RxKti4PAUk5xyZXwCyNaESRtefo9XuwUHITL/aajW0ppqecKCo2CCrHWJaa1KId45AFFMBExO8pllWLDbRkEDigXsWHh+++BNLiEnKmPLRGZauOglbbCMeQ/EWrHm0EXCLysja2TuNLJENQmLvTBdVQDWPPo=",
                            "proof_zero_response": "O2K6DIRsXdVHHgKY0bwTgECHnzksB11oPTVY+5RFvL0=",
                            "usage": "SelectionValue",
                        },
                    },
                ],
                "crypto_hash": "vZLoKCxgoxpKMmLXwnRwBTQOxcQ2VkMUZY/jH1Y2qjg=",
                "description_hash": "FjU0ZP9rWAcDbmGey14o0LmNJIhOpIMKG66yrJvsMc0=",
                "object_id": "question2",
                "proof": {
                    "challenge": "Bf5VLwZ6/OwgTAvnAYMBVAj+GS4VQS9sCMYTgendsj4=",
                    "constant": 2,
                    "data": "pGFvO+WIJK5+kzj3w3OZ9xTa1BIMc+lpe7HYF7lnwKzdphr2eA2kGb5zayUF9SiFprgwfNZO6AfVNG/T1wXCRRpm1vliWw8Qd1QMG9zmQZYj1areSn3sdwLyEhlO+jBUQlcNzDtnEU/OtvuuZnWKotSETzXYBC6TnYtt279QYJNHxeMKlLGzI9ArkQDmBEDI17Yk3GtOxS6AEgOihBMvvdRMuaI5TFH1LABN3hAF5JEZc/9L/amlu6wnpNAYs0sETRetZarU+/yfFUQwLnmve+SO3mMiUs/RfR7HITZjztz7wqT8ao/s4fuLIBtkaFhpsjmg0Rr4j9npKIw9Kj1DaFQ78ZUvaD1Zt32CWm77mymBSDHYuvdrAEVeq4Jcu2iF/IP7QdK6TtwYy2AOFbCKwGv4oHiLGKigOt331eRHTl0dWAKqCdJya9EmDIOaud6L2vrGzkIXtaG/yY1C6IpeyhDQq/rMqvKVDsHN4DRpTx46xeJ9QhV5Wm54hPmRxWh5oYf416HkcmB7+2y8AYq59Z7QSh2ZH/mXySwYwaOR2xYS4Vq80yi8L657pQ6iDXw3qXkw2s0fKqq7XP+vwxMVE6R5tQg2/2dBq1U9szAvRD5j62knETotmtoRIIr7hCT466MwYgRmxLAajM4plHVjm4HrmNuVzj2Hc6N7osN6dQ8=",
                    "name": "Constant Chaum Pedersen Proof",
                    "pad": "5pWkdhEO5iFcSzq0YZbDTn5E8zq1gPJzaA0v44QkJxcx52U0CJ+/bxs0yiBVm9r6a4qYYPzNV6sAuK/f6dNELtv0vKOuqcGX93RHJq93crR/u0hhVPIlLq3OpICTkNpxd2HeQ+rhGIuuN46t0KqB2Ogj8/CSOI1meL+X4yBuN5nEhXmNIfgjvC+owhYwgs3A3NDXXptypMt4MgMfVb40yTt429LSmZ5eOAdzUc7WRCnA5XXyqXbM/apIWBlGjwdO1gJfzuG2kasbOIM//Kls2kWtmuB8m8wJKAu6g4vwFA9PEK16gecqpWms5XVvvXcGGm2hMIh4GB0KkkK23aF7G1HkOH29NrC+mBzJ2tYOUn7VF6EVzCE0Jncctiasd52b2yNocDsrV5BQzKxr+eMeXrKt4wkfUngCaMSsm2YNxRoVDgsbmPTX/0NC06HBc69Vt8CCn0i389/+v54L2S6SSCpelrL6daMfXXDM4K89yyTX78VDaWq6tCSOTmiiGIbA1OPVT4slqg8Y8AOU/VqK7+tsfkBCuUwYviJlesb/pE5Eo9jcBDhHXkx4jpES23xD54vT2zlCOcDckrJZRwgugccz3D1nyvc2SXuKO20UmwYfW0qRRQVN+pFOGWtBLsjWAHE0MV9cvm8fbzUY/KiwmMMqe5D4zl3cmWPzfhN4IyU=",
                    "response": "WTnLsC8mNSzcx5vIwLrPZIPVBYJmLDc+CMKlfq1KsIQ=",
                    "usage": "SelectionLimit",
                },
            },
        ],
        "crypto_hash": "KETape8xOHTorN8kTe1J/kW9d9XTYEcBereNyydCuxE=",
        "description_hash": "7dS66G9hBgVu+fIrx61sJDCECgU9UIawwy+RWi8xR9s=",
        "object_id": "a-voter",
    }


def start_tally_message():
    return {"message_id": "decidim-barcelona.1.start_tally+a.decidim-barcelona"}


def remove_unused(ballot: str):
    b = serialize_as_dict(deserialize(ballot, CiphertextBallot))
    del b["timestamp"]
    return b
