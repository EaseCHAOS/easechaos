export const COURSE_CODES = [
  // 100 Level Courses
  '141', '142', '151', '155', '156', '157', '158',
  '162', '163', '164', '166', '167', '169', '170',
  '171', '172',
  
  // 200 Level Courses
  '251', '252', '256', '260', '265', '266', '270',
  '271', '272', '273', '275', '276', '277', '278',
  '279', '281',
  
  // 300 Level Courses
  '354', '356', '361', '363', '364', '365', '367',
  '372', '373', '374', '375', '377', '378', '379',
  '380', '381', '382', '384',
  
  // 400 Level Courses
  '450', '451', '452', '458', '459', '460', '461',
  '463', '466', '469', '470', '471', '472', '473',
  '475'
] as const;

export const COLOR_SCHEMES = [
  { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700' },
  { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700' },
  { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-700' },
  { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-700' },
  { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700' },
  { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-700' },
  { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700' },
  { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-700' },
  { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700' },
  { bg: 'bg-fuchsia-100', border: 'border-fuchsia-200', text: 'text-fuchsia-700' },
  { bg: 'bg-lime-100', border: 'border-lime-200', text: 'text-lime-700' },
  { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-700' },
  { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-700' },
  { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-700' },
  { bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-700' },
  { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700' },
  { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700' },
  { bg: 'bg-neutral-100', border: 'border-neutral-200', text: 'text-neutral-700' },
  { bg: 'bg-stone-100', border: 'border-stone-200', text: 'text-stone-700' },
  { bg: 'bg-zinc-100', border: 'border-zinc-200', text: 'text-zinc-700' },
] as const;

export const DEFAULT_COLOR = {
  bg: 'bg-blue-100',
  border: 'border-blue-200',
  text: 'text-blue-700'
} as const; 