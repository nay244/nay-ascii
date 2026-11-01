import type { PieceSlug } from "../lib/art/load.ts";

// The blog's index. Post details, note titles and note summaries came from nay-quartz through the mockup's
// blog-data.js; the series descriptions and group names are drafts that Nay accepted with the layout.
// A note is a Markdown file in src/content/notes/<series>/ named by its slug, plus an entry here, in reading order.

export type NoteEntry = { slug: string; title: string; sum?: string };

export type Series = {
  id: "japanese" | "wgu" | "az900" | "data";
  piece: PieceSlug;
  title: string;
  sum: string;
  // Whose writing the series is, when it isn't Nay's.
  source?: { author: string; name: string; url: string };
  // Japanese is listed by topic: [group name, how many of the notes it takes, in order].
  groups?: [string, number][];
  notes: NoteEntry[];
};

export type Post = {
  piece: PieceSlug;
  href: string;
  title: string;
  tag: string;
  when: string;
  year: string;
  sum: string;
  facts: [string, string][];
};

export const POSTS: Post[] = [
  {
    piece: "fuji-dawn-lake", href: "/blog/japan-2023/", title: "Japan 2023", tag: "slice of life", when: "Oct 22 – Nov 5, 2023", year: "Nov 2023",
    sum: "From over 2 years since the initial discussion to the months of planning, a journey that started as a shared dream among a few close friends finally became a reality.",
    facts: [["15", "days"], ["~$2,750", "all in"], ["31", "konbini visits"]],
  },
];

