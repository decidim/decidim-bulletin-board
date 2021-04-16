import chalk from "chalk";

const LOCALE = process.env.LOCALE || "en";

/**
 *
 * @param {Object} ballotData - the ballot data parsed from the file.
 * @param {Object} createElectionMessage - the create election message in the election log entries.
 * @returns {Promise<Boolean>}
 */
export const verifyQuestionsAndAnswers = (
  ballotData,
  createElectionMessage
) => {
  try {
    const { plainVote } = ballotData;
    const {
      description: { candidates, contests },
    } = createElectionMessage;

    contests.forEach(
      ({
        object_id: questionId,
        ballot_title: ballotTitle,
        ballot_selections: questionAnswers,
      }) => {
        if (plainVote[questionId] !== undefined) {
          const { text } = ballotTitle;
          const questionTitle = translate(text);
          console.log(`\t\t${questionTitle}`);
          questionAnswers.forEach(
            ({ object_id: answerId, candidate_id: questionCandidateId }) => {
              const candidate = candidates.find(
                ({ object_id: candidateId }) =>
                  candidateId === questionCandidateId
              );
              const {
                ballot_name: { text },
              } = candidate;
              const candidateTitle = translate(text);

              if (plainVote[questionId].includes(answerId)) {
                console.log(
                  `\t\t\t${chalk.underline.black.bgWhite(`${candidateTitle}`)}`
                );
              } else {
                console.log(`\t\t\t${candidateTitle}`);
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(`\t${chalk.red("[ERROR]")} Questions and answers verified.`);
    console.log(`\t\t${error.message}`);
    return false;
  }

  console.log(`\t${chalk.green("[OK]")} Questions and answers verified.`);
  return true;
};

const translate = (text) => {
  const result = text.find(({ language }) => language === LOCALE);
  if (result === undefined) {
    throw new LocaleUnsupportedException();
  }
  return result.value;
};

class LocaleUnsupportedException {
  constructor() {
    return new Error(`${LOCALE} is not supported.`);
  }
}
