import { css } from "@emotion/css";
import React, { useEffect, useState } from "react";
import { MmsUi, SmsUi } from "./FileRenderer.schema";
import { processXml, xmlDataToString } from "./FileRenderer.utilities";

const parse = require("html-react-parser");

interface SmsMessageProps {
  msg: SmsUi;
}

const SmsMessage: React.FC<SmsMessageProps> = ({ msg }) => {
  return (
    <div className={`message sms ${msg.type === 2 ? "self" : "other"}`}>
      <span className="text">{msg.text}</span>
      <span className="date">
        {msg.dateSent ? msg.dateSent.toLocaleString() : null} ( Readable{" "}
        {msg.dateReceived ? msg.dateReceived.toLocaleString() : null} )
      </span>
    </div>
  );
};

interface MmsMessageProps {
  msg: MmsUi;
}

const MmsMessage: React.FC<MmsMessageProps> = ({ msg }) => {
  return (
    <div className={`message mms ${msg.type === 2 ? "self" : "other"}`}>
      <div className="content">
        {msg.parts.map((part, i) => {
          if (part.type.indexOf("image") !== -1) {
            return (
              <div key={i} className="part">
                <img
                  className={css`
                    max-width: 200px;
                  `}
                  src={`data:image/png;base64,${part.data}`}
                />
              </div>
            );
          } else if (part.type.indexOf("text") !== -1) {
            return (
              <div key={i} className="part" data-type={part.type}>
                {parse(part.data)}
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
      <span className="date">
        {msg.dateSent ? msg.dateSent.toLocaleString() : null} ( Readable{" "}
        {msg.dateReceived ? msg.dateReceived.toLocaleString() : null} )
      </span>
    </div>
  );
};

const getText = (file: File) => {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = function (e) {
      if (e && e.target) {
        const data = e.target.result;
        res(data);
      } else {
        rej(new Error("Must pass a valid File."));
      }
    };
    fr.readAsText(file);
  });
};

interface FileRendererProps {
  file: File;
  selfName: string;
  selfPhoneNumber: string;
  otherName: string;
  otherPhoneNumber: string;
}

const FileRenderer: React.FC<FileRendererProps> = (props) => {
  const [messages, setMessages] = useState<Array<SmsUi | MmsUi>>([]);

  useEffect(() => {
    let requestCanceled = false;
    const waitForXml = async () => {
      const smsMessages = await getText(props.file);
      const messagesRoot = await xmlDataToString(smsMessages);
      const messagesForUi = await processXml(messagesRoot);
      if (!requestCanceled) {
        setMessages(messagesForUi);
      }
    };
    waitForXml();
    return () => {
      requestCanceled = true;
    };
  }, [props]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={css`
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 800px;
          justify-content: center;
          align-items: flex-start;
          margin: 0 auto 0 auto;
        `}
      >
        <span>
          Messages exported from: {props.selfName} ({props.selfPhoneNumber})
        </span>
        <span>
          With: {props.otherName} ({props.otherPhoneNumber})
        </span>
      </div>
      <hr></hr>
      <div
        className={css`
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 800px;
          justify-content: center;
          align-items: center;
          margin: 0 auto 0 auto;

          & > .message {
            width: 50%;
            position: relative;
            display: flex;
            flex-direction: column;

            & .date {
              font-size: x-small;
            }
          }

          & .message.self {
            align-self: flex-end;
          }

          & .message.other {
            align-self: flex-start;
          }

          & .message.self > .text,
          & .message.self > .content {
            border-radius: 20px;
            padding: 8px 15px;
            margin-top: 5px;
            margin-bottom: 5px;

            color: black;
            background: rgba(150, 200, 230, 0.5);
            position: relative;
          }
          & .message.other > .content,
          & .message.other > .text {
            border-radius: 20px;
            padding: 8px 15px;
            margin-top: 5px;
            margin-bottom: 5px;
            background-color: #eee;
            position: relative;
          }
        `}
      >
        {messages.map((msg, k) => {
          if (msg.messageType === "sms") {
            return <SmsMessage key={k} msg={msg} />;
          } else {
            return <MmsMessage key={k} msg={msg} />;
          }
        })}
      </div>
    </>
  );
};

export default FileRenderer;
