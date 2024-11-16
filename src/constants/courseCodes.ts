export const COURSE_CODES = [
  '363', // Digital Systems
  '365', // Software Engineering
  '367', // Computer Architecture
  '373', // Operating Systems
  '375', // Computer Networks
  '377', // Database Systems
  '379', // Web Technologies
  '381'  // Computer Graphics
] as const;

// Available color combinations to randomly assign
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
] as const;

export const DEFAULT_COLOR = {
  bg: 'bg-blue-100',
  border: 'border-blue-200',
  text: 'text-blue-700'
} as const; 