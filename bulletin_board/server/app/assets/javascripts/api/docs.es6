/* eslint-disable react/jsx-no-undef */

// = require jquery3
// = require api/react
// = require api/react-dom
// = require api/graphql-docs

const fetcherFactory = (path) => {
  return (query) => {
    return jQuery.ajax({
      url: path,
      data: JSON.stringify({ query }),
      method: "POST",
      contentType: "application/json",
      dataType: "json",
    });
  };
};

window.renderDocumentation = (path) => {
  ReactDOM.render(
    <GraphQLDocs.GraphQLDocs fetcher={fetcherFactory(path)} />,
    document.getElementById("documentation")
  );
};
