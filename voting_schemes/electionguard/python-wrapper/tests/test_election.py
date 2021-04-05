import unittest

from bulletin_board.electionguard.election import parse_description

from .utils import (
    create_election_test_message_minimal,
    create_election_test_message_v1,
    create_election_test_message_v2,
)


class TestElection(unittest.TestCase):
    def test_backwards_compatible(self):
        election_message = create_election_test_message_v1()

        self.election = parse_description(election_message["description"])

        assert (
            self.election.is_valid()
        ), "election parsing failed (backwards compatible)"

        for contest in self.election.contests:
            assert (
                contest.electoral_district_id
                == self.election.geopolitical_units[0].object_id
            )

    def test_with_default_geopolitical_units_and_ballot_styles(self):
        election_message = create_election_test_message_minimal()

        self.election = parse_description(election_message["description"])

        assert (
            self.election.is_valid()
        ), "election parsing failed (with default geopolitical units and ballot styles)"

        for contest in self.election.contests:
            assert (
                contest.electoral_district_id
                == self.election.geopolitical_units[0].object_id
            )

    def test_with_explicit_ballot_styles(self):
        election_message = create_election_test_message_v2()

        self.election = parse_description(election_message["description"])

        assert (
            self.election.is_valid()
        ), "election parsing failed (with explicit ballot styles)"

        for contest in self.election.contests:
            assert (
                contest.electoral_district_id
                == f"{contest.object_id}-geopolitical-unit"
            )
