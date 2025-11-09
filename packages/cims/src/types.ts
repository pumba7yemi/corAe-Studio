export type EmailLike = {
  subject: string;
  fromEmail: string;
  fromName?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  bodyText: string;
  headers?: Record<string, string>;
  attachments?: { filename: string; mime?: string; size?: number }[];
};

export type FeatureVector = number[]; // length 90