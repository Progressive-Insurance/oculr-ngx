// TODO: this should be an interface
export class CommonErrorSchema {
  brwsVerNam: string = '';
  entrprCustId: string = '';
  sysVerNbr: string = '';
  errCd: string = '';
  sSId: string = '';
  cretByUserId?: string;
  appnam: string = '';
  altSesnId?: string;
  polNbr?: string;
  polRenewCnt?: string;
  stCd?: string;
  chnlCd?: string;
  prodCd?: string;
  agtCd?: string;
  agtPrfxCd?: string;
  errTypTxt: string = '';
  msgTxt: string = '';
  stkTrcTxt?: string;
  unqMsgId: string = '';
  logLvlNam: string = '';
  cmnSchmVerNbr: string = '';
  ofrId?: string;
  URLPthTxt: string = '';
  InstrumentationLogDateTime: any;
  LoggingComputerSystemName: string = '';
  OriginUrl: string = '';
  appEnvrnNam?: string;
  CustomFields: {
    AcssTypDesc?: string;
    AcssModeDesc?: string;
    AcctSesnId?: string;
    APIEndpointNam?: string;
    RiskTypCd?: string;
    CntntGrpCd?: string;
    PolStatCd?: string;
    PolEffDt?: string;
    PolExprDt?: string;
    ReadOnlyFlag?: string;
    HttpStatusCd?: string;
    PProApiUrl?: string;
    AdapterUrl?: string;
    OperSys?: string;
    AppFldObj?: object;
    SrvCallTrcId?: string;
    BrnchNam?: string;
  } = {};
}