# flake8: noqa: E501

from bulletin_board.electionguard.utils import deserialize, serialize_as_dict
from electionguard.ballot import CiphertextBallot


def create_election_test_message_v1() -> dict:
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
            "geopolitical_units": [
                {
                    "object_id": "a-place",
                    "name": "A place",
                    "type": "county",
                    "contact_information": {
                        "address_line": [],
                        "name": "Organization name",
                        "email": [
                            {"annotation": "contact", "value": "contact@example.org"}
                        ],
                    },
                    "phone": [],
                }
            ],
            "ballot_styles": [
                {"object_id": "ballot-style", "geopolitical_unit_ids": ["a-place"]}
            ],
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


def create_election_test_message_minimal() -> dict:
    x = create_election_test_message_v1()
    del x["description"]["geopolitical_units"]
    del x["description"]["ballot_styles"]
    return x


def create_election_test_message_v2() -> dict:
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
            "ballot_styles": [
                {"object_id": "barcelona", "contests": ["question1"]},
                {"object_id": "madrid", "contests": ["question1", "question2"]},
            ],
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


def start_vote_message():
    return {"message_id": "decidim-barcelona.1.start_vote+a.decidim-barcelona"}


def end_vote_message():
    return {"message_id": "decidim-barcelona.1.end_vote+a.decidim-barcelona"}


def start_tally_message():
    return {"message_id": "decidim-barcelona.1.start_tally+a.decidim-barcelona"}


def missing_guardian_message(guardian_id):
    return {
        "message_type": "tally.missing_trustee",
        "trustee_id": guardian_id
    }

def remove_unused(ballot: str):
    b: dict = serialize_as_dict(deserialize(ballot, CiphertextBallot))  # type: ignore
    del b["timestamp"]
    return b
