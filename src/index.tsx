import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom";

const FileRendererWrapper = lazy(() => import("lib-esm/FileRenderer"));

const App = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <FileRendererWrapper></FileRendererWrapper>
      </Suspense>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
