from setuptools import setup, find_packages
import os

setup(
    name="bulletin_board-electionguard",
    version="0.1.1",
    description="The Python wrapper used by the ElectionGuard voting scheme implementation for the Decidim Bulletin Board.",
    url="http://github.com/decidim/decidim-bulletin-board/",
    author="Codegram",
    author_email="leo@codegram.com",
    license="MIT",
    package_dir={"": "src", "tests": "tests"},
    packages=find_packages("src", "tests"),
    install_requires=["electionguard==1.2.3", "jsons==1.2"],
    dependency_links=[
        os.path.join(
            os.getcwd(),
            "..",
            "electionguard-python",
            "dist",
            "electionguard-1.2.1-py3-none-any.whl",
        )
    ],
)
