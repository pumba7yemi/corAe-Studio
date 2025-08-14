// Vercel Serverless Function
export default function handler(req, res) {
  // In a later step we’ll read real tasks from storage.
  res.status(200).json([
    { id: 1, title: "Walk Grogu 🐶", status: "pending" },
    { id: 2, title: "Check vendor deliveries", status: "in-progress" },
    { id: 3, title: "Send PO confirmations", status: "done" }
  ]);
}
