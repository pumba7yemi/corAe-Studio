// Returns a small mixed set of Work + Home tasks
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    tasks: [
      { title: "Review supplier PO (Choice Plus)", scope: "Work", when: "Today AM" },
      { title: "Walk dog — 15 min loop", scope: "Home", when: "Today PM" },
      { title: "CIMS: reply to Accounts", scope: "Work", when: "Today" },
      { title: "Plan meals (3 days)", scope: "Home", when: "Tonight" }
    ]
  });
}
