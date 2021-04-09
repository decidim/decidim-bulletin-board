from datetime import datetime
from typing import List, Set, Tuple

from electionguard.manifest import (
    BallotStyle,
    Candidate,
    ContestDescription,
    ElectionType,
    GeopoliticalUnit,
    InternationalizedText,
    Manifest,
    ReportingUnitType,
)


def _add_default_geopolitical_units_and_ballot_styles(m: Manifest) -> Manifest:
    m.geopolitical_units.append(
        GeopoliticalUnit(
            object_id="default-geopolitical-unit",
            name="Default Geopolitical Unit",
            type=ReportingUnitType.county,
            contact_information=None,
        )
    )
    m.ballot_styles = [BallotStyle("default-style", ["default-geopolitical-unit"])]

    return m


def _contest_id_to_geopolitical_unit_id(contest_id: str) -> str:
    return f"{contest_id}-geopolitical-unit"


def _translate_ballot_styles(
    styles: List[dict],
) -> Tuple[List[BallotStyle], List[GeopoliticalUnit]]:
    """
    Synthesizes geopolitical units from declared ballot styles.
    We map each question to a fake geopolitical unit.
    """
    ballot_styles: List[BallotStyle] = []
    unique_contest_ids: Set[str] = set()

    for ballot_style in styles:
        if (
            "geopolitical_unit_ids" in ballot_style
        ):  # explicit geopolitical units, don't override
            ballot_styles.append(BallotStyle.from_json_object(ballot_style))
        elif (
            "contests" in ballot_style
        ):  # flag that indicates we need to fake some geopolitical units
            contest_ids = {id for id in ballot_style["contests"]}
            for id in contest_ids:
                unique_contest_ids.add(id)
            ballot_styles.append(
                BallotStyle.from_json_object(
                    {
                        "object_id": ballot_style["object_id"],
                        "geopolitical_unit_ids": [
                            _contest_id_to_geopolitical_unit_id(id)
                            for id in contest_ids
                        ],
                    }
                )
            )

    return ballot_styles, [
        GeopoliticalUnit(
            object_id=_contest_id_to_geopolitical_unit_id(contest_id),
            name=f"{contest_id} Geopolitical Unit",
            type=ReportingUnitType.county,
        )
        for contest_id in unique_contest_ids
    ]


def parse_description(desc: dict) -> Manifest:
    ballot_styles, synthetic_geopolitical_units = _translate_ballot_styles(
        desc.get("ballot_styles", []) or []
    )

    m = Manifest(
        election_scope_id="decidim-election",
        spec_version="v0.95",
        type=ElectionType.special,
        start_date=datetime.fromisoformat(desc["start_date"]),
        end_date=datetime.fromisoformat(desc["end_date"]),
        geopolitical_units=[
            GeopoliticalUnit.from_json_object(unit)
            for unit in (desc.get("geopolitical_units", []) or [])
        ]
        + synthetic_geopolitical_units,
        parties=[],
        candidates=[
            Candidate.from_json_object(candidate) for candidate in desc["candidates"]
        ],
        contests=[],
        ballot_styles=ballot_styles,
        name=InternationalizedText.from_json_object(desc["name"]),
        contact_information=None,
    )

    if len(m.ballot_styles) == 0:
        m = _add_default_geopolitical_units_and_ballot_styles(m)

    if len(m.geopolitical_units) == 1:
        for c in desc["contests"]:
            c["electoral_district_id"] = m.geopolitical_units[0].object_id
            m.contests.append(ContestDescription.from_json_object(c))
    else:
        for c in desc["contests"]:
            gpu_id = None
            for gpu in synthetic_geopolitical_units:
                if gpu.object_id.startswith(c["object_id"]):
                    gpu_id = gpu.object_id
            assert (
                gpu_id is not None
            ), f"Could not find a geopolitical unit for contest {c['object_id']}"

            c["electoral_district_id"] = gpu_id
            m.contests.append(ContestDescription.from_json_object(c))

    return m