export const SERIES: Series[] = [
  {
    id: "japanese", piece: "autumn-pagoda-maples", title: "Japanese",
    sum: "A resource hub for learning Japanese, collected from Morg Systems: where to start, kanji and their readings, grammar, immersion, and a FAQ.",
    // nay-quartz credits this whole section to Morg Systems, so every page of it says so.
    source: { author: "Morg", name: "Morg Systems", url: "https://morg.systems/Japanese" },
    // [group name, how many of the notes below it takes, in order]
    groups: [["start here", 4], ["writing system", 6], ["grammar and pronunciation", 2], ["how to study", 5], ["tools, tests and communities", 6], ["output and tricks", 2], ["questions", 13]],
    notes: [
      { slug: "japanese-primer", title: "Japanese Primer" },
      { slug: "japanese-learning-resources", title: "Japanese Learning Resources" },
      { slug: "japanese-learning-loop", title: "Japanese Learning Loop" },
      { slug: "beginner-japanese-immersion-material", title: "Beginner Japanese Immersion Material" },
      { slug: "japanese-writing-systems", title: "Japanese writing systems" },
      { slug: "kanji", title: "Kanji" },
      { slug: "onyomi-and-kunyomi", title: "Onyomi and Kunyomi" },
      { slug: "furigana", title: "Furigana" },
      { slug: "gikun", title: "Gikun (義訓)" },
      { slug: "ateji", title: "Ateji" },
      { slug: "japanese-sentence-structure-da-explained", title: "Japanese Sentence Structure: だ Explained" },
      { slug: "getting-started-with-pitch-accent-longer", title: "Getting Started with Pitch Accent" },
      { slug: "mass-immersion-approach", title: "Mass Immersion Approach" },
      { slug: "refold", title: "Refold" },
      { slug: "optimal-reading-immersion-narrow-reading", title: "Optimal Reading Immersion: Narrow Reading" },
      { slug: "practical-tips-to-facilitate-early-reading", title: "Practical Tips to Facilitate Early Reading" },
      { slug: "the-science-of-letting-go", title: "The science of letting go" },
      { slug: "anki", title: "Anki" },
      { slug: "jisho-sentence-search", title: "Jisho Sentence Search" },
      { slug: "migaku", title: "Migaku" },
      { slug: "narou", title: "Narou" },
      { slug: "jlpt-japanese-language-proficiency-test", title: "JLPT" },
      { slug: "ejlx", title: "EJLX" },
      { slug: "learning-to-output", title: "Learning to Output" },
      { slug: "unlocking-japanese-tricks", title: "Unlocking Japanese: Tricks" },
      { slug: "japanese-frequently-asked-questions", title: "Japanese: Frequently Asked Questions" },
      { slug: "collection-of-japanese-phrases-your-textbook-wont-teach-you", title: "Collection of Japanese phrases your textbook won't teach you" },
      { slug: "how-do-i-pronounce-this-word", title: "How do I pronounce this word?" },
      { slug: "how-do-i-read-this-word", title: "How do I read this word?" },
      { slug: "how-do-i-read-this-math-expression-in-japanese", title: "How do I read this math expression in Japanese?" },
      { slug: "how-do-i-look-up-the-meaning-of-this-kanji", title: "How do I look up the meaning of this kanji?" },
      { slug: "what-does-this-word-mean", title: "What does this word mean?" },
      { slug: "what-does-this-contraction-mean", title: "What does this contraction mean?" },
      { slug: "what-does-this-particle-or-grammar-structure-mean", title: "What does this particle or grammar structure mean?" },
      { slug: "what-is-the-counter-for-this-word", title: "What is the counter for this word?" },
      { slug: "what-is-the-difference-between-these-two-words", title: "What is the difference between these two words?" },
      { slug: "what-is-the-difference-between-this-word-written-with-these-two-different-kanji", title: "What is the difference between this word written with these two different kanji?" },
      { slug: "what-words-or-particles-should-i-use-with-this-verb", title: "What words or particles should I use with this verb?" },
    ],
  },
  {
    id: "wgu", piece: "owl-blink", title: "WGU · M.S. Data Analytics",
    sum: "Course-by-course notes from the master's program, from the analytics journey in D204 to the D214 capstone.",
    notes: [
      { slug: "d204-the-data-analytics-journey", title: "D204 · The Data Analytics Journey", sum: "The Data Analytics Journey gives an overview of the entire analytics life cycle, covering terminology, tools, and techniques." },
      { slug: "d205-data-acquisition", title: "D205 · Data Acquisition", sum: "Data Acquisition builds proficiency in SQL and the initial stages of the data analytics lifecycle, introducing relational databases and data transference skills." },
      { slug: "d206-data-cleaning", title: "D206 · Data Cleaning", sum: "Data Cleaning continues building proficiency in the data analytics life cycle with data preparation skills, covering exploring, transforming, and imputing data." },
      { slug: "d207-exploratory-data-analysis", title: "D207 · Exploratory Data Analysis", sum: "Exploratory Data Analysis covers statistical principles supporting the data analytics life cycle, including measures of central tendency, correlations, variation, and hypothesis testing." },
      { slug: "d208-predictive-modeling", title: "D208 · Predictive Modeling", sum: "Predictive Modeling builds on data preparation and cleaning, enabling students to conduct logistic regression and multiple regression to model phenomena revealed by data." },
      { slug: "d209-data-mining-i", title: "D209 · Data Mining I", sum: "Data Mining I expands predictive modeling into nonlinear dimensions, implementing supervised models for classification and prediction to unearth relationships among variables." },
      { slug: "d210-representation-and-reporting", title: "D210 · Representation and Reporting", sum: "Representation and Reporting focuses on communicating observations and patterns to diverse stakeholders through data visualizations, audio representations, and interactive dashboards." },
      { slug: "d211-advanced-data-acquisition", title: "D211 · Advanced Data Acquisition", sum: "Advanced Data Acquisition enhances theoretical and SQL skills, covering advanced SQL operations, aggregating data, and acquiring data from various sources." },
      { slug: "d212-data-mining-ii", title: "D212 · Data Mining II", sum: "Data Mining II delves into advanced data mining techniques using Python, focusing on K-means clustering, Principal Component Analysis, and Market Basket Analysis." },
      { slug: "d213-advanced-data-analytics", title: "D213 · Advanced Data Analytics", sum: "Advanced Data Analytics prepares students for career-long growth in advancing tools and techniques, covering machine learning, neural networks, randomness, and unconventional data sources." },
      { slug: "d214-data-analytics-graduate-capstone", title: "D214 · Data Analytics Graduate Capstone", sum: "The Data Analytics Graduate Capstone allows students to apply academic and professional abilities developed as a graduate student, integrating skills from several program domains into one project." },
    ],
  },
  {
    id: "az900", piece: "cloud-drift", title: "AZ-900",
    sum: "Study notes for Azure Fundamentals: cloud concepts, architecture, core services, identity and security, and cost and governance.",
    notes: [
      { slug: "cloud-concepts", title: "Cloud Concepts", sum: "The foundational concepts of cloud computing: service models, deployment models, shared responsibility, and the key benefits that define cloud adoption." },
      { slug: "azure-architecture", title: "Azure Architecture", sum: "Azure's global physical infrastructure and the logical management hierarchy used to organize and govern resources at scale." },
      { slug: "azure-services", title: "Azure Services", sum: "Core Azure compute, networking, and storage services: the building blocks of any Azure-hosted application or workload." },
      { slug: "identity-security", title: "Identity & Security", sum: "Azure's identity management, authentication methods, access control, and security services that protect resources and workloads." },
      { slug: "cost-governance", title: "Cost & Governance", sum: "Tools and practices for managing Azure costs, enforcing organizational standards, and maintaining governance across subscriptions and resources." },
    ],
  },
  {
    id: "data", piece: "blog-data-notebook", title: "Data analytics",
    sum: "Notes on Excel and Python for data analysis, including a Pluralsight Excel 365 course.",
    notes: [
      { slug: "excel", title: "Excel", sum: "This section will be where I store information embracing the capabilities of Excel for data analysis, financial modeling, and business intelligence." },
      { slug: "pluralsight-excel", title: "Pluralsight Excel", sum: "Notes from the Pluralsight course on Excel 365, detailing key features and functionalities essential for mastering Excel in a professional setting." },
      { slug: "python", title: "Python", sum: "This blog marks the beginning of a new chapter in my professional life, one where I embrace the power of Python for data analysis, machine learning, and data science." },
    ],
  },
];
