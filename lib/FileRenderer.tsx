import { css, injectGlobal } from "@emotion/css";
import React, { useEffect, useState } from "react";
import { MmsUi, SmsUi } from "./FileRenderer.schema";
import { processXml, xmlDataToString } from "./FileRenderer.utilities";

declare var PATH_TO_XML_MESSAGE_BACKUP: string;

const parse = require("html-react-parser");
const smsMessages = require(PATH_TO_XML_MESSAGE_BACKUP);

declare var MESSAGE_SELF_NAME: string | undefined;
declare var MESSAGE_OTHER_NAME: string | undefined;
declare var MESSAGE_SELF_PHONENUMBER: string | undefined;
declare var MESSAGE_OTHER_PHONENUMBER: string | undefined;

const configuration = {
  selfName:
    typeof MESSAGE_SELF_NAME !== "undefined"
      ? MESSAGE_SELF_NAME
      : "No name provided in .env",
  selfPhoneNumber:
    typeof MESSAGE_SELF_PHONENUMBER !== "undefined"
      ? MESSAGE_SELF_PHONENUMBER
      : "No phonenumber provided in .env",
  otherName:
    typeof MESSAGE_OTHER_NAME !== "undefined"
      ? MESSAGE_OTHER_PHONENUMBER
      : "No name provided in .env",
  otherPhoneNumber:
    typeof MESSAGE_OTHER_PHONENUMBER !== "undefined"
      ? MESSAGE_OTHER_PHONENUMBER
      : "No phonenumber provided in .env",
};

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

interface SmsMessageProps {
  msg: SmsUi;
}

const SmsMessage: React.FC<SmsMessageProps> = ({ msg }) => {
  return (
    <div className={`message sms ${!msg.dateSent ? "self" : "other"}`}>
      <span className="text">{msg.text}</span>
      <span className="date">
        {msg.dateSent} ( Readable {msg.dateReceived} )
      </span>
    </div>
  );
};

interface MmsMessageProps {
  msg: MmsUi;
}

const MmsMessage: React.FC<MmsMessageProps> = ({ msg }) => {
  return (
    <div className={`message mms ${!msg.dateSent ? "self" : "other"}`}>
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
        {msg.dateSent} ( Readable {msg.dateReceived} )
      </span>
    </div>
  );
};

function FileRenderer() {
  const [messages, setMessages] = useState<Array<SmsUi | MmsUi>>([]);

  useEffect(() => {
    let requestCanceled = false;
    const waitForXml = async () => {
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
  }, []);

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
          Messages exported from: {configuration.selfName}'s Phone (
          {configuration.selfPhoneNumber})
        </span>
        <span>
          With: {configuration.otherName} ({configuration.otherPhoneNumber}){" "}
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
}

export default FileRenderer;
