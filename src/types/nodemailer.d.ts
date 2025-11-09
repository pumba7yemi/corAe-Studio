// Minimal shim so TS is happy. You can replace with real types later.
declare module "nodemailer" {
  const nodemailer: any;
  export default nodemailer;
}