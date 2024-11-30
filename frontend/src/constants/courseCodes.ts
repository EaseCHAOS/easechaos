export const COURSE_CODES = [
  // 100 Level Courses
  '140', '141', '142', '143', '144', '145', '146', '147', '148', '149',
  '150', '151', '152', '153', '154', '155', '156', '157', '158', '159',
  '160', '161', '162', '163', '164', '165', '166', '167', '168', '169',
  '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', 
  '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', 
  
  // 200 Level Courses
  '251', '252', '254', '255', '256', '257', '258', '259',
  '260', '261', '265', '266', '270',
  '271', '272', '273', '275', '276', '277', '278',
  '279', '281',
  
  // 300 Level Courses
  '354', '356', '361', '363', '364', '365', '367',
  '372', '373', '374', '375', '377', '378', '379',
  '380', '381', '382', '384', '371', '361', '369',
  
  // 400 Level Courses
  '450', '451', '452', '458', '459', '460', '461',
  '463', '466', '469', '470', '471', '472', '473',
  '475'
] as const;

// Expanded color palette with maximum randomness and dark theme support
export const COLOR_SCHEMES = [
  // Vibrant Color Palette
  { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-700', darkBg: 'dark:bg-purple-900', darkBorder: 'dark:border-purple-800', darkText: 'dark:text-purple-300' },
  { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', darkBg: 'dark:bg-green-900', darkBorder: 'dark:border-green-800', darkText: 'dark:text-green-300' },
  { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-700', darkBg: 'dark:bg-orange-900', darkBorder: 'dark:border-orange-800', darkText: 'dark:text-orange-300' },
  { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-700', darkBg: 'dark:bg-pink-900', darkBorder: 'dark:border-pink-800', darkText: 'dark:text-pink-300' },
  { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', darkBg: 'dark:bg-yellow-900', darkBorder: 'dark:border-yellow-800', darkText: 'dark:text-yellow-300' },
  { bg: 'bg-indigo-100', border: 'border-indigo-200', text: 'text-indigo-700', darkBg: 'dark:bg-indigo-900', darkBorder: 'dark:border-indigo-800', darkText: 'dark:text-indigo-300' },
  { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', darkBg: 'dark:bg-red-900', darkBorder: 'dark:border-red-800', darkText: 'dark:text-red-300' },
  { bg: 'bg-cyan-100', border: 'border-cyan-200', text: 'text-cyan-700', darkBg: 'dark:bg-cyan-900', darkBorder: 'dark:border-cyan-800', darkText: 'dark:text-cyan-300' },
  
  // Earthy and Muted Tones
  { bg: 'bg-emerald-200', border: 'border-emerald-300', text: 'text-emerald-800', darkBg: 'dark:bg-emerald-900', darkBorder: 'dark:border-emerald-800', darkText: 'dark:text-emerald-300' },
  { bg: 'bg-lime-200', border: 'border-lime-300', text: 'text-lime-800', darkBg: 'dark:bg-lime-900', darkBorder: 'dark:border-lime-800', darkText: 'dark:text-lime-300' },
  { bg: 'bg-amber-200', border: 'border-amber-300', text: 'text-amber-800', darkBg: 'dark:bg-amber-900', darkBorder: 'dark:border-amber-800', darkText: 'dark:text-amber-300' },
  
  // Cool and Pastel Shades
  { bg: 'bg-sky-100', border: 'border-sky-200', text: 'text-sky-700', darkBg: 'dark:bg-sky-900', darkBorder: 'dark:border-sky-800', darkText: 'dark:text-sky-300' },
  { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-700', darkBg: 'dark:bg-teal-900', darkBorder: 'dark:border-teal-800', darkText: 'dark:text-teal-300' },
  { bg: 'bg-violet-100', border: 'border-violet-200', text: 'text-violet-700', darkBg: 'dark:bg-violet-900', darkBorder: 'dark:border-violet-800', darkText: 'dark:text-violet-300' },
  
  // Unique and Unconventional Colors
  { bg: 'bg-rose-200', border: 'border-rose-300', text: 'text-rose-800', darkBg: 'dark:bg-rose-900', darkBorder: 'dark:border-rose-800', darkText: 'dark:text-rose-300' },
  { bg: 'bg-fuchsia-200', border: 'border-fuchsia-300', text: 'text-fuchsia-800', darkBg: 'dark:bg-fuchsia-900', darkBorder: 'dark:border-fuchsia-800', darkText: 'dark:text-fuchsia-300' },
  
  // Neutral and Sophisticated Tones
  { bg: 'bg-slate-200', border: 'border-slate-300', text: 'text-slate-800', darkBg: 'dark:bg-slate-900', darkBorder: 'dark:border-slate-800', darkText: 'dark:text-slate-300' },
  { bg: 'bg-[#547DDE]', border: 'border-[#548EF7]', text: 'text-white', darkBg: 'dark:bg-[#48677a]', darkBorder: 'dark:border-[#306099]', darkText: 'dark:text-[#86bfe3]' },
  { bg: 'bg-neutral-200', border: 'border-neutral-300', text: 'text-neutral-800', darkBg: 'dark:bg-neutral-900', darkBorder: 'dark:border-neutral-800', darkText: 'dark:text-neutral-300' },
  
  // Extended Experimental Colors
  { bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-800', darkBg: 'dark:bg-blue-900', darkBorder: 'dark:border-blue-800', darkText: 'dark:text-blue-300' },
  { bg: 'bg-green-200', border: 'border-green-300', text: 'text-green-800', darkBg: 'dark:bg-green-900', darkBorder: 'dark:border-green-800', darkText: 'dark:text-green-300' },
  { bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-800', darkBg: 'dark:bg-purple-900', darkBorder: 'dark:border-purple-800', darkText: 'dark:text-purple-300' },
  { bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-800', darkBg: 'dark:bg-pink-900', darkBorder: 'dark:border-pink-800', darkText: 'dark:text-pink-300' },
  { bg: 'bg-red-200', border: 'border-red-300', text: 'text-red-800', darkBg: 'dark:bg-red-900', darkBorder: 'dark:border-red-800', darkText: 'dark:text-red-300' },
  { bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900', darkBorder: 'dark:border-yellow-800', darkText: 'dark:text-yellow-300' },
  
  { bg: 'bg-cyan-200', border: 'border-cyan-300', text: 'text-cyan-800', darkBg: 'dark:bg-cyan-900', darkBorder: 'dark:border-cyan-800', darkText: 'dark:text-cyan-300' },
  { bg: 'bg-indigo-200', border: 'border-indigo-300', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-900', darkBorder: 'dark:border-indigo-800', darkText: 'dark:text-indigo-300' },
  { bg: 'bg-rose-100', border: 'border-rose-200', text: 'text-rose-700', darkBg: 'dark:bg-rose-900', darkBorder: 'dark:border-rose-800', darkText: 'dark:text-rose-300' },
] as const;

export const DEFAULT_COLOR = {
  bg: 'bg-blue-100',
  border: 'border-blue-200',
  text: 'text-blue-700',
  darkBg: 'dark:bg-blue-900',
  darkBorder: 'dark:border-blue-800',
  darkText: 'dark:text-blue-300'
} as const;