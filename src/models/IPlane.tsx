export interface IPlane {
  model: string;
  planeType: string;
  regNbr: string;
  serialNbr: string;
  companyID?: string;
  status?: string;
  certification?: Date;
  eng1?: {
    ENC1SerialNumber: string;
    ENC1Certification?: Date;
    ENC1model: string;
  };
  eng2?: {
    ENC2SerialNumber: string;
    ENC2Certification?: Date;
    ENC2model: string;
  };
  apu?: {
    APUSerialNumber?: string;
    APUCertification?: Date;
    APUmodel: string;
  };
  _id?: string;
  id?: string;
  utilisation?: {
    ACDATE: Date;
    ACHRS: string;
    ACAFL: number;
    ENC1DATE: Date;
    ENC1HRS: string;
    ENC1AFL: number;
    ENC2DATE: Date;
    ENC2HRS: string;
    ENC2AFL: number;
    APUDATE: Date;
    APUHRS: string;
    APUAFL: number;
  };
}
