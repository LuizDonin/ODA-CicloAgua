//drag and drop comparison
export const isCorrectDrop = (zoneId, itemTargetId) =>
  !!zoneId && !!itemTargetId && zoneId === itemTargetId;

//drops correct draggable in correct zone
export const computeSnapY = (zone, itemHeight, padding = 32) => {
  if (!zone) return 0;
  const zh = zone.height || 0;
  if (zh && itemHeight) {
    const topY = zone.y - zh / 2;
    return topY + itemHeight / 2 + padding;
  }
  return zone.y - 24;
};

export const nextScore = (score, wasCorrect) => score + (wasCorrect ? 1 : 0);

export const isDragComplete = (correct, total) => correct >= total;


// shuffle quiz answers if marked true on configs (info based on Json)
export const shuffleIfNeeded = (arr, doShuffle) => {
  const a = arr.slice();
  if (!doShuffle) return a;
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// evaluate chosen answer
export const evaluateAnswer = (isCorrectFlag) => {
  const isCorrect = !!isCorrectFlag;
  return { isCorrect, delta: isCorrect ? 1 : 0 };
};
