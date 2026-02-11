export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

export function removeComments(code: string, language: string): string {
  let result = code;
  
  if (['javascript', 'typescript', 'java', 'cpp', 'go', 'rust'].includes(language)) {
    // Remove multi-line comments (/* ... */)
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove single-line comments (//)
    result = result.replace(/\/\/.*$/gm, '');
  } else if (language === 'python') {
    // Remove Python comments (#)
    result = result.replace(/#.*$/gm, '');
    // Remove multi-line strings used as comments (docstrings at statement level)
    result = result.replace(/^[ \t]*"""[\s\S]*?"""[ \t]*$/gm, '');
    result = result.replace(/^[ \t]*'''[\s\S]*?'''[ \t]*$/gm, '');
  }
  
  // Remove empty lines
  result = result
    .split('\n')
    .filter(line => line.trim().length > 0)
    .join('\n');
  
  return result;
}

export function generateDiff(originalCode: string, optimizedCode: string): DiffLine[] {
  const originalLines = originalCode.split('\n');
  const optimizedLines = optimizedCode.split('\n');
  
  const result: DiffLine[] = [];
  let origIdx = 0;
  let optIdx = 0;
  
  // Simple line-by-line comparison with grouping
  while (origIdx < originalLines.length || optIdx < optimizedLines.length) {
    if (origIdx < originalLines.length && optIdx < optimizedLines.length) {
      // Both lines exist - check if they match
      if (originalLines[origIdx] === optimizedLines[optIdx]) {
        // Lines match - add as unchanged
        result.push({ type: 'unchanged', content: originalLines[origIdx] });
        origIdx++;
        optIdx++;
      } else {
        // Lines don't match - collect all non-matching from original first
        const removedLines = [];
        while (origIdx < originalLines.length && 
               originalLines[origIdx] !== optimizedLines[optIdx] &&
               !optimizedLines.slice(optIdx).includes(originalLines[origIdx])) {
          removedLines.push(originalLines[origIdx]);
          origIdx++;
        }
        
        // Then collect all non-matching from optimized
        const addedLines = [];
        while (optIdx < optimizedLines.length && 
               optimizedLines[optIdx] !== originalLines[origIdx] &&
               !originalLines.slice(origIdx).includes(optimizedLines[optIdx])) {
          addedLines.push(optimizedLines[optIdx]);
          optIdx++;
        }
        
        // Add all removed lines first (grouped)
        removedLines.forEach(line => {
          result.push({ type: 'removed', content: line });
        });
        
        // Then add all added lines (grouped)
        addedLines.forEach(line => {
          result.push({ type: 'added', content: line });
        });
      }
    } else if (origIdx < originalLines.length) {
      // Only original lines left - they're removed
      result.push({ type: 'removed', content: originalLines[origIdx] });
      origIdx++;
    } else {
      // Only optimized lines left - they're added
      result.push({ type: 'added', content: optimizedLines[optIdx] });
      optIdx++;
    }
  }
  
  return result;
}

export function analyzeDifferences(
  originalCode: string,
  optimizedCode: string
): { added: string[]; removed: string[]; modified: string[] } {
  const originalLines = originalCode
    .split('\n')
    .filter((line) => line.trim().length > 0);
  const optimizedLines = optimizedCode
    .split('\n')
    .filter((line) => line.trim().length > 0);

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  // Find removed and modified lines
  originalLines.forEach((origLine) => {
    const found = optimizedLines.some(
      (optLine) => optLine.trim() === origLine.trim()
    );
    if (!found) {
      const similar = optimizedLines.find((optLine) =>
        optLine.toLowerCase().includes(origLine.toLowerCase().slice(0, 10))
      );
      if (similar) {
        modified.push(`${origLine.trim()} → ${similar.trim()}`);
      } else {
        removed.push(origLine.trim());
      }
    }
  });

  // Find added lines
  optimizedLines.forEach((optLine) => {
    const found = originalLines.some(
      (origLine) => origLine.trim() === optLine.trim()
    );
    if (!found) {
      added.push(optLine.trim());
    }
  });

  return { added, removed, modified };
}

export interface DiffComparison {
  bruteForceName: string;
  bruteForcePoints: string[];
  optimizedName: string;
  optimizedPoints: string[];
}

export function generateDiffExplanation(
  originalCode: string,
  optimizedCode: string
): DiffComparison {
  const bruteForcePoints: string[] = [];
  const optimizedPoints: string[] = [];

  // Analyze imports
  const hasNewImports = optimizedCode.includes('import') && !originalCode.includes('import');
  if (hasNewImports) {
    bruteForcePoints.push('Manual implementation without external utilities');
    optimizedPoints.push('Uses optimized utility classes and imports');
  }

  // Analyze loop structures
  const originalLoops = (originalCode.match(/for\s*\(|while\s*\(/g) || []).length;
  const optimizedLoops = (optimizedCode.match(/for\s*\(|while\s*\(/g) || []).length;

  if (originalLoops > optimizedLoops) {
    bruteForcePoints.push(`Uses nested loops (${originalLoops} loop(s)) to iterate through data`);
    bruteForcePoints.push('Checks every element, making it slow for large datasets');
    bruteForcePoints.push('Time complexity: O(n) - gets slower as data grows');

    optimizedPoints.push(`Optimized iteration (${optimizedLoops} loop(s)) with smart algorithm`);
    optimizedPoints.push('Uses divide-and-conquer or efficient search algorithms');
    optimizedPoints.push('Time complexity: O(log n) - stays fast even for huge datasets');
  }

  // Analyze algorithm type
  if (originalCode.includes('Array') && optimizedCode.includes('binary')) {
    bruteForcePoints.push('Linear search: starts from beginning, checks each item one by one');
    bruteForcePoints.push('Example: Looking through entire phonebook for a name');
    bruteForcePoints.push('Takes more steps for bigger numbers');

    optimizedPoints.push('Binary search: eliminates half the data with each step');
    optimizedPoints.push('Example: Opening phonebook in middle, eliminates half with each try');
    optimizedPoints.push('Instant results, even for billions of items');
  }

  // Check for bit operations (highly optimized)
  if (optimizedCode.includes('>>') || optimizedCode.includes('<<') || optimizedCode.includes('&')) {
    bruteForcePoints.push('Uses basic arithmetic operations');
    bruteForcePoints.push('More readable but slower');

    optimizedPoints.push('Uses bit manipulation and bitwise operators');
    optimizedPoints.push('Works instantly at CPU level - maximum speed');
  }

  // Check for null safety
  if (optimizedCode.includes('== null') && !originalCode.includes('== null')) {
    bruteForcePoints.push('No safety checks - can crash with bad input');

    optimizedPoints.push('Includes null/boundary checks - handles edge cases safely');
  }

  // Check for code complexity
  const originalComplexity = originalCode.split('\n').length;
  const optimizedComplexity = optimizedCode.split('\n').length;

  if (optimizedComplexity < originalComplexity * 0.8) {
    bruteForcePoints.push('Repetitive code with duplicate logic');
    bruteForcePoints.push('Harder to understand and maintain');
    bruteForcePoints.push('More prone to bugs');

    optimizedPoints.push('Clean, concise implementation');
    optimizedPoints.push('Easy to understand and modify');
    optimizedPoints.push('Professional-grade code quality');
  }

  // Default analysis if patterns didn't match
  if (bruteForcePoints.length === 0) {
    bruteForcePoints.push('Original approach: straightforward implementation');
    bruteForcePoints.push('Processes data step by step sequentially');
    bruteForcePoints.push('Works correctly but takes longer for complex tasks');
    bruteForcePoints.push('Easy to understand for beginners');
    bruteForcePoints.push('Becomes inefficient with large datasets');

    optimizedPoints.push('Optimized approach: refined algorithm');
    optimizedPoints.push('Uses smart techniques to reduce operations');
    optimizedPoints.push('Significantly faster and more memory-efficient');
    optimizedPoints.push('Professional implementation patterns');
    optimizedPoints.push('Scales well with any dataset size');
  }

  return {
    bruteForceName: 'Brute Force (Original)',
    bruteForcePoints,
    optimizedName: 'Optimized Solution',
    optimizedPoints
  };
}
