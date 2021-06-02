import { css, injectGlobal } from "@emotion/css";
import React, {
  Suspense,
  lazy,
  useReducer,
  useEffect,
  useState,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  Switch,
  Route,
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom";
import FileRenderer from "../lib/FileRenderer";

injectGlobal`
  * {
    box-sizing: border-box;
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: small;
  }
`;

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

interface HomeState {
  attachment: null | File;
}

type ISearchStateFromLocationReducer = (
  state: HomeState,
  changes: RequireAtLeastOne<HomeState>
) => HomeState;

const FileRendererWrapper: React.LazyExoticComponent<typeof FileRenderer> =
  lazy(() => import("lib-esm/FileRenderer"));

const FilePage = () => {
  const location = useLocation();
  const { slug } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [selfName, setSelfName] = useState<string>("No Value Provided");
  const [selfPhoneNumber, setSelfPhoneNumber] =
    useState<string>("No Value Provided");
  const [otherName, setOtherName] = useState<string>("No Value Provided");
  const [otherPhoneNumber, setOtherPhoneNumber] =
    useState<string>("No Value Provided");

  useEffect(() => {
    if ("state" in location) {
      if ("file" in location.state) {
        setFile(location.state.file);
      }
      if ("selfName" in location.state && location.state.selfName) {
        setSelfName(location.state.selfName);
      }
      if (
        "selfPhoneNumber" in location.state &&
        location.state.selfPhoneNumber
      ) {
        setSelfPhoneNumber(location.state.selfPhoneNumber);
      }
      if ("otherName" in location.state && location.state.otherName) {
        setOtherName(location.state.otherName);
      }
      if (
        "otherPhoneNumber" in location.state &&
        location.state.otherPhoneNumber
      ) {
        setOtherPhoneNumber(location.state.otherPhoneNumber);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!file) {
    return null;
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FileRendererWrapper
        file={file}
        selfName={selfName}
        selfPhoneNumber={selfPhoneNumber}
        otherName={otherName}
        otherPhoneNumber={otherPhoneNumber}
      ></FileRendererWrapper>
    </Suspense>
  );
};

const Home = () => {
  const history = useHistory();
  const location = useLocation();
  const selfName = useRef<HTMLInputElement | null>(null);
  const selfPhone = useRef<HTMLInputElement | null>(null);
  const otherName = useRef<HTMLInputElement | null>(null);
  const otherPhone = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let requestCanceled = false;
    return () => {
      requestCanceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const [state, setState] = useReducer<ISearchStateFromLocationReducer>(
    (previousState, changes) => ({
      ...previousState,
      ...changes,
    }),
    {
      attachment: null,
    }
  );

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setState({
      attachment: event.target.files[0],
    });
  };

  const onInputClick = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    const element = event.target as HTMLInputElement;
    element.value = "";
    setState({
      attachment: null,
    });
  };

  const onTransformFile: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    const selfNameVal = selfName.current?.value;
    const selfPhoneVal = selfPhone.current?.value;
    const otherNameVal = otherName.current?.value;
    const otherPhoneVal = otherPhone.current?.value;
    if (state.attachment) {
      history.push(`/smsparse/${state.attachment.name}`, {
        file: state.attachment,
        selfName: selfNameVal,
        selfPhoneNumber: selfPhoneVal,
        otherName: otherNameVal,
        otherPhoneNumber: otherPhoneVal,
      });
    }
  };

  return (
    <>
      <h1>Please upload your file from SMS Backup & Restore</h1>
      <div
        className={css`
          display: flex;
          flex-direction: column;
          gap: 16px 16px;
        `}
      >
        <div>
          <label htmlFor="selfname">Self Name:</label>
          <input type="text" id="selfname" name="selfname" ref={selfName} />
        </div>
        <div>
          <label htmlFor="selfphone">Self Phone Number:</label>
          <input type="text" id="selfphone" name="selfphone" ref={selfPhone} />
        </div>
        <div>
          <label htmlFor="othername">Other Name:</label>
          <input type="text" id="othername" name="othername" ref={otherName} />
        </div>
        <div>
          <label htmlFor="otherphone">Other Phone Number:</label>
          <input
            type="text"
            id="otherphone"
            name="otherphone"
            ref={otherPhone}
          />
        </div>
        <input
          type="file"
          onChange={onFileSelected}
          onClick={onInputClick}
          name="InputFile"
          accept=".xml, .txt"
          multiple={false}
        />
        <button
          className={css`
            width: 250px;
          `}
          onClick={onTransformFile}
        >
          Transform File
        </button>
      </div>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route path="/smsparse/:slug" component={FilePage} />
          <Route path="/*" component={Home} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
