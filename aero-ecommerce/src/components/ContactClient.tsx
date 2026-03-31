"use client";

import { useState } from "react";
import { Search, MessageSquare, Phone, MapPin } from "lucide-react";

const quickAssists = [
  {
    category: "Returns & Exchanges",
    questions: [
      "What is Aero's returns policy?",
      "How do I return or exchange my Aero order?",
      "Where is my refund?",
    ],
  },
  {
    category: "Dispatch & Delivery",
    questions: [
      "What are Aero's delivery options?",
      "How do I get free delivery on Aero orders?",
      "Can I buy online and pick up at an Aero store?",
    ],
  },
  {
    category: "Orders & Payment",
    questions: [
      "Where is my Aero order?",
      "Can I cancel or change my Aero order?",
      "What are Aero's payment options?",
    ],
  },
  {
    category: "Shopping",
    questions: [
      "How do I find the right size and fit?",
      "Does Aero offer product advice?",
      "How do I use an Aero promo code?",
    ],
  },
  {
    category: "Aero Membership & Apps",
    questions: [
      "What is Aero Membership?",
      "How do I get Aero's newest sneaker releases?",
      "What are the birthday promo terms and conditions?",
    ],
  },
  {
    category: "Company Info",
    questions: [
      "Can I recycle my Aero shoes?",
      "What is Aero's mission?",
      "Where can I learn more about Aero, Inc.?",
    ],
  },
];

export default function ContactClient() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <div className="flex flex-col items-center px-6 pt-20 pb-16 bg-[var(--color-light-100)]">
        <h1 className="text-[56px] leading-[60px] font-bold text-[var(--color-dark-900)] tracking-tight mb-10 text-center">
          GET HELP
        </h1>
        <div className="relative w-full max-w-[560px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What can we help you with?"
            className="w-full h-14 pl-6 pr-14 border border-[var(--color-light-400)] rounded-sm text-[length:var(--text-body)] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors"
          />
          <button
            type="button"
            aria-label="Search"
            className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Quick Assists ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-14 pb-16">

        <div className="mb-10">
          <h2 className="text-[28px] font-semibold text-[var(--color-dark-900)] mb-2">
            Quick Assists
          </h2>
          <p className="text-[length:var(--text-body)] text-[var(--color-dark-700)]">
            Answers to our most frequently asked questions are just one click away.
          </p>
        </div>

        <div className="border-t border-[var(--color-light-300)] mb-12" />

        {/* 3-column grid — two rows of 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-14">
          {quickAssists.map((section) => (
            <div key={section.category} className="flex flex-col">
              <h3 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-4">
                {section.category}
              </h3>
              <ul className="flex flex-col gap-3 flex-1">
                {section.questions.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      className="text-left text-[length:var(--text-caption)] text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] hover:underline underline-offset-2 transition-colors leading-snug"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-5 self-start text-[length:var(--text-caption)] font-medium text-[var(--color-dark-900)] underline underline-offset-2 hover:text-[var(--color-dark-700)] transition-colors"
              >
                View all
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contact Us ── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-6 pb-24">

        <div className="mb-6">
          <h2 className="text-[28px] font-semibold text-[var(--color-dark-900)]">
            Contact Us
          </h2>
        </div>

        <div className="border-t border-[var(--color-light-300)] mb-14" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-16 gap-y-12">

          {/* Chat with us */}
          <div className="flex flex-col gap-5">
            <div className="w-14 h-14 border border-[var(--color-light-300)] flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[var(--color-dark-900)]" strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-2">
                Chat with us
              </h3>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] leading-relaxed">
                Chat with an Aero Expert for help with your order, products, and more.
              </p>
            </div>
            <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] leading-relaxed">
              Mon–Fri: 7am – 7pm<br />
              Sat–Sun: 9am – 5pm
            </p>
            <button
              type="button"
              className="self-start h-11 px-8 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-caption)] font-medium hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none"
            >
              Chat Now
            </button>
          </div>

          {/* Call us */}
          <div className="flex flex-col gap-5">
            <div className="w-14 h-14 border border-[var(--color-light-300)] flex items-center justify-center">
              <Phone className="w-7 h-7 text-[var(--color-dark-900)]" strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-2">
                Call us
              </h3>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] leading-relaxed">
                Speak directly with an Aero Expert.
              </p>
            </div>
            <p className="text-[length:var(--text-footnote)] text-[var(--color-dark-500)] leading-relaxed">
              Mon–Fri: 7am – 7pm<br />
              Sat–Sun: 9am – 5pm
            </p>
            <a
              href="tel:+18005551234"
              className="self-start h-11 px-8 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-caption)] font-medium hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none flex items-center"
            >
              1-800-555-1234
            </a>
          </div>

          {/* Find a Store */}
          <div className="flex flex-col gap-5">
            <div className="w-14 h-14 border border-[var(--color-light-300)] flex items-center justify-center">
              <MapPin className="w-7 h-7 text-[var(--color-dark-900)]" strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="text-[length:var(--text-body-medium)] font-semibold text-[var(--color-dark-900)] mb-2">
                Find a Store
              </h3>
              <p className="text-[length:var(--text-caption)] text-[var(--color-dark-700)] leading-relaxed">
                Visit an Aero store near you for in-person help and the latest products.
              </p>
            </div>
            <div className="flex-1" />
            <button
              type="button"
              className="self-start h-11 px-8 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[length:var(--text-caption)] font-medium hover:bg-[var(--color-dark-700)] transition-colors focus:outline-none"
            >
              Find a Store
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
