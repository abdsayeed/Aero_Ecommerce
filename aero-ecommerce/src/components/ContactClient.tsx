"use client";

import { useState } from "react";
import { Search, MessageSquare, Phone, MapPin, Mail } from "lucide-react";

const quickAssists = [
  {
    category: "Returns & Exchanges",
    questions: [
      "What is Aervyn's returns policy?",
      "How do I return or exchange my order?",
      "Where is my refund?",
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      "What are the delivery options?",
      "How do I get free delivery?",
      "Can I track my Aervyn order?",
    ],
  },
  {
    category: "Orders & Payment",
    questions: [
      "Where is my order?",
      "Can I cancel or change my order?",
      "What payment methods do you accept?",
    ],
  },
  {
    category: "Products & Sizing",
    questions: [
      "How do I find the right size?",
      "What materials do you use?",
      "How do I use a promo code?",
    ],
  },
  {
    category: "Aervyn Community",
    questions: [
      "What is Aervyn Membership?",
      "How do I get early access to drops?",
      "Where can I find the latest lookbook?",
    ],
  },
  {
    category: "Company Info",
    questions: [
      "Is Aervyn sustainable?",
      "What is Aervyn's mission?",
      "Where is Aervyn based?",
    ],
  },
];

export default function ContactClient() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full">

      {/* ── Hero ── */}
      <div className="flex flex-col items-center px-6 pt-24 pb-16 bg-[var(--color-light-100)]">
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-dark-500)] mb-4">
          Support
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--color-dark-900)] tracking-tight mb-10 text-center">
          How Can We Help?
        </h1>
        <div className="relative w-full max-w-[560px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help…"
            className="w-full h-14 pl-6 pr-14 border border-[var(--color-light-300)] text-[14px] text-[var(--color-dark-900)] placeholder:text-[var(--color-dark-500)] bg-[var(--color-light-100)] focus:outline-none focus:border-[var(--color-dark-900)] transition-colors"
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
          <h2 className="text-2xl font-semibold text-[var(--color-dark-900)] mb-2 tracking-tight">
            Quick Assists
          </h2>
          <p className="text-[14px] text-[var(--color-dark-700)]">
            Answers to our most frequently asked questions are just one click away.
          </p>
        </div>

        <div className="border-t border-[var(--color-light-300)] mb-12" />

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-14">
          {quickAssists.map((section) => (
            <div key={section.category} className="flex flex-col">
              <h3 className="text-[14px] font-semibold text-[var(--color-dark-900)] mb-4">
                {section.category}
              </h3>
              <ul className="flex flex-col gap-3 flex-1">
                {section.questions.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      className="text-left text-[13px] text-[var(--color-dark-700)] hover:text-[var(--color-dark-900)] hover:underline underline-offset-2 transition-colors leading-snug"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-5 self-start text-[12px] font-medium tracking-wide uppercase text-[var(--color-dark-900)] underline underline-offset-2 hover:opacity-60 transition-opacity"
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
          <h2 className="text-2xl font-semibold text-[var(--color-dark-900)] tracking-tight">
            Contact Us
          </h2>
        </div>

        <div className="border-t border-[var(--color-light-300)] mb-14" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-16 gap-y-12">

          {/* Chat with us */}
          <div className="flex flex-col gap-5">
            <div className="w-12 h-12 border border-[var(--color-light-300)] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[var(--color-dark-900)]" strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-dark-900)] mb-2">
                Chat with us
              </h3>
              <p className="text-[13px] text-[var(--color-dark-700)] leading-relaxed">
                Chat with the Aervyn team for help with your order, sizing, and more.
              </p>
            </div>
            <p className="text-[11px] text-[var(--color-dark-500)] leading-relaxed">
              Mon–Fri: 9am – 6pm<br />
              Sat: 10am – 4pm
            </p>
            <button
              type="button"
              className="self-start h-10 px-6 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[12px] font-medium tracking-wide uppercase hover:bg-[var(--color-charcoal)] transition-colors focus:outline-none"
            >
              Chat Now
            </button>
          </div>

          {/* Email us */}
          <div className="flex flex-col gap-5">
            <div className="w-12 h-12 border border-[var(--color-light-300)] flex items-center justify-center">
              <Mail className="w-6 h-6 text-[var(--color-dark-900)]" strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-dark-900)] mb-2">
                Email us
              </h3>
              <p className="text-[13px] text-[var(--color-dark-700)] leading-relaxed">
                Drop us an email and we&apos;ll get back to you within 24 hours.
              </p>
            </div>
            <p className="text-[11px] text-[var(--color-dark-500)] leading-relaxed">
              support@aervyn.com
            </p>
            <a
              href="mailto:support@aervyn.com"
              className="self-start h-10 px-6 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[12px] font-medium tracking-wide uppercase hover:bg-[var(--color-charcoal)] transition-colors focus:outline-none flex items-center"
            >
              Send Email
            </a>
          </div>

          {/* Visit us */}
          <div className="flex flex-col gap-5">
            <div className="w-12 h-12 border border-[var(--color-light-300)] flex items-center justify-center">
              <MapPin className="w-6 h-6 text-[var(--color-dark-900)]" strokeWidth={1.25} />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--color-dark-900)] mb-2">
                Visit us
              </h3>
              <p className="text-[13px] text-[var(--color-dark-700)] leading-relaxed">
                Come see our latest collections in person at our London showroom.
              </p>
            </div>
            <div className="flex-1" />
            <button
              type="button"
              className="self-start h-10 px-6 bg-[var(--color-dark-900)] text-[var(--color-light-100)] text-[12px] font-medium tracking-wide uppercase hover:bg-[var(--color-charcoal)] transition-colors focus:outline-none"
            >
              Get Directions
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
