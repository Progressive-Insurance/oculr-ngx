// TODO: this should be an interface
export class CommonErrorSchema {
  brwsVerNam = '';
  entrprCustId = '';
  sysVerNbr = '';
  errCd = '';
  sSId = '';
  cretByUserId?: string;
  appnam = '';
  altSesnId?: string;
  polNbr?: string;
  polRenewCnt?: string;
  stCd?: string;
  chnlCd?: string;
  prodCd?: string;
  agtCd?: string;
  agtPrfxCd?: string;
  errTypTxt = '';
  msgTxt = '';
  stkTrcTxt?: string;
  unqMsgId = '';
  logLvlNam = '';
  cmnSchmVerNbr = '';
  ofrId?: string;
  URLPthTxt = '';
  InstrumentationLogDateTime: any;
  LoggingComputerSystemName = '';
  OriginUrl = '';
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
