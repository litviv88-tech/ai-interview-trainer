"use client";

import type { ReactNode } from "react";
import type { TopicId } from "@/lib/types";

type TopicBackdropProps = {
  topicId: TopicId | null;
  active: boolean;
};

function BiologyMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55">
        <ellipse cx="180" cy="160" rx="70" ry="48" />
        <ellipse cx="180" cy="160" rx="28" ry="18" />
        <circle cx="168" cy="152" r="6" fill="currentColor" opacity="0.35" />
        <path d="M110 160c20-40 60-40 80 0M250 160c-20 40-60 40-80 0" />
        <path
          d="M980 120c40 20 70 70 55 120-40 20-90-10-110-50 10-40 35-70 55-70z"
          fill="currentColor"
          opacity="0.12"
          stroke="none"
        />
        <path d="M980 190c-25-35-10-75 25-95" />
        <path d="M1020 130c30 15 45 50 30 85" />
        <path
          d="M160 620c40-90 90-140 150-160 20 50 10 110-20 160-40 10-90 10-130 0z"
          fill="currentColor"
          opacity="0.1"
          stroke="none"
        />
        <path d="M250 480c-10 40-30 80-55 110" />
        <path d="M280 500c20 45 25 90 15 130" />
        <path
          d="M720 520c0-90 35-150 90-180 30 55 35 120 10 175-30 20-70 25-100 5z"
          opacity="0.7"
        />
        <ellipse cx="765" cy="470" rx="22" ry="35" />
        <path d="M765 430v-40M745 450h40M750 500h30" />
        <circle cx="1080" cy="620" r="55" />
        <circle cx="1080" cy="620" r="18" />
        <path d="M1025 620h110M1080 565v110M1045 585l70 70M1115 585l-70 70" />
        <path
          d="M520 140c60 10 100 55 95 110-55 25-120 5-145-40 15-40 30-70 50-70z"
          fill="currentColor"
          opacity="0.1"
          stroke="none"
        />
        <path d="M560 180c-20-30 5-60 35-70M600 220c25-20 40-50 25-80" />
      </g>
    </svg>
  );
}

function RussianMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern id="ru-lines" width="1200" height="36" patternUnits="userSpaceOnUse">
          <line
            x1="0"
            y1="35"
            x2="1200"
            y2="35"
            stroke="currentColor"
            strokeWidth="1.25"
          />
        </pattern>
      </defs>
      <rect width="1200" height="800" fill="url(#ru-lines)" opacity="0.9" />
      <line
        x1="96"
        y1="0"
        x2="96"
        y2="800"
        stroke="#c45c6a"
        strokeWidth="1.5"
        opacity="0.35"
      />
    </svg>
  );
}

function MathMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.5">
        <polygon points="140,120 220,260 60,260" />
        <rect x="980" y="90" width="110" height="110" rx="4" />
        <circle cx="200" cy="620" r="70" />
        <polygon points="1050,560 1140,640 1080,740 980,700 990,600" />
        <path d="M520 120l90 50-35 95-100 10-20-95z" />
        <ellipse cx="700" cy="650" rx="90" ry="45" />
        <path d="M420 480h160l-80 130z" />
        <rect
          x="780"
          y="280"
          width="100"
          height="100"
          transform="rotate(28 830 330)"
        />
        <path d="M80 400c40-60 100-60 140 0s100 60 140 0" />
        <line x1="900" y1="420" x2="1120" y2="280" />
        <circle cx="900" cy="420" r="6" fill="currentColor" />
        <circle cx="1120" cy="280" r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

function EnglishMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="currentColor" opacity="0.78">
        {/* Big Ben */}
        <g transform="translate(90 180)">
          <rect x="48" y="60" width="44" height="220" />
          <rect x="40" y="40" width="60" height="28" />
          <polygon points="70,0 95,40 45,40" />
          <rect x="58" y="70" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="70" cy="82" r="3" />
          <line x1="70" y1="82" x2="70" y2="72" stroke="#fff8f0" strokeWidth="2" opacity="0.7" />
          <line x1="70" y1="82" x2="80" y2="82" stroke="#fff8f0" strokeWidth="2" opacity="0.7" />
        </g>
        {/* Tower Bridge */}
        <g transform="translate(780 360)">
          <rect x="20" y="40" width="28" height="140" />
          <rect x="260" y="40" width="28" height="140" />
          <rect x="10" y="20" width="48" height="24" />
          <rect x="250" y="20" width="48" height="24" />
          <path d="M34 55h240" stroke="currentColor" strokeWidth="10" fill="none" />
          <path d="M48 55c40 55 120 55 160 0" fill="none" stroke="currentColor" strokeWidth="6" />
          <path d="M0 180h320" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.55" />
        </g>
        {/* Bus */}
        <g transform="translate(480 560)">
          <rect x="0" y="20" width="160" height="58" rx="8" />
          <rect x="12" y="30" width="28" height="22" fill="#fff6ea" opacity="0.85" />
          <rect x="48" y="30" width="28" height="22" fill="#fff6ea" opacity="0.85" />
          <rect x="84" y="30" width="28" height="22" fill="#fff6ea" opacity="0.85" />
          <circle cx="32" cy="82" r="12" fill="#3a1f24" />
          <circle cx="128" cy="82" r="12" fill="#3a1f24" />
        </g>
        {/* Crown accent */}
        <path
          d="M980 140l28 48 32-36 28 36 32-48v78H980z"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

function GeographyMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.7" opacity="0.55">
        <ellipse cx="600" cy="400" rx="210" ry="140" />
        <path d="M390 400c70-90 160-90 230 0s150 90 210 0" />
        <path d="M600 260v280M420 320c120 40 240 40 360 0M420 480c120-40 240-40 360 0" />
        <path
          d="M120 560l70-120 55 70 60-100 50 80 45-55 70 125"
          fill="currentColor"
          opacity="0.12"
          stroke="currentColor"
        />
        <path d="M820 180l50-70 40 55 55-85 60 100H820z" fill="currentColor" opacity="0.14" />
        <path d="M100 220c40 10 70-20 110-10s60 30 100 15" />
        <path d="M140 250c35 8 60-15 95-8s55 22 90 10" />
        <path d="M980 520c45 12 80-18 120-8s70 28 110 12" />
        <path d="M1000 555c40 10 70-14 105-6s60 20 95 8" />
        <circle cx="260" cy="160" r="8" fill="currentColor" opacity="0.35" />
        <circle cx="1040" cy="240" r="8" fill="currentColor" opacity="0.35" />
      </g>
    </svg>
  );
}

function InformaticsMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
        <rect x="140" y="120" width="220" height="150" rx="12" />
        <rect x="160" y="140" width="180" height="100" rx="4" />
        <path d="M220 290h60v20H220zM200 310h100" />
        <rect x="860" y="480" width="160" height="120" rx="10" />
        <circle cx="940" cy="540" r="28" />
        <path d="M940 512v56M912 540h56" />
        <path d="M80 500h120M80 530h80M80 560h100" />
        <path d="M1000 140h80M1040 120v80M980 180h140" />
        <path d="M420 200h80v40h40v80h-60v40h-60z" />
        <path d="M560 220h40M500 280h40M560 340h40" />
        <text
          x="720"
          y="200"
          fill="currentColor"
          stroke="none"
          fontSize="22"
          fontFamily="monospace"
          opacity="0.7"
        >
          01 10 11
        </text>
        <text
          x="180"
          y="680"
          fill="currentColor"
          stroke="none"
          fontSize="20"
          fontFamily="monospace"
          opacity="0.55"
        >
          {"{ } < /> &&"}
        </text>
        <circle cx="640" cy="560" r="50" />
        <path d="M640 510v100M590 560h100M610 525l60 70M670 525l-60 70" />
      </g>
    </svg>
  );
}

function HistoryMotifs() {
  return (
    <svg
      className="topic-motif"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="currentColor" opacity="0.45">
        {/* Columns */}
        <g transform="translate(100 280)">
          <rect x="20" y="40" width="24" height="220" />
          <rect x="90" y="40" width="24" height="220" />
          <rect x="160" y="40" width="24" height="220" />
          <rect x="0" y="20" width="204" height="24" rx="2" />
          <rect x="0" y="260" width="204" height="20" />
          <polygon points="102,0 180,20 24,20" opacity="0.85" />
        </g>
        {/* Scroll */}
        <g transform="translate(820 140)" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 20h180v220H20z" fill="currentColor" opacity="0.12" />
          <path d="M20 20c-14 0-14 28 0 28M200 20c14 0 14 28 0 28" />
          <path d="M20 240c-14 0-14-28 0-28M200 240c14 0 14-28 0-28" />
          <path d="M50 80h120M50 120h120M50 160h90" />
        </g>
        {/* Coin */}
        <g transform="translate(560 520)" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="70" cy="70" r="70" fill="currentColor" opacity="0.1" />
          <circle cx="70" cy="70" r="52" />
          <path d="M70 35v70M45 55h50M45 85h50" />
        </g>
        {/* Laurel hint */}
        <path
          d="M980 560c-30-40-20-90 20-120 10 35 5 75-20 120zM1020 560c30-40 20-90-20-120-10 35-5 75 20 120z"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}

const MOTIFS: Record<TopicId, () => ReactNode> = {
  biology: BiologyMotifs,
  russian: RussianMotifs,
  math: MathMotifs,
  english: EnglishMotifs,
  geography: GeographyMotifs,
  informatics: InformaticsMotifs,
  history: HistoryMotifs,
};

export function TopicBackdrop({ topicId, active }: TopicBackdropProps) {
  if (!active || !topicId) {
    return null;
  }

  const Motif = MOTIFS[topicId];

  return (
    <div className={`topic-backdrop topic-${topicId}`} aria-hidden>
      <div className="topic-backdrop__wash" />
      <div className="topic-backdrop__art">
        <Motif />
      </div>
    </div>
  );
}
