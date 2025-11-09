import { CaiaMessage } from "../types";
import { sendCIMS } from "@/lib/cims/notify";

export async function sendViaCIMS(msg: CaiaMessage) {
  await sendCIMS("caia:message", {
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    persona: msg.persona,
  });
}
