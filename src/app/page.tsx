"use client";

import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "@/services/api";
import {
  type ContactRequestPayload,
  submitContactRequest,
} from "@/services/contactService";
import {
  type Education,
  getPublicEducations,
} from "@/services/educationService";
import {
  type PublicExperienceItem,
  getExperienceTimeline,
} from "@/services/experienceService";
import {
  type PublicProjectItem,
  getProjectShowcase,
} from "@/services/projectService";
import {
  type SkillCategory,
  getPublicSkillCategories,
} from "@/services/skillService";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-portfolio-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-portfolio-body",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-portfolio-mono",
});

interface HighlightItem {
  id?: number;
  text: string;
  profileId?: number;
}

interface PublicProfileSummary {
  id?: number;
  fullName: string;
  profilePhotoUrl?: string | null;
  titleLine: string;
  githubLink?: string;
  linkedinLink?: string;
  email: string;
  live?: boolean;
  heroHeadline?: string | null;
  heroDescription?: string | null;
  aboutHeadline?: string | null;
  aboutDescription?: string | null;
  highlights?: HighlightItem[];
}

interface PortfolioData {
  profile: PublicProfileSummary;
  experiences: PublicExperienceItem[];
  projects: PublicProjectItem[];
  skillCategories: SkillCategory[];
  education: Education[];
}

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
] as const;

const INQUIRY_OPTIONS = [
  "Project Build",
  "Freelance Collaboration",
  "Full-Time Opportunity",
  "Technical Consulting",
  "Other",
] as const;

const CONTACT_INITIAL_STATE: ContactRequestPayload = {
  name: "",
  email: "",
  reason: INQUIRY_OPTIONS[0],
  description: "",
  website: "",
};


const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PROJECT_BACKGROUNDS = [
  "radial-gradient(circle at top left, rgba(115, 228, 202, 0.18), transparent 42%)",
  "radial-gradient(circle at top left, rgba(255, 157, 115, 0.18), transparent 42%)",
  "radial-gradient(circle at top left, rgba(245, 213, 154, 0.18), transparent 42%)",
];

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const emptyProfile = (): PublicProfileSummary => ({
  fullName: "",
  profilePhotoUrl: null,
  titleLine: "",
  githubLink: "",
  linkedinLink: "",
  email: "",
  live: false,
  heroHeadline: null,
  heroDescription: null,
  aboutHeadline: null,
  aboutDescription: null,
  highlights: [],
});

const normalizeProfile = (
  profile?: Partial<PublicProfileSummary> | null
): PublicProfileSummary => ({
  fullName: profile?.fullName ?? "",
  profilePhotoUrl: profile?.profilePhotoUrl ?? null,
  titleLine: profile?.titleLine ?? "",
  githubLink: profile?.githubLink ?? "",
  linkedinLink: profile?.linkedinLink ?? "",
  email: profile?.email ?? "",
  live: Boolean(profile?.live),
  heroHeadline: profile?.heroHeadline ?? null,
  heroDescription: profile?.heroDescription ?? null,
  aboutHeadline: profile?.aboutHeadline ?? null,
  aboutDescription: profile?.aboutDescription ?? null,
  highlights: profile?.highlights ?? [],
});

const getMonogram = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "PF";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

const getReadableLink = (link?: string | null) => {
  if (!link) return "";
  try {
    const url = new URL(link);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return link.replace(/^https?:\/\//, "");
  }
};

const parseDateToken = (value?: string | null) => {
  if (!value) return null;

  const normalized = value.trim();
  if (!normalized) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  }

  if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [year, month] = normalized.split("-").map(Number);
    return Date.UTC(year, month - 1, 1);
  }

  if (/^\d{4}$/.test(normalized)) {
    return Date.UTC(Number(normalized), 0, 1);
  }

  const monthYearMatch = normalized.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, monthName, yearValue] = monthYearMatch;
    const monthIndex = MONTH_NAMES.findIndex(
      (month) => month.toLowerCase() === monthName.toLowerCase()
    );

    if (monthIndex !== -1) {
      return Date.UTC(Number(yearValue), monthIndex, 1);
    }
  }

  const fallback = Date.parse(normalized);
  return Number.isNaN(fallback) ? null : fallback;
};


const formatTimelineDate = (value?: string | null) => {
  if (!value) return "Present";
  if (!value.includes("-")) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const formatTimelineRange = (
  start?: string | null,
  end?: string | null,
  current?: boolean
) => {
  if (!start) return current ? "Present" : "Timeline unavailable";
  return `${formatTimelineDate(start)} - ${current ? "Present" : formatTimelineDate(end)}`;
};

const calculateExperienceYears = (experiences: PublicExperienceItem[]) => {
  const timestamps = experiences
    .map((item) => parseDateToken(item.startDate))
    .filter((value): value is number => value !== null);

  if (timestamps.length === 0) return 0;

  const earliest = Math.min(...timestamps);
  const years = (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 365.25);

  return Math.max(1, Math.round(years));
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const preloadImage = async (url?: string | null) => {
  if (!url) return;
  await new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;

    if (typeof response?.data === "string") return response.data;

    if (
      response?.data &&
      typeof response.data === "object" &&
      "message" in response.data &&
      typeof (response.data as { message?: unknown }).message === "string"
    ) {
      return (response.data as { message: string }).message;
    }
  }

  return fallback;
};

const getPublicProfileSummary = async (): Promise<PublicProfileSummary> => {
  const response = await api.get<PublicProfileSummary>("/public/profile/summary");
  return normalizeProfile(response.data);
};

function ArrowUpRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="m22 8-10 6L2 8" />
    </svg>
  );
}

