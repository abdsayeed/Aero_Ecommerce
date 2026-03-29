"use client";

interface SocialProvidersProps {
  mode: "sign-in" | "sign-up";
}

export default function SocialProviders({ mode }: SocialProvidersProps) {
  return (
    <div className="flex flex-col gap-3">

      {/* Google */}
      <button
        type="button"
        aria-label="Continue with Google"
        className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 text-sm font-medium text-[#111] bg-white hover:bg-[#f5f5f5] transition-colors"
      >
        {/* Official Google G SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
          <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
          <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4068 3.78409 7.8299 3.96409 7.2899V4.9581H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4522 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
          <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.344C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9581L3.96409 7.2899C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      {/* Apple */}
      <button
        type="button"
        aria-label="Continue with Apple"
        className="w-full flex items-center justify-center gap-3 border border-[#e5e5e5] rounded-lg px-4 py-3 text-sm font-medium text-[#111] bg-white hover:bg-[#f5f5f5] transition-colors"
      >
        {/* Apple logo */}
        <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14.2275 13.5938C13.9688 14.1938 13.6613 14.745 13.3013 15.2513C12.8063 15.9413 12.4013 16.4175 12.0938 16.68C11.6138 17.1188 11.1 17.3438 10.5488 17.355C10.1513 17.355 9.67125 17.2388 9.1125 17.0025C8.55 16.7663 8.03625 16.65 7.5675 16.65C7.07625 16.65 6.5475 16.7663 5.9775 17.0025C5.40375 17.2388 4.9425 17.3625 4.59 17.3738C4.06125 17.3963 3.535 17.1675 3.00625 16.68C2.67125 16.3913 2.24875 15.8963 1.74625 15.195C1.20625 14.4413 0.7625 13.5675 0.41875 12.5663C0.05125 11.4863 -0.13375 10.44 -0.13375 9.42375C-0.13375 8.25375 0.12125 7.245 0.63625 6.4013C1.03875 5.7225 1.57875 5.19 2.2575 4.80375C2.93625 4.4175 3.67125 4.22063 4.465 4.20938C4.88875 4.20938 5.44375 4.34063 6.135 4.59938C6.82375 4.85813 7.27 5.00063 7.47 5.00063C7.62 5.00063 8.115 4.83563 8.9475 4.50938C9.73875 4.20563 10.4063 4.08 10.9538 4.12688C12.4688 4.24688 13.6088 4.87313 14.3625 6.01313C13.0088 6.82688 12.3413 7.96688 12.3525 9.42375C12.3638 10.5638 12.7763 11.5088 13.5863 12.2475C13.9538 12.5925 14.3625 12.8588 14.8163 13.0463C14.6213 13.5975 14.4263 14.1038 14.2275 13.5938ZM11.0588 0.45C11.0588 1.35 10.7288 2.19 10.0763 2.9625C9.28375 3.87938 8.32375 4.41 7.28625 4.32563C7.27375 4.21688 7.26625 4.1025 7.26625 3.9825C7.26625 3.12 7.64625 2.19563 8.31125 1.44375C8.64375 1.0125 9.07125 0.65625 9.59625 0.37313C10.1213 0.09375 10.6163 -0.0375 11.0813 -0.05625C11.0925 0.06375 11.0588 0.18375 11.0588 0.45Z" fill="#111111"/>
        </svg>
        Continue with Apple
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <hr className="flex-1 border-[#e5e5e5]" />
        <span className="text-xs text-[#aaa] whitespace-nowrap">
          Or {mode === "sign-in" ? "sign in" : "sign up"} with
        </span>
        <hr className="flex-1 border-[#e5e5e5]" />
      </div>

    </div>
  );
}
