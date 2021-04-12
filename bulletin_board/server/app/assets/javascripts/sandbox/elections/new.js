//= require jquery

$(() => {
  const $addQuestionButton = $(".new_election__add-question-button");
  const $questionTemplate = $(".question-template");
  const $questionsPlaceholder = $(".new_election__form-questions-placeholder");
  let questionIndex = 0;

  const addQuestion = () => {
    const currentQuestionIndex = questionIndex;
    const newQuestionElement = $questionTemplate[0].cloneNode(true);
    newQuestionElement.innerHTML = newQuestionElement.innerHTML.replace(
      /{{questionIndex}}/g,
      currentQuestionIndex
    );
    newQuestionElement.innerHTML = newQuestionElement.innerHTML.replace(
      /{{questionIndexPlusOne}}/g,
      currentQuestionIndex + 1
    );
    $questionsPlaceholder.append(
      document.importNode(newQuestionElement.content, true)
    );
    questionIndex += 1;
    return currentQuestionIndex;
  };

  $addQuestionButton.on("click", (event) => {
    const lastIndexAdded = addQuestion();
    $(".new_election__form-ballot-style-questions-placeholder").each(
      (_, $ballotStyleQuestionPlaceholder) => {
        addQuestionToExistingBallotStyle(
          lastIndexAdded,
          $ballotStyleQuestionPlaceholder
        );
      }
    );
    event.preventDefault();
  });

  const $addBallotStyleButton = $(".new_election__add-ballot-style-button");
  const $ballotStyleTemplate = $(".ballot-style-template");
  const $ballotStylesPlaceholder = $(
    ".new_election__form-ballot-styles-placeholder"
  );
  const $ballotStyleQuestionTemplate = $(".ballot-style-question-template");
  let ballotStyleIndex = 0;

  const addBallotStyle = () => {
    const newBallotStyleElement = $ballotStyleTemplate[0].cloneNode(true);
    newBallotStyleElement.innerHTML = newBallotStyleElement.innerHTML.replace(
      /{{ballotStyleIndexPlusOne}}/g,
      ballotStyleIndex + 1
    );

    const ballotStyleNode = document.importNode(
      newBallotStyleElement.content,
      true
    );

    $(".election-question").each((questionIndex) => {
      const $ballotStyleQuestionPlaceholder = $(ballotStyleNode).find(
        ".new_election__form-ballot-style-questions-placeholder"
      );
      addQuestionToExistingBallotStyle(
        questionIndex,
        $ballotStyleQuestionPlaceholder
      );
    });

    $ballotStylesPlaceholder.append(ballotStyleNode);
    ballotStyleIndex += 1;
  };

  const addQuestionToExistingBallotStyle = (
    questionIndex,
    $ballotStyleQuestionPlaceholder
  ) => {
    const newBallotStyleQuestionElement = $ballotStyleQuestionTemplate[0].cloneNode(
      true
    );

    newBallotStyleQuestionElement.innerHTML = newBallotStyleQuestionElement.innerHTML.replace(
      /{{ballotStyleIndexPlusOne}}/g,
      ballotStyleIndex + 1
    );
    newBallotStyleQuestionElement.innerHTML = newBallotStyleQuestionElement.innerHTML.replace(
      /{{questionIndexPlusOne}}/g,
      questionIndex + 1
    );

    $ballotStyleQuestionPlaceholder.append(
      document.importNode(newBallotStyleQuestionElement.content, true)
    );
  };

  $addBallotStyleButton.on("click", (event) => {
    addBallotStyle();
    event.preventDefault();
  });

  addQuestion();
  addQuestion();
});
