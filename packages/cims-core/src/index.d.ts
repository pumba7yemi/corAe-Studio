// Minimal ambient type declarations for the @corae/cims-core stub
export declare function ping(): string;
export declare function emitCimsEvent(evt: any): void;
export declare type CimsEvent = { id: string; type: string; data?: any };
export declare type SendParams = {
  tenantId: string;
  senderId: string;
  threadId?: string;
  subject?: string;
  channel?: 'inapp' | 'email' | 'whatsapp';
  body: string;
  meta?: Record<string, any>;
};
export declare function send(params: SendParams): Promise<any>;

export {};
