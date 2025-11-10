"use client";

/* eslint-disable react/no-unescaped-entities */

import React, { useState } from "react";

const crossSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-neutral-700"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v20" />
    <path d="M5 11h14" />
  </svg>
);

type Prayer = { id: string; title: string; description: string; text: string };

const PRAYERS: Prayer[] = [
  {
    id: "sign-of-cross",
    title: "Sign of the Cross",
    description: "A short prayer to begin and end prayer, invoking the Trinity.",
    text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  },
  {
    id: "our-father",
    title: "Our Father (The Lord's Prayer)",
    description: "The prayer taught by Jesus to his disciples.",
    text:
      "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  {
    id: "hail-mary",
    title: "Hail Mary",
    description: "A prayer asking for the intercession of the Blessed Virgin Mary.",
    text:
      "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  {
    id: "glory-be",
    title: "Glory Be (Doxology)",
    description: "A short hymn of praise to the Trinity.",
    text: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  {
    id: "apostles-creed",
    title: "Apostles' Creed",
    description: "An ancient summary of Christian faith used in Catholic devotion.",
    text:
      "I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  },
  {
    id: "act-of-contrition",
    title: "Act of Contrition",
    description: "A prayer expressing sorrow for sin and resolution to amend one’s life.",
    text:
      "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all-good and deserving of all my love. I firmly resolve, with the help of Thy grace, to confess my sins, to do penance, and to amend my life. Amen.",
  },
  {
    id: "hail-holy-queen",
    title: "Hail, Holy Queen (Salve Regina)",
    description: "A Marian antiphon of consolation and petition.",
    text:
      "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn, then, most gracious advocate, thine eyes of mercy toward us; and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen.",
  },
  {
    id: "come-holy-spirit",
    title: "Come, Holy Spirit",
    description: "A prayer invoking the gifts and presence of the Holy Spirit.",
    text:
      "Come, Holy Spirit, fill the hearts of your faithful and kindle in them the fire of your love. Send forth your Spirit and they shall be created, and you shall renew the face of the earth. Lord, by the light of the Holy Spirit you have taught the hearts of your faithful. In the same Spirit help us to relish what is right and always rejoice in his consolation. We ask this through Christ our Lord. Amen.",
  },
  {
    id: "anima-christi",
    title: "Anima Christi",
    description: "A classic prayer to Jesus used after Communion.",
    text:
      "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within your wounds hide me. Separated from you let me never be. From the malicious enemy defend me. At the hour of death call me and bid me come unto you, that with your saints I may praise you forever and ever. Amen.",
  },
  {
    id: "eternal-rest",
    title: "Eternal Rest",
    description: "Prayer for the repose of the souls of the faithful departed.",
    text: "Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.",
  },
  {
    id: "souls-in-purgatory",
    title: "Prayer for Souls in Purgatory",
    description: "A short prayer to remember and pray for the purification of the departed.",
    text:
      "O Lord, look mercifully upon the souls of Thy servants who have gone before us and grant them rest. Forgive them their sins and bring them into the joy of Thy presence. Through Christ our Lord. Amen.",
  },
  {
    id: "guardian-angel",
    title: "Guardian Angel Prayer",
    description: "A prayer asking for the guidance and protection of one’s guardian angel.",
    text:
      "Angel of God, my guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.",
  },
  {
    id: "st-michael",
    title: "Prayer to St. Michael",
    description: "A prayer for spiritual protection attributed to Pope Leo XIII and widely used.",
    text:
      "Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray, and do thou, O Prince of the heavenly host, by the power of God, thrust into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.",
  },
  {
    id: "rosary-structure",
    title: "Rosary Structure",
    description: "Step-by-step outline for praying the Rosary (simplified).",
    text:
      "1. Make the Sign of the Cross and say the Apostles' Creed.\r\n2. Say one Our Father.\r\n3. Say three Hail Marys for faith, hope, and charity.\r\n4. Say one Glory Be.\r\n5. Announce the first mystery; then say the Our Father.\r\n6. Say ten Hail Marys while meditating on the mystery.\r\n7. Say the Glory Be and the Fatima Prayer (optional).\r\n8. Repeat for the remaining decades (five mysteries), concluding with the Hail, Holy Queen and final prayers.",
  },
];

export default function MainCatholicPrayers() {
  const [open, setOpen] = useState<string | null>("our-father");

  const toggle = (id: string) => {
    setOpen((v) => (v === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-neutral-100 p-4 rounded-full mb-4">{crossSvg}</div>
          <h1 className="text-3xl font-semibold text-neutral-900">Main Catholic Prayers</h1>
          <p className="mt-2 text-neutral-600 max-w-xl">
            A concise collection of the Church's foundational prayers for daily devotion and
            liturgical use.
          </p>
        </div>

        <section className="space-y-4">
          {PRAYERS.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                type="button"
                aria-expanded={open === p.id}
                aria-controls={`${p.id}-panel`}
                onClick={() => toggle(p.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">{p.title}</h3>
                  <p className="text-sm text-neutral-600">{p.description}</p>
                </div>
                <div className="ml-4 text-neutral-500">
                  <svg
                    className={`h-5 w-5 transform transition-transform duration-150 ${
                      open === p.id ? "rotate-180" : "rotate-0"
                    }`}
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              <div
                id={`${p.id}-panel`}
                className={`px-4 pb-4 ${open === p.id ? "block" : "hidden"}`}
              >
                <div className="prose prose-neutral max-w-none text-neutral-800">
                  <pre className="whitespace-pre-wrap bg-transparent p-0 m-0">{p.text}</pre>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
