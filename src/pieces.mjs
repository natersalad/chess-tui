// Original vector silhouettes, drawn for this project. Coordinates are 0..100.
// Neutral color fills and restrained outlines echo the supplied visual reference.
const base='<path d="M19 85 Q19 78 26 76 L74 76 Q81 78 81 85 L81 91 L19 91 Z"/>';
const bodies={
 p:'<path d="M25 77 Q27 69 37 62 Q44 56 44 46 L39 46 Q34 46 34 41 L42 35 Q34 31 34 22 Q34 8 50 8 Q66 8 66 22 Q66 31 58 35 L66 41 Q66 46 61 46 L56 46 Q56 56 63 62 Q73 69 75 77 Z"/>',
 r:'<path d="M25 76 L30 38 L23 31 L21 11 L33 11 L33 21 L44 21 L44 9 L56 9 L56 21 L67 21 L67 11 L79 11 L77 31 L70 38 L75 76 Z"/><path d="M30 37 L70 37 M29 72 L71 72" fill="none"/>',
 b:'<path d="M27 77 Q28 68 38 58 L44 43 Q32 39 33 29 Q34 19 50 7 Q66 19 67 29 Q68 39 56 43 L62 58 Q72 68 73 77 Z"/><path d="M50 12 L45 29 M39 43 L61 43 M34 62 Q50 68 66 62" fill="none"/>',
 n:'<path d="M24 77 Q25 61 34 53 L51 35 Q46 35 42 40 L32 43 L18 36 L22 27 L34 19 L39 7 L45 13 Q66 10 75 34 Q82 54 75 77 Z"/><path d="M48 36 Q62 39 61 54 L47 75 M36 25 L38 25" fill="none"/><circle cx="42" cy="23" r="2.2" fill="currentColor" stroke="none"/>',
 q:'<path d="M29 76 L25 58 L16 28 L32 39 L37 20 L50 38 L63 20 L68 39 L84 28 L75 58 L71 76 Z"/><circle cx="16" cy="23" r="6"/><circle cx="36" cy="14" r="6"/><circle cx="64" cy="14" r="6"/><circle cx="84" cy="23" r="6"/><path d="M27 58 Q50 64 73 58 M29 73 Q50 69 71 73" fill="none"/>',
 k:'<path d="M40 8 L46 8 L46 1 L54 1 L54 8 L60 8 L60 16 L54 16 L54 23 Q70 18 78 28 Q90 43 72 57 L63 66 L68 77 L32 77 L37 66 L28 57 Q10 43 22 28 Q30 18 46 23 L46 16 L40 16 Z"/><path d="M36 37 Q26 33 29 42 Q31 49 41 54 L43 40 Z M64 37 Q74 33 71 42 Q69 49 59 54 L57 40 Z" fill="currentColor" stroke="none"/><path d="M36 66 L64 66" fill="none"/>'
};
export function pieceSVG(type,color){const fill=color==='w'?'#f8f8f6':'#565653',stroke=color==='w'?'#464743':'#292a27';return `<g fill="${fill}" stroke="${stroke}" color="${stroke}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${bodies[type]}${base}</g>`;}
