import * as fastXmlParser from "fast-xml-parser";
import { RootObject, Sms, Mms, SmsUi, MmsUi } from "./FileRenderer.schema";

export function xmlDataToString(xmlData: any): Promise<RootObject> {
  return new Promise((resolve, reject) => {
    if (fastXmlParser.validate(xmlData) === true) {
      const options = {
        attributeNamePrefix: "",
        parseNodeValue: false,
        ignoreAttributes: false,
        parseAttributeValue: true,
        trimValues: false,
        arrayMode: true,
      };
      const jsonObj = fastXmlParser.parse(xmlData, options);
      console.log("parsed xml to json");
      if (!jsonObj) {
        console.log("file was parsed into wrong structure");
        reject(new Error("wrong nested objects (invoices)"));
      }
      resolve(jsonObj.smses[0]);
    } else {
      console.log("could not validate xml data");
      reject(new Error("invalid XML data"));
    }
  });
}

function parseUnixTimestamp(timestamp: number): string | null {
  let date = null;
  if (timestamp !== 0) {
    const digits = (Math.log(timestamp) * Math.LOG10E + 1) | 0;
    date = digits === 10 ? timestamp * 1000 : timestamp;
    date = new Date(date).toLocaleString();
  }
  return date;
}

function packMessageForUi(message: Sms | Mms): SmsUi | MmsUi {
  if (message.message_type === "sms") {
    return {
      messageType: "sms",
      text: message.body,
      dateSent: parseUnixTimestamp(message.date_sent),
      dateReceived: parseUnixTimestamp(message.date),
    };
  } else {
    return {
      messageType: "mms",
      dateSent: parseUnixTimestamp(message.date_sent),
      dateReceived: parseUnixTimestamp(message.date),
      parts: message.parts[0].part.map((part) => ({
        type: part.ct,
        data: part.data || part.text,
      })),
    };
  }
}

function getMessagesInOrder(xmlData: RootObject) {
  let mmsI = 0;
  let smsI = 0;
  let results: Array<SmsUi | MmsUi> = [];
  while (true) {
    let nextMms;
    if (mmsI !== xmlData.mms.length) {
      nextMms = xmlData.mms[mmsI];
    }
    let nextSms;
    if (smsI !== xmlData.sms.length) {
      nextSms = xmlData.sms[smsI];
    }
    if (nextMms === undefined && nextSms === undefined) {
      return results;
    } else if (nextMms === undefined) {
      (nextSms as Sms).message_type = "sms";
      results.push(packMessageForUi(nextSms as Sms));
      smsI += 1;
    } else if (nextSms === undefined) {
      (nextMms as Mms).message_type = "mms";
      results.push(packMessageForUi(nextMms as Mms));
      mmsI += 1;
    } else if (nextMms.date < nextSms.date) {
      (nextMms as Mms).message_type = "mms";
      results.push(packMessageForUi(nextMms as Mms));
      mmsI += 1;
    } else {
      (nextSms as Sms).message_type = "sms";
      results.push(packMessageForUi(nextSms as Sms));
      smsI += 1;
    }
  }
}

export function processXml(xmlData: RootObject): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      // const newObj = Object.assign({}, xmlData);
      // newObj.sms = xmlData.sms.slice(0, 20);
      // newObj.mms = xmlData.mms.slice(3);
      // console.log(newObj);
      const messages = Array.from(getMessagesInOrder(xmlData));
      resolve(messages);
    } catch (e) {
      reject(e);
    }
  });
}
