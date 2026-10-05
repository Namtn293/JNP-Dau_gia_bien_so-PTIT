// VGCA Type Definitions

export interface VGCASignParams {
  fileUrl: string;
  docNumber?: string;
  sessionId?: string;
  jwtToken?: string;
  fileUploadHandler?: string;
}

export interface VGCASignResponse {
  Status: number;
  Message?: string;
  FileServer?: string;
  [key: string]: any;
}

export interface VGCAPluginParams {
  FileUploadHandler: string;
  FileName: string;
  DocNumber: string;
  SessionId: string;
  JWTToken: string;
}

// Type declaration cho VGCA window object
declare global {
  interface Window {
    vgca_sign_issued?: (params: string, callback: (response: string) => void) => void;
  }
}
