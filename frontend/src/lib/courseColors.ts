export interface CourseColor {
  chip: string;
  time: string;
  strong: string;
}

const courseColors: CourseColor[] = [
  {
    chip: "bg-blue-50 text-blue-700 dark:bg-[#1E3A5F] dark:text-[#BFDBFE]",
    time: "text-blue-700/70 dark:text-[#D6E8FF]",
    strong: "bg-[#3B82F6] dark:bg-[#4593F8]",
  },
  {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-[#0D3B2E] dark:text-[#A7F3D0]",
    time: "text-emerald-700/70 dark:text-[#A7F3D0]/90",
    strong: "bg-[#10B981] dark:bg-[#34D399]",
  },
  {
    chip: "bg-violet-50 text-violet-700 dark:bg-[#2E2B5A] dark:text-[#DDD6FE]",
    time: "text-violet-700/70 dark:text-[#DDD6FE]/90",
    strong: "bg-[#8B5CF6] dark:bg-[#A78BFA]",
  },
  {
    chip: "bg-amber-50 text-amber-700 dark:bg-[#3D2F0D] dark:text-[#FDE68A]",
    time: "text-amber-700/70 dark:text-[#FDE68A]/90",
    strong: "bg-[#F59E0B] dark:bg-[#FBBF24]",
  },
  {
    chip: "bg-rose-50 text-rose-700 dark:bg-[#40162B] dark:text-[#FECDD3]",
    time: "text-rose-700/70 dark:text-[#FECDD3]/90",
    strong: "bg-[#F43F5E] dark:bg-[#FB7185]",
  },
  {
    chip: "bg-cyan-50 text-cyan-700 dark:bg-[#0E3A42] dark:text-[#A5F3FC]",
    time: "text-cyan-700/70 dark:text-[#A5F3FC]/90",
    strong: "bg-[#06B6D4] dark:bg-[#22D3EE]",
  },
  {
    chip: "bg-orange-50 text-orange-700 dark:bg-[#3D2410] dark:text-[#FED7AA]",
    time: "text-orange-700/70 dark:text-[#FED7AA]/90",
    strong: "bg-[#F97316] dark:bg-[#FB923C]",
  },
  {
    chip: "bg-teal-50 text-teal-700 dark:bg-[#0E3A37] dark:text-[#99F6E4]",
    time: "text-teal-700/70 dark:text-[#99F6E4]/90",
    strong: "bg-[#14B8A6] dark:bg-[#2DD4BF]",
  },
  {
    chip: "bg-pink-50 text-pink-700 dark:bg-[#401537] dark:text-[#FBCFE8]",
    time: "text-pink-700/70 dark:text-[#FBCFE8]/90",
    strong: "bg-[#EC4899] dark:bg-[#F472B6]",
  },
  {
    chip: "bg-indigo-50 text-indigo-700 dark:bg-[#26315E] dark:text-[#C7D2FE]",
    time: "text-indigo-700/70 dark:text-[#C7D2FE]/90",
    strong: "bg-[#6366F1] dark:bg-[#818CF8]",
  },
];

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getCourseColor(courseName: string): CourseColor {
  return courseColors[hashString(courseName) % courseColors.length];
}