function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.21-3.37-1.21-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .85-.28 2.78 1.05A9.4 9.4 0 0 1 12 6.84c.85 0 1.7.12 2.5.36 1.92-1.33 2.77-1.05 2.77-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.94 8.5H3.56V20h3.38V8.5Zm.22-3.56C7.15 3.86 6.37 3 5.27 3 4.18 3 3.4 3.86 3.4 4.94c0 1.07.77 1.94 1.85 1.94h.02c1.1 0 1.88-.87 1.88-1.94ZM20.6 12.72c0-3.36-1.79-4.92-4.18-4.92-1.93 0-2.79 1.08-3.27 1.84V8.5H9.77c.04.76 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.92.27-.68.87-1.39 1.88-1.39 1.33 0 1.86 1.05 1.86 2.59V20H20.6v-7.28Z" />
    </svg>
  );
}

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s7-5.54 7-11a7 7 0 1 0-14 0c0 5.46 7 11 7 11Z" />
      <path d="M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
      <path d="M5 19 6 22l1-3 3-1-3-1-1-3-1 3-3 1 3 1Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
    </svg>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("portfolio-reveal", isVisible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="portfolio-mono text-xs uppercase tracking-[0.42em] text-[var(--portfolio-accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight text-[var(--portfolio-text)] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <div
        className={cn(
          "mt-5 h-[3px] w-28 rounded-full bg-[linear-gradient(90deg,var(--portfolio-accent),var(--portfolio-accent-2),var(--portfolio-warm))]",
          align === "center" && "mx-auto"
        )}
      />
      {copy ? (
        <p className="mt-6 text-base leading-8 text-[var(--portfolio-muted)] sm:text-lg">
          {copy}
        </p>
      ) : null}
    </div>
  );
}


function PortfolioLoader({ stage }: { stage: string }) {
  return (
    <main
      className={cn(
        "portfolio-page portfolio-loader-shell relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-[var(--portfolio-text)]",
        displayFont.variable,
        bodyFont.variable,
        monoFont.variable
      )}
    >
      <div className="portfolio-grid absolute inset-0 opacity-30" />
      <div className="absolute left-[8%] top-[12%] h-56 w-56 rounded-full bg-[rgba(115,228,202,0.12)] blur-3xl portfolio-drift" />
      <div className="absolute right-[10%] top-[18%] h-48 w-48 rounded-full bg-[rgba(255,157,115,0.14)] blur-3xl portfolio-drift" />
      <div className="absolute bottom-[8%] left-[38%] h-48 w-48 rounded-full bg-[rgba(245,213,154,0.10)] blur-3xl portfolio-drift" />

      <div className="relative flex flex-col items-center gap-8 text-center">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <span className="portfolio-loader-ring" />
          <span
            className="portfolio-loader-ring scale-[0.78]"
            style={{ animationDirection: "reverse", animationDuration: "14s" }}
          />
          <span
            className="portfolio-loader-ring scale-[0.56]"
            style={{ animationDuration: "18s" }}
          />
          <span className="portfolio-loader-core" />
        </div>

        <div className="space-y-3">
          <p className="portfolio-mono text-xs uppercase tracking-[0.42em] text-[var(--portfolio-muted)]">
            API HANDSHAKE INITIATED 🤝
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Fetching data from the void... 🌌
          </h1>
          <p className="max-w-xl text-sm leading-7 text-[var(--portfolio-muted)] sm:text-base">
            {stage}
          </p>
        </div>

        <div className="h-1.5 w-72 overflow-hidden rounded-full bg-white/10">
          <div className="portfolio-sweep h-full w-1/2 rounded-full bg-[linear-gradient(90deg,var(--portfolio-accent),var(--portfolio-accent-2),var(--portfolio-warm))]" />
        </div>
      </div>
    </main>
  );
}

