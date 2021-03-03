from setuptools import setup, find_packages

setup(
    name="bulletin_board-election_guard",
    version="0.1.0",
    description="The Python wrapper used by the ElectionGuard voting scheme implementation for the Decidim Bulletin Board.",
    url="http://github.com/codegram/decidim.electionguard",
    author="Codegram",
    author_email="leo@codegram.com",
    license="MIT",
    package_dir={"": "src", "tests": "tests"},
    packages=find_packages("src", "tests"),
    install_requires=["electionguard==1.1.15", "jsons==1.2"],
)
