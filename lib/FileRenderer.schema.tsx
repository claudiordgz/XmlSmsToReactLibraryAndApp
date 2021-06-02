export interface Sm {
  protocol: number;
  address: any;
  date: any;
  type: number;
  subject: string;
  body: string;
  toa: string;
  sc_toa: string;
  service_center: any;
  read: number;
  status: number;
  locked: number;
  date_sent: any;
  sub_id: number;
  readable_date: string;
  contact_name: string;
}

export interface Part2 {
  seq: number;
  ct: string;
  name: string;
  chset: string;
  cd: string;
  fn: string;
  cid: string;
  cl: string;
  ctt_s: string;
  ctt_t: string;
  text: string;
  sef_type: number;
  data: string;
}

export interface Part {
  "#text": string;
  part: Part2[];
}

export interface Addr2 {
  address: any;
  type: number;
  charset: number;
}

export interface Addr {
  "#text": string;
  addr: Addr2[];
}

export interface Mm {
  "#text": string;
  date: any;
  spam_report: number;
  ct_t: string;
  msg_box: number;
  address: any;
  sub_cs: string;
  re_type: number;
  retr_st: number;
  re_original_body: string;
  d_tm: string;
  exp: string;
  locked: number;
  msg_id: number;
  app_id: number;
  from_address: string;
  m_id: string;
  retr_txt: string;
  date_sent: number;
  read: number;
  rpt_a: string;
  ct_cls: string;
  bin_info: number;
  pri: string;
  sub_id: number;
  re_content_type: string;
  object_id: string;
  resp_txt: string;
  re_content_uri: string;
  ct_l: string;
  re_original_key: string;
  d_rpt: number;
  reserved: number;
  using_mode: number;
  rr_st: number;
  m_type: number;
  favorite: number;
  rr: number;
  sub: string;
  hidden: number;
  deletable: number;
  read_status: string;
  d_rpt_st: number;
  callback_set: number;
  seen: number;
  re_recipient_address: string;
  device_name: string;
  cmc_prop: string;
  resp_st: string;
  text_only: number;
  sim_slot: number;
  st: string;
  retr_txt_cs: string;
  creator: string;
  m_size: string;
  sim_imsi: string;
  correlation_tag: string;
  re_body: string;
  safe_message: number;
  tr_id: string;
  m_cls: string;
  v: number;
  secret_mode: number;
  re_file_name: string;
  re_count_info: string;
  readable_date: string;
  contact_name: string;
  parts: Part[];
  addrs: Addr[];
}

export interface RootObject {
  "#text": string;
  count: number;
  backup_set: string;
  backup_date: number;
  type: string;
  sms: Sm[];
  mms: Mm[];
}

export interface Sms extends Sm {
  message_type: "sms";
}

export interface Mms extends Mm {
  message_type: "mms";
}

export interface SmsUi {
  messageType: "sms";
  text: string;
  dateSent: Date | null;
  dateReceived: Date | null;
  type: number;
}

export interface MmsUi {
  messageType: "mms";
  dateSent: Date | null;
  dateReceived: Date | null;
  type: number;
  parts: {
    type: string;
    data: string;
  }[];
}
