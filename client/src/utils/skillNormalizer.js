const SKILL_MAP = {
  // Languages
  'js': 'javascript',
  'javascript': 'javascript',
  'ts': 'typescript',
  'typescript': 'typescript',
  'py': 'python',
  'python': 'python',
  'csharp': 'csharp',
  'c#': 'csharp',
  'cpp': 'c++',
  'c++': 'c++',
  'golang': 'go',
  'go': 'go',
  'rust': 'rust',

  // Frameworks & Libraries
  'react': 'react',
  'reactjs': 'react',
  'react.js': 'react',
  'vue': 'vuejs',
  'vuejs': 'vuejs',
  'node': 'nodejs',
  'nodejs': 'nodejs',
  'express': 'express',
  'expressjs': 'express',

  // AI / ML & Data Science
  'tensorflow': 'tensorflow',
  'tf': 'tensorflow',
  'pytorch': 'pytorch',
  'opencv': 'opencv',
  'scikit-learn': 'scikit-learn',
  'sklearn': 'scikit-learn',
  'tflite': 'tensorflow lite',

  // Modern Backend
  'fastapi': 'fastapi',
  'pydantic': 'pydantic',

  // Cybersecurity & Databases
  'cryptography': 'cryptography',
  'crypto': 'cryptography',
  'steganography': 'steganography',
  'mongodb': 'mongodb',
  'mongo': 'mongodb',
  'postgresql': 'postgresql',
  'postgres': 'postgresql'
};

/**
 * Normalizes a single skill string.
 * Preserves special symbols like '+' and '#' so C++ and C# do not collide.
 */
export const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';

  const trimmed = skill.toLowerCase().trim();
  
  // Tier 1: Direct exact match
  if (SKILL_MAP[trimmed]) return SKILL_MAP[trimmed];

  // Tier 2: Collapsed match (removes spaces, dots, hyphens, keeps + and #)
  const collapsed = trimmed.replace(/[^a-z0-9+#]/g, '');
  if (SKILL_MAP[collapsed]) return SKILL_MAP[collapsed];

  // Tier 3: Fallback
  return collapsed || trimmed;
};

/**
 * Normalizes an array of skills, removing duplicates and empty entries.
 */
export const normalizeSkillArray = (skills) => {
  if (!Array.isArray(skills)) return [];
  
  const normalized = skills
    .map(s => normalizeSkill(s))
    .filter(s => s.length > 0);
    
  return [...new Set(normalized)];
};