function PortfolioError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <main
      className={cn(
        "portfolio-page relative flex min-h-screen items-center justify-center px-6 py-16 text-[var(--portfolio-text)]",
        displayFont.variable,
        bodyFont.variable,
        monoFont.variable
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,157,115,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(115,228,202,0.12),transparent_38%)]" />
      <div className="relative max-w-xl rounded-[36px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-10">
        <p className="portfolio-mono text-xs uppercase tracking-[0.42em] text-[var(--portfolio-accent-2)]">
          Load Interrupted
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Portfolio data could not be loaded</h1>
        <p className="mt-5 text-base leading-8 text-[var(--portfolio-muted)]">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--portfolio-accent),var(--portfolio-accent-2))] px-6 py-3 text-sm font-semibold text-[#091017] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}

export default function HomePage() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSection, setActiveSection] = useState("about");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Connecting to public portfolio endpoints...");
  const [formData, setFormData] = useState<ContactRequestPayload>(CONTACT_INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const loadPortfolio = async () => {
    const startedAt = Date.now();
    setIsLoading(true);
    setLoadError("");

    try {
      const stageMessages = [
        "Establishing secure database connections...",
        "The REST APIs are doing the heavy lifting so you don't have to! 🚀",
        "Warming up the composite indexes and rendering a responsive frontend so you never see an empty shell. Stand by! 🖥️",
      ];

      let stageIndex = 0;
      setLoadingStage(stageMessages[stageIndex]);

      const stageTimer = window.setInterval(() => {
        stageIndex = Math.min(stageIndex + 1, stageMessages.length - 1);
        setLoadingStage(stageMessages[stageIndex]);
      }, 700);

      const [profile, experiences, projects, skillCategories, education] =
        await Promise.all([
          getPublicProfileSummary(),
          getExperienceTimeline(),
          getProjectShowcase(),
          getPublicSkillCategories(),
          getPublicEducations(),
        ]);

      await preloadImage(profile.profilePhotoUrl);

      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 1300 - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      }

      window.clearInterval(stageTimer);

      setPortfolio({
        profile,
        experiences,
        projects,
        skillCategories,
        education,
      });
    } catch (error) {
      setLoadError(
        extractErrorMessage(
          error,
          "Please make sure the Spring Boot backend is running and public APIs are reachable."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPortfolio();
  }, []);

  useEffect(() => {
    let frameId: number | null = null;

    const updateScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight <= 0 ? 0 : (window.scrollY / totalHeight) * 100;

      setScrollProgress((prev) =>
        Math.abs(prev - progress) < 0.5 ? prev : progress
      );

      frameId = null;
    };

    const handleScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);


  useEffect(() => {
    if (!isMobileNavOpen) {
      document.body.classList.remove("portfolio-mobile-lock");
      return;
    }

    document.body.classList.add("portfolio-mobile-lock");

    return () => {
      document.body.classList.remove("portfolio-mobile-lock");
    };
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!portfolio) return;

    const sectionIds = NAV_ITEMS.map((item) => item.id);
    let frameId: number | null = null;

    const updateActiveSection = () => {
      const headerOffset = 140;
      const checkpoint = window.scrollY + headerOffset + window.innerHeight * 0.18;

      let currentSection = sectionIds[0];

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        if (element.offsetTop <= checkpoint) {
          currentSection = id;
        }
      }

      setActiveSection((prev) => (prev === currentSection ? prev : currentSection));
      frameId = null;
    };

    const handleViewportChange = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [portfolio]);



  const profile = portfolio?.profile ?? emptyProfile();
  const experiences = portfolio?.experiences ?? [];
  const projects = portfolio?.projects ?? [];
  const skillCategories = portfolio?.skillCategories ?? [];
  const education = portfolio?.education ?? [];

  const displayName = profile.fullName?.trim() || "Portfolio Owner";
  const heroFirstName = displayName.split(/\s+/)[0] || displayName;
  const profileMonogram = getMonogram(displayName);

  const currentExperience =
    experiences.find((item) => item.isCurrentJob) ?? experiences[0] ?? null;

  const heroLabel =
    profile.heroHeadline?.trim() ||
    profile.titleLine?.trim() ||
    "Live portfolio content";

  const heroDescription =
    profile.heroDescription?.trim() ||
    "Add one live HERO description from the admin dashboard.";

  const aboutHeading =
    profile.aboutHeadline?.trim() ||
    "About Me";

  const aboutDescription =
    profile.aboutDescription?.trim() ||
    "Add one live ABOUT description from the admin dashboard.";

  const secondarySignal =
    currentExperience
      ? `${currentExperience.designation} · ${currentExperience.companyName}`
      : profile.titleLine?.trim() || "Portfolio profile";

  const totalSkills = useMemo(
    () =>
      skillCategories.reduce(
        (sum, category) => sum + (category.skills?.length ?? 0),
        0
      ),
    [skillCategories]
  );

  const experienceYears = useMemo(
    () => calculateExperienceYears(experiences),
    [experiences]
  );


  const spotlightSkills = useMemo(() => {
    return skillCategories
      .flatMap((category) => category.skills ?? [])
      .sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
      .slice(0, 3)
      .map((skill) => skill.name);
  }, [skillCategories]);

  const highlightCards = useMemo(() => {
    const fromProfile = profile.highlights?.map((item) => item.text).filter(Boolean) ?? [];
    if (fromProfile.length > 0) return fromProfile.slice(0, 4);

    const fromSkills = skillCategories
      .flatMap((category) => category.skills ?? [])
      .sort((a, b) => b.level - a.level)
      .slice(0, 4)
      .map((skill) => `Strong with ${skill.name}`);

    if (fromSkills.length > 0) return fromSkills;

    return [
      "Backend-first product thinking",
      "Dependable system design",
      "Calm delivery under pressure",
      "Continuous learning mindset",
    ];
  }, [profile.highlights, skillCategories]);

  const heroStats = [
    {
      label: "Years Building",
      value: experienceYears > 0 ? `${experienceYears}+` : "0",
    },
    {
      label: "Projects Shipped",
      value: String(projects.length).padStart(2, "0"),
    },
    {
      label: "Skill Signals",
      value: String(totalSkills).padStart(2, "0"),
    },
  ];

  const heroLinks = [
    profile.githubLink
      ? {
          label: "GitHub",
          href: profile.githubLink,
          icon: <GithubIcon className="h-4 w-4" />,
        }
      : null,
    profile.linkedinLink
      ? {
          label: "LinkedIn",
          href: profile.linkedinLink,
          icon: <LinkedinIcon className="h-4 w-4" />,
        }
      : null,
    profile.email
      ? {
          label: "Email",
          href: `mailto:${profile.email}`,
          icon: <MailIcon className="h-4 w-4" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    href: string;
    icon: ReactNode;
  }>;

  const contactCards = [
    profile.email
      ? {
          label: "Email",
          value: profile.email,
          href: `mailto:${profile.email}`,
          icon: <MailIcon className="h-5 w-5" />,
        }
      : null,
    profile.linkedinLink
      ? {
          label: "LinkedIn",
          value: getReadableLink(profile.linkedinLink),
          href: profile.linkedinLink,
          icon: <LinkedinIcon className="h-5 w-5" />,
        }
      : null,
    profile.githubLink
      ? {
          label: "GitHub",
          value: getReadableLink(profile.githubLink),
          href: profile.githubLink,
          icon: <GithubIcon className="h-5 w-5" />,
        }
      : null,
    currentExperience?.location
      ? {
          label: "Current Base",
          value: currentExperience.location,
          href: "",
          icon: <PinIcon className="h-5 w-5" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    href: string;
    icon: ReactNode;
  }>;

  const featuredProject = projects[0] ?? null;
  const remainingProjects = featuredProject ? projects.slice(1) : [];

  const scrollToSection = (sectionId: string) => {
    const node = document.getElementById(sectionId);
    if (!node) return;
    setIsMobileNavOpen(false);
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContactSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setFeedback("");
      setIsError(false);

      const message = await submitContactRequest({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        reason: formData.reason.trim(),
        description: formData.description.trim(),
        website: formData.website ?? "",
      });


      setFeedback(message);
      setFormData(CONTACT_INITIAL_STATE);
    } catch (error) {
      setIsError(true);
      setFeedback(
        extractErrorMessage(error, "Unable to send your message right now.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PortfolioLoader stage={loadingStage} />;
  }

  if (loadError || !portfolio) {
    return (
      <PortfolioError
        message={loadError || "Something went wrong while loading the portfolio."}
        onRetry={() => {
          void loadPortfolio();
        }}
      />
    );
  }

  const closeMobileNav = () => setIsMobileNavOpen(false);

  return (
    <>
      <main
        className={cn(
          "portfolio-page relative min-h-screen overflow-x-clip text-[var(--portfolio-text)] [font-family:var(--font-portfolio-body),system-ui,sans-serif]",
          displayFont.variable,
          bodyFont.variable,
          monoFont.variable
        )}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="portfolio-grid absolute inset-0 opacity-20" />
          <div className="absolute left-[-10rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[rgba(115,228,202,0.12)] blur-3xl portfolio-drift" />
          <div className="absolute right-[-6rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-[rgba(255,157,115,0.12)] blur-3xl portfolio-drift" />
          <div className="absolute bottom-[-10rem] left-[28%] h-[20rem] w-[20rem] rounded-full bg-[rgba(245,213,154,0.10)] blur-3xl portfolio-drift" />
        </div>

        <div className="fixed left-0 top-0 z-[90] h-[3px] w-full bg-white/5">
          <div
            className="h-full bg-[linear-gradient(90deg,var(--portfolio-accent),var(--portfolio-accent-2),var(--portfolio-warm))] transition-[width] duration-200 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <header className="fixed inset-x-0 top-0 z-[80] px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[30px] border border-white/10 bg-[rgba(8,17,27,0.72)] px-4 py-3 shadow-[0_22px_70px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-5">
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <button
                type="button"
                onClick={() => {
                  closeMobileNav();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex min-w-0 items-center gap-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-[var(--portfolio-sand)]">
                  {profileMonogram}
                </span>

                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium text-[var(--portfolio-text)]">
                    {displayName}
                  </p>
                </div>
              </button>

              <button
                type="button"
                aria-label={isMobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileNavOpen}
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[var(--portfolio-text)] transition-colors duration-300 hover:bg-white/[0.08]"
              >
                <span className="relative flex h-4 w-5 flex-col items-center justify-between">
                  <span
                    className={cn(
                      "block h-[2px] w-full rounded-full bg-current transition-all duration-300",
                      isMobileNavOpen && "translate-y-[7px] rotate-45"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[2px] w-full rounded-full bg-current transition-all duration-300",
                      isMobileNavOpen && "opacity-0"
                    )}
                  />
                  <span
                    className={cn(
                      "block h-[2px] w-full rounded-full bg-current transition-all duration-300",
                      isMobileNavOpen && "-translate-y-[7px] -rotate-45"
                    )}
                  />
                </span>
              </button>
            </div>

            <div className="hidden items-center justify-between gap-4 lg:flex">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-[var(--portfolio-sand)]">
                  {profileMonogram}
                </span>

                <div className="text-left">
                  <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                    Live Portfolio
                  </p>
                  <p className="text-sm font-medium text-[var(--portfolio-text)]">
                    {displayName}
                  </p>
                </div>
              </button>

              <div className="portfolio-no-scrollbar flex flex-1 items-center justify-end gap-2 overflow-x-auto">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300",
                      activeSection === item.id
                        ? "bg-white/[0.08] text-[var(--portfolio-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                        : "text-[var(--portfolio-muted)] hover:bg-white/[0.05] hover:text-[var(--portfolio-text)]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => scrollToSection("contact")}
                  className="ml-1 inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--portfolio-accent),var(--portfolio-accent-2))] px-4 py-2.5 text-sm font-semibold text-[#091017] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Start a Conversation
                </button>
              </div>
            </div>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 lg:hidden",
                isMobileNavOpen ? "mt-4 max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="rounded-[24px] border border-white/8 bg-[#0d1620]/90 p-3">
                <div className="space-y-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                        activeSection === item.id
                          ? "bg-white/[0.08] text-[var(--portfolio-text)] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "text-[var(--portfolio-muted)] hover:bg-white/[0.05] hover:text-[var(--portfolio-text)]"
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-lg leading-none">›</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollToSection("contact")}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--portfolio-accent),var(--portfolio-accent-2))] px-4 py-3.5 text-sm font-semibold text-[#091017] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Start a Conversation
                </button>
              </div>
            </div>
          </div>
        </header>


        <section
          id="home"
          data-section="home"
          className="scroll-mt-32 px-4 pb-20 pt-36 sm:px-8 sm:pb-24 sm:pt-36 lg:px-10 lg:pb-28 lg:pt-40"
        >
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <Reveal className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[rgba(115,228,202,0.26)] bg-[rgba(115,228,202,0.08)] px-4 py-2 text-sm font-medium text-[var(--portfolio-accent)]">
                  {heroLabel}
                </span>
                <span className="portfolio-mono text-xs uppercase tracking-[0.3em] text-[var(--portfolio-muted)]">
                  {secondarySignal}
                </span>
              </div>

              <div className="space-y-5">
                <p className="portfolio-mono text-xs uppercase tracking-[0.42em] text-[var(--portfolio-muted)]">
                  Portfolio
                </p>
                <h1 className="max-w-5xl text-[3.35rem] font-semibold leading-[0.96] sm:text-6xl lg:text-[5.45rem]">
                  <span className="block text-[var(--portfolio-text)]">Hello, I&apos;m</span>
                  <span className="mt-2 block text-[var(--portfolio-sand)] [text-shadow:0_12px_40px_rgba(245,213,154,0.08)]">
                    {heroFirstName}
                  </span>
                </h1>
              </div>

              <div className="space-y-4">
                <p className="text-2xl font-medium leading-9 text-[rgba(244,238,224,0.88)] sm:text-3xl">
                  {profile.titleLine || "Backend-focused engineer"}
                </p>
                <p className="max-w-2xl text-base leading-8 text-[var(--portfolio-muted)] sm:text-lg">
                  {heroDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("projects")}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--portfolio-accent),var(--portfolio-accent-2))] px-6 py-3.5 text-sm font-semibold text-[#091017] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  See Selected Work
                  <ArrowUpRightIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("contact")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-[var(--portfolio-text)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  Start a Conversation
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
                  >
                    <p className="portfolio-mono text-[11px] uppercase tracking-[0.3em] text-[var(--portfolio-muted)]">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--portfolio-text)]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {heroLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {heroLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-[var(--portfolio-muted)] transition-all duration-300 hover:border-white/20 hover:text-[var(--portfolio-text)]"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => scrollToSection("about")}
                className="portfolio-mono inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--portfolio-muted)] transition-colors duration-300 hover:text-[var(--portfolio-text)]"
              >
                Explore the story
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  ↓
                </span>
              </button>
            </Reveal>

            <Reveal delay={120} className="relative mx-auto w-full max-w-[540px]">
              <div className="pointer-events-none absolute -inset-4 rounded-[44px] border border-white/8" />
              <div className="pointer-events-none absolute -inset-10 rounded-[56px] border border-[rgba(115,228,202,0.10)] portfolio-drift" />
              <div className="pointer-events-none absolute -right-4 top-10 h-28 w-28 rounded-full bg-[rgba(255,157,115,0.15)] blur-3xl" />
              <div className="pointer-events-none absolute -left-4 bottom-16 h-28 w-28 rounded-full bg-[rgba(115,228,202,0.14)] blur-3xl" />

              <div className="portfolio-float relative overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_34px_90px_-40px_rgba(0,0,0,0.92)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,157,115,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(115,228,202,0.10),transparent_42%)]" />

                <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#101926]">
                  <div className="aspect-[4/5]">
                    {profile.profilePhotoUrl ? (
                      <img
                        src={profile.profilePhotoUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#132030,#0d1620)] text-6xl font-semibold tracking-[0.18em] text-[var(--portfolio-sand)]">
                        {profileMonogram}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08111b] via-[#08111b]/55 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <p className="portfolio-mono text-[11px] uppercase tracking-[0.34em] text-[var(--portfolio-muted)]">
                        software engineer
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--portfolio-text)]">
                        {displayName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {spotlightSkills[0] && (
                <div className="absolute -left-6 top-12 hidden rounded-2xl border border-white/10 bg-[rgba(8,17,27,0.82)] px-4 py-3 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:flex sm:items-center sm:gap-3">
                  <SparkIcon className="h-4 w-4 text-[var(--portfolio-accent)]" />
                  <div>
                    <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                      Core Skill
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--portfolio-text)]">
                      {spotlightSkills[0]}
                    </p>
                  </div>
                </div>
              )}

              {currentExperience && (
                <div className="absolute right-0 top-8 hidden rounded-2xl border border-white/10 bg-[rgba(8,17,27,0.82)] px-4 py-3 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:flex sm:items-center sm:gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-[var(--portfolio-sand)]">
                    {getMonogram(currentExperience.companyName)}
                  </span>
                  <div>
                    <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                      Current Role
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--portfolio-text)]">
                      {currentExperience.designation}
                    </p>
                  </div>
                </div>
              )}

              {spotlightSkills[1] && (
                <div className="absolute -right-6 bottom-14 hidden rounded-2xl border border-white/10 bg-[rgba(8,17,27,0.82)] px-4 py-3 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:flex sm:items-center sm:gap-3">
                  <SparkIcon className="h-4 w-4 text-[var(--portfolio-accent-2)]" />
                  <div>
                    <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                      Signal
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--portfolio-text)]">
                      {spotlightSkills[1]}
                    </p>
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </section>

        <section
          id="about"
          data-section="about"
          className="scroll-mt-32 px-4 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Profile"
                title={aboutHeading}
                copy=""
              />
            </Reveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <Reveal delay={80}>
                <article className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] backdrop-blur-xl sm:p-8">
                  <p className="portfolio-mono text-xs uppercase tracking-[0.36em] text-[var(--portfolio-muted)]">
                    Signal Board
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        label: "Featured Projects",
                        value: String(projects.length).padStart(2, "0"),
                      },
                      {
                        label: "Experience Entries",
                        value: String(experiences.length).padStart(2, "0"),
                      },
                      {
                        label: "Skill Groups",
                        value: String(skillCategories.length).padStart(2, "0"),
                      },
                      {
                        label: "Education Stories",
                        value: String(education.length).padStart(2, "0"),
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-white/8 bg-[#0d1620]/70 p-5"
                      >
                        <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                          {item.label}
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-[var(--portfolio-text)]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[28px] border border-white/8 bg-[#0d1620]/80 p-5">
                    <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-accent)]">
                      Current Focus
                    </p>
                    <p className="mt-4 text-2xl font-semibold leading-tight text-[var(--portfolio-text)]">
                      {currentExperience
                        ? `${currentExperience.designation} at ${currentExperience.companyName}`
                        : profile.titleLine || "Building dependable backend systems"}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--portfolio-muted)]">
                      {currentExperience?.location
                        ? `Currently operating from ${currentExperience.location}.`
                        : secondarySignal}
                    </p>
                  </div>
                </article>
              </Reveal>

              <Reveal delay={150}>
                <article className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] backdrop-blur-xl sm:p-8">
                  <p className="portfolio-mono text-xs uppercase tracking-[0.36em] text-[var(--portfolio-muted)]">
                    Field Notes
                  </p>

                  <h3 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-[var(--portfolio-text)] sm:text-4xl">
                    {displayName}
                  </h3>

                  <div className="mt-6 space-y-5 text-base leading-8 text-[var(--portfolio-muted)]">
                    <p>{aboutDescription}</p>

                    {profile.titleLine ? (
                      <p>{profile.titleLine}</p>
                    ) : null}
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {highlightCards.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-[22px] border border-white/8 bg-[#0d1620]/70 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(115,228,202,0.10)] text-[var(--portfolio-accent)]">
                            <SparkIcon className="h-4 w-4" />
                          </span>
                          <p className="text-sm leading-7 text-[var(--portfolio-text)]">
                            {item}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id="experience"
          data-section="experience"
          className="scroll-mt-32 px-4 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Journey Log"
                title="Roles, responsibilities, and shipped momentum."
                copy="Building the high-throughput server-side logic and data pipelines that power complex real-world applications."
                align="center"
              />
            </Reveal>

            {experiences.length === 0 ? (
              <Reveal className="mt-12">
                <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-10 text-center text-[var(--portfolio-muted)]">
                  No public experience entries are available yet.
                </div>
              </Reveal>
            ) : (
              <div className="relative mt-12 space-y-8 before:absolute before:left-[13rem] before:top-0 before:hidden before:h-full before:w-px before:bg-white/10 lg:before:block">
                {experiences.map((experience, index) => (
                  <Reveal key={experience.id} delay={index * 90}>
                    <article className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
                      <div className="lg:pt-5 lg:text-right">
                        <p className="portfolio-mono text-xs uppercase tracking-[0.28em] text-[var(--portfolio-accent)]">
                          {formatTimelineRange(
                            experience.startDate,
                            experience.endDate,
                            experience.isCurrentJob
                          )}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[var(--portfolio-muted)]">
                          {experience.location || "Location not provided"}
                        </p>
                      </div>

                      <div className="relative lg:pl-12">
                        <span className="absolute left-0 top-6 hidden h-3 w-3 rounded-full bg-[var(--portfolio-accent)] ring-8 ring-[rgba(115,228,202,0.10)] lg:block" />

                        <div className="portfolio-card-glow rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_70px_-42px_rgba(0,0,0,0.92)] transition-all duration-500">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-[#0d1620] text-sm font-semibold text-[var(--portfolio-sand)]">
                                {experience.companyLogoUrl ? (
                                  <img
                                    src={experience.companyLogoUrl}
                                    alt={experience.companyName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getMonogram(experience.companyName)
                                )}
                              </div>

                              <div>
                                <h3 className="text-2xl font-semibold text-[var(--portfolio-text)]">
                                  {experience.designation}
                                </h3>
                                <p className="mt-2 text-base font-medium text-[var(--portfolio-accent-2)]">
                                  {experience.companyName}
                                </p>
                              </div>
                            </div>

                            {experience.isCurrentJob && (
                              <span className="rounded-full border border-[rgba(115,228,202,0.30)] bg-[rgba(115,228,202,0.10)] px-3 py-1.5 text-xs font-medium text-[var(--portfolio-accent)]">
                                Current
                              </span>
                            )}
                          </div>

                          <p className="mt-6 text-base leading-8 text-[var(--portfolio-muted)]">
                            {experience.description}
                          </p>

                          {experience.skills.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                              {experience.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[rgba(244,238,224,0.82)]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="projects"
          data-section="projects"
          className="scroll-mt-32 px-4 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Selected Work"
                title="Project stories that moved from intent to usable product."
                copy="A look under the hood at the problem-solving, database structuring, and API design that make these products work."
              />
            </Reveal>

            {projects.length === 0 ? (
              <Reveal className="mt-12">
                <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-10 text-center text-[var(--portfolio-muted)]">
                  No public projects are available yet.
                </div>
              </Reveal>
            ) : (
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {featuredProject && (
                  <Reveal className="lg:col-span-2">
                    <article
                      className="portfolio-card-glow overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] transition-all duration-500 sm:p-8"
                      style={{ backgroundImage: PROJECT_BACKGROUNDS[0] }}
                    >
                      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="portfolio-mono text-xs uppercase tracking-[0.28em] text-[var(--portfolio-accent)]">
                              Featured Project
                            </span>
                            <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-[var(--portfolio-muted)]">
                              {formatTimelineRange(
                                featuredProject.startDate,
                                featuredProject.endDate,
                                featuredProject.isCurrentProject
                              )}
                            </span>
                          </div>

                          <h3 className="mt-4 text-3xl font-semibold leading-tight text-[var(--portfolio-text)] sm:text-4xl">
                            {featuredProject.projectName}
                          </h3>

                          <p className="mt-3 text-base font-medium text-[var(--portfolio-accent-2)]">
                            {featuredProject.organizationName}
                            {featuredProject.designation
                              ? ` · ${featuredProject.designation}`
                              : ""}
                          </p>

                          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--portfolio-muted)]">
                            {featuredProject.description}
                          </p>
                        </div>

                        <div className="rounded-[28px] border border-white/8 bg-[#0d1620]/80 p-5">
                          <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                            Project Signal
                          </p>

                          {featuredProject.skills.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                              {featuredProject.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[rgba(244,238,224,0.82)]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-6 flex flex-wrap gap-3">
                            {featuredProject.githubLink && (
                              <a
                                href={featuredProject.githubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--portfolio-text)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                              >
                                <GithubIcon className="h-4 w-4" />
                                GitHub
                              </a>
                            )}

                            {featuredProject.liveLink && (
                              <a
                                href={featuredProject.liveLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--portfolio-accent),var(--portfolio-accent-2))] px-4 py-2.5 text-sm font-semibold text-[#091017] transition-transform duration-300 hover:-translate-y-0.5"
                              >
                                Open Live
                                <ArrowUpRightIcon className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                )}

                {remainingProjects.map((project, index) => (
                  <Reveal key={project.id} delay={index * 80}>
                    <article
                      className="portfolio-card-glow h-full overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] transition-all duration-500"
                      style={{
                        backgroundImage:
                          PROJECT_BACKGROUNDS[(index + 1) % PROJECT_BACKGROUNDS.length],
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-accent)]">
                          Project
                        </span>
                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-[var(--portfolio-muted)]">
                          {formatTimelineRange(
                            project.startDate,
                            project.endDate,
                            project.isCurrentProject
                          )}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-semibold leading-tight text-[var(--portfolio-text)]">
                        {project.projectName}
                      </h3>

                      <p className="mt-2 text-sm font-medium text-[var(--portfolio-accent-2)]">
                        {project.organizationName}
                        {project.designation ? ` · ${project.designation}` : ""}
                      </p>

                      <p className="mt-5 text-sm leading-8 text-[var(--portfolio-muted)]">
                        {project.description}
                      </p>

                      {project.skills.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {project.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[rgba(244,238,224,0.82)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--portfolio-text)] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                          >
                            <GithubIcon className="h-4 w-4" />
                            Source
                          </a>
                        )}

                        {project.liveLink && (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(115,228,202,0.26)] bg-[rgba(115,228,202,0.10)] px-4 py-2.5 text-sm font-medium text-[var(--portfolio-accent)] transition-all duration-300 hover:border-[rgba(115,228,202,0.4)] hover:bg-[rgba(115,228,202,0.16)]"
                          >
                            Live Preview
                            <ArrowUpRightIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="skills"
          data-section="skills"
          className="scroll-mt-32 px-4 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Capability Map"
                title="Technical depth, grouped by the way I actually work."
                copy="Categorizing the exact tools I use daily to design robust APIs, optimize PostgreSQL queries, and integrate modern AI capabilities."
                align="center"
              />
            </Reveal>

            {skillCategories.length === 0 ? (
              <Reveal className="mt-12">
                <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-10 text-center text-[var(--portfolio-muted)]">
                  No public skill categories are available yet.
                </div>
              </Reveal>
            ) : (
              <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {skillCategories.map((category, categoryIndex) => (
                  <Reveal key={category.id} delay={categoryIndex * 70}>
                    <article className="portfolio-card-glow h-full rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_70px_-42px_rgba(0,0,0,0.92)] transition-all duration-500">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                            Skill Cluster
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold leading-tight text-[var(--portfolio-text)]">
                            {category.name}
                          </h3>
                        </div>

                        <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-[var(--portfolio-muted)]">
                          {(category.skills ?? []).length} items
                        </span>
                      </div>

                      <div className="mt-8 space-y-5">
                        {(category.skills ?? []).slice(0, 6).map((skill, skillIndex) => {
                          const skillBarStyle = {
                            ["--skill-width" as string]: `${clamp(skill.level, 0, 100)}%`,
                            animationDelay: `${160 + skillIndex * 90}ms`,
                          } as CSSProperties;

                          return (
                            <div key={skill.id}>
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-[rgba(244,238,224,0.88)]">
                                  {skill.name}
                                </span>
                                <span className="portfolio-mono text-xs text-[var(--portfolio-muted)]">
                                  {skill.level}%
                                </span>
                              </div>

                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                  className="portfolio-skill-fill h-full rounded-full bg-[linear-gradient(90deg,var(--portfolio-accent),var(--portfolio-accent-2),var(--portfolio-warm))]"
                                  style={skillBarStyle}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="education"
          data-section="education"
          className="scroll-mt-32 px-4 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Foundation"
                title="Academic milestones that supported the engineering path."
                copy="Tracing the academic journey from foundational computer science principles to advanced, master's-level software engineering."
              />
            </Reveal>

            {education.length === 0 ? (
              <Reveal className="mt-12">
                <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-10 text-center text-[var(--portfolio-muted)]">
                  No public education entries are available yet.
                </div>
              </Reveal>
            ) : (
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {education.map((item, index) => (
                  <Reveal key={item.id} delay={index * 90}>
                    <article className="portfolio-card-glow h-full rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] transition-all duration-500 sm:p-8">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[rgba(245,213,154,0.24)] bg-[rgba(245,213,154,0.10)] px-3 py-1.5 text-xs font-medium text-[var(--portfolio-warm)]">
                          {formatTimelineRange(item.fromDate, item.toDate, !item.toDate)}
                        </span>
                      </div>

                      <h3 className="mt-5 text-3xl font-semibold leading-tight text-[var(--portfolio-text)]">
                        {item.degreeName}
                      </h3>

                      <p className="mt-3 text-base font-medium text-[var(--portfolio-accent-2)]">
                        {item.instituteName}
                      </p>

                      <p className="mt-6 text-base leading-8 text-[var(--portfolio-muted)]">
                        {item.shortDescription}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="contact"
          data-section="contact"
          className="scroll-mt-32 px-4 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <SectionHeading
                eyebrow="Open Channel"
                title="If the fit feels right, let’s build something excellent."
                copy="Reach out below to discuss full-time opportunities, backend engineering challenges, or how my skills align with your team."
                align="center"
              />
            </Reveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <Reveal delay={60}>
                <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] sm:p-8">
                  <p className="portfolio-mono text-xs uppercase tracking-[0.36em] text-[var(--portfolio-muted)]">
                    Start Here
                  </p>

                  <h3 className="mt-4 text-2xl font-semibold leading-tight text-[var(--portfolio-text)] sm:text-3xl">
                    Let’s talk about product, systems, or the next opportunity.
                  </h3>

                  <p className="mt-5 text-base leading-8 text-[var(--portfolio-muted)]">
                    If you have a project idea, collaboration, freelance requirement,
                    or a role that needs calm engineering execution, send a message.
                  </p>

                  <div className="mt-8 space-y-4">
                    {contactCards.map((item) =>
                      item.href ? (
                        <a
                          key={`${item.label}-${item.value}`}
                          href={item.href}
                          target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                          rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
                          className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-[#0d1620]/80 px-4 py-4 transition-all duration-300 hover:border-white/15 hover:bg-[#111b27]"
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[var(--portfolio-accent)]">
                            {item.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                              {item.label}
                            </p>
                            <p className="mt-1 break-all text-sm leading-6 text-[var(--portfolio-text)] sm:break-normal">
                              {item.value}
                            </p>
                          </div>
                        </a>
                      ) : (
                        <div
                          key={`${item.label}-${item.value}`}
                          className="flex items-start gap-4 rounded-[24px] border border-white/8 bg-[#0d1620]/80 px-4 py-4"
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[var(--portfolio-accent)]">
                            {item.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="portfolio-mono text-[10px] uppercase tracking-[0.28em] text-[var(--portfolio-muted)]">
                              {item.label}
                            </p>
                            <p className="mt-1 break-all text-sm leading-6 text-[var(--portfolio-text)] sm:break-normal">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Reveal>


              <Reveal delay={140}>
                <form
                  onSubmit={handleContactSubmit}
                  className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.92)] sm:p-8"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--portfolio-text)]">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Your full name"
                        className="w-full rounded-2xl border border-white/10 bg-[#0d1620]/80 px-4 py-3 text-[var(--portfolio-text)] outline-none transition-all duration-300 placeholder:text-[var(--portfolio-muted)] focus:border-[rgba(115,228,202,0.35)]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[var(--portfolio-text)]">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-white/10 bg-[#0d1620]/80 px-4 py-3 text-[var(--portfolio-text)] outline-none transition-all duration-300 placeholder:text-[var(--portfolio-muted)] focus:border-[rgba(115,228,202,0.35)]"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-[var(--portfolio-text)]">
                      Reason
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          reason: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-[#0d1620]/80 px-4 py-3 text-[var(--portfolio-text)] outline-none transition-all duration-300 focus:border-[rgba(115,228,202,0.35)]"
                    >
                      {INQUIRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website ?? ""}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          website: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-[var(--portfolio-text)]">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.description}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      placeholder="Tell me about the product, challenge, or opportunity..."
                      className="w-full resize-none rounded-2xl border border-white/10 bg-[#0d1620]/80 px-4 py-3 text-[var(--portfolio-text)] outline-none transition-all duration-300 placeholder:text-[var(--portfolio-muted)] focus:border-[rgba(115,228,202,0.35)]"
                    />
                  </div>

                  {feedback && (
                    <div
                      className={cn(
                        "mt-5 rounded-2xl border px-4 py-3 text-sm",
                        isError
                          ? "border-[rgba(255,157,115,0.30)] bg-[rgba(255,157,115,0.10)] text-[var(--portfolio-accent-2)]"
                          : "border-[rgba(115,228,202,0.30)] bg-[rgba(115,228,202,0.10)] text-[var(--portfolio-accent)]"
                      )}
                    >
                      {feedback}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,var(--portfolio-accent),var(--portfolio-accent-2))] px-5 py-3.5 text-sm font-semibold text-[#091017] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <SendIcon className="h-4 w-4" />
                  </button>
                </form>
              </Reveal>
            </div>
          </div>
        </section>

        <footer className="px-4 pb-10 pt-8 text-center sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl border-t border-white/10 pt-8">
            <p className="text-sm text-[var(--portfolio-text)]">
              © 2026 {displayName}. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-[var(--portfolio-muted)]">
              Architecting the unseen.
            </p>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        body.portfolio-mobile-lock {
          overflow: hidden;
        }
        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #08111b;
          color: #f5efe4;
        }

        ::selection {
          background: rgba(115, 228, 202, 0.24);
          color: #ffffff;
        }

        .portfolio-page {
          --portfolio-ink: #08111b;
          --portfolio-surface: #0d1620;
          --portfolio-surface-strong: #111d29;
          --portfolio-text: #f5efe4;
          --portfolio-muted: #97a6b9;
          --portfolio-accent: #73e4ca;
          --portfolio-accent-2: #ff9d73;
          --portfolio-warm: #f5d59a;
          background:
            radial-gradient(circle at top left, rgba(115, 228, 202, 0.09), transparent 28%),
            radial-gradient(circle at 82% 14%, rgba(255, 157, 115, 0.1), transparent 24%),
            radial-gradient(circle at 42% 120%, rgba(245, 213, 154, 0.08), transparent 26%),
            linear-gradient(180deg, #08111b 0%, #0a1320 44%, #0a1119 100%);
          min-height: 100vh;
        }

        .portfolio-page h1,
        .portfolio-page h2,
        .portfolio-page h3,
        .portfolio-page h4 {
          font-family: var(--font-portfolio-display), system-ui, sans-serif;
          letter-spacing: -0.04em;
        }

        .portfolio-mono {
          font-family: var(--font-portfolio-mono), monospace;
        }

        .portfolio-no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .portfolio-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .portfolio-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(circle at center, black 34%, transparent 82%);
        }

        .portfolio-loader-shell {
          background:
            radial-gradient(circle at top left, rgba(115, 228, 202, 0.12), transparent 28%),
            radial-gradient(circle at 84% 16%, rgba(255, 157, 115, 0.12), transparent 24%),
            linear-gradient(180deg, #08111b 0%, #0a1320 100%);
        }

        .portfolio-loader-ring {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          animation: portfolio-spin 10s linear infinite;
        }

        .portfolio-loader-ring::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 10px;
          height: 10px;
          width: 10px;
          border-radius: 999px;
          transform: translateX(-50%);
          background: linear-gradient(
            135deg,
            var(--portfolio-accent),
            var(--portfolio-accent-2)
          );
          box-shadow: 0 0 20px rgba(115, 228, 202, 0.65);
        }

        .portfolio-loader-core {
          height: 26px;
          width: 26px;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            var(--portfolio-accent),
            var(--portfolio-accent-2),
            var(--portfolio-warm)
          );
          box-shadow:
            0 0 24px rgba(115, 228, 202, 0.45),
            0 0 48px rgba(255, 157, 115, 0.3);
          animation: portfolio-pulse 2.4s ease-in-out infinite;
        }

        .portfolio-sweep {
          background-size: 200% 100%;
          animation: portfolio-pan 4s linear infinite;
        }

        .portfolio-float {
          animation: portfolio-float 6.5s ease-in-out infinite;
        }

        .portfolio-drift {
          animation: portfolio-drift 18s linear infinite;
        }

        .portfolio-reveal {
          opacity: 0;
          transform: translateY(30px) scale(0.985);
          filter: blur(8px);
          transition:
            opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.85s cubic-bezier(0.22, 1, 0.36, 1),
            filter 0.85s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .portfolio-reveal.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        .portfolio-card-glow:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 100px -48px rgba(0, 0, 0, 0.95);
        }

        .portfolio-skill-fill {
          width: 0;
          animation: portfolio-skill-grow 1.05s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @media (max-width: 1023px) {
          .portfolio-page {
            background:
              radial-gradient(circle at top left, rgba(115, 228, 202, 0.12), transparent 34%),
              radial-gradient(circle at 88% 12%, rgba(255, 157, 115, 0.12), transparent 28%),
              linear-gradient(180deg, #08111b 0%, #0a1320 52%, #0a1119 100%);
          }
        }

        @media (max-width: 767px) {
          .portfolio-page [class*="blur-3xl"] {
            display: none !important;
          }

          .portfolio-page .backdrop-blur-xl,
          .portfolio-page .backdrop-blur-2xl {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          .portfolio-grid {
            mask-image: none;
            opacity: 0.1;
          }

          .portfolio-drift,
          .portfolio-float,
          .portfolio-sweep {
            animation: none !important;
          }

          .portfolio-skill-fill {
            animation: none !important;
            width: var(--skill-width) !important;
          }

          .portfolio-reveal,
          .portfolio-reveal.is-visible {
            filter: none;
          }

          .portfolio-reveal {
            transform: translateY(18px) scale(1);
            transition:
              opacity 0.42s ease-out,
              transform 0.42s ease-out;
          }

          .portfolio-card-glow:hover {
            transform: none;
            box-shadow: 0 24px 80px -42px rgba(0, 0, 0, 0.92);
          }
        }              

        @keyframes portfolio-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes portfolio-pulse {
          0%,
          100% {
            transform: scale(0.92);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes portfolio-pan {
          from {
            transform: translateX(-30%);
          }
          to {
            transform: translateX(130%);
          }
        }

        @keyframes portfolio-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes portfolio-drift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(14px, -18px, 0) scale(1.04);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes portfolio-skill-grow {
          to {
            width: var(--skill-width);
          }
        }
      `}</style>
    </>
  );
}
