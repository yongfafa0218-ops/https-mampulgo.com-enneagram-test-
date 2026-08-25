import { ENNEAGRAM_DATA, EnneagramType } from './enneagramData';

export async function downloadCardAsImage(
  scores: Record<string, number>,
  topType: EnneagramType,
  health: number,
  filename: string
) {
  const width = 375;
  const height = 667;
  const padding = 20;

  // Canvas 생성
  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // 2배 해상도
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(2, 2);

  // 색상 테마
  const theme = ENNEAGRAM_DATA.colorThemes[topType];
  const { bg, accent, light, dark } = theme;

  // 배경
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // 배경 데코레이션 (원형)
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(width * 0.8, height * 0.15, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.arc(width * 0.2, height * 0.7, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // 제목
  ctx.fillStyle = accent;
  ctx.font = 'bold 56px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(topType, width / 2, padding + 40);

  ctx.fillStyle = dark;
  ctx.font = '600 18px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(ENNEAGRAM_DATA.typeInfo[topType].name, width / 2, padding + 65);

  // 구분선
  ctx.strokeStyle = light;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding + 75);
  ctx.lineTo(width - padding, padding + 75);
  ctx.stroke();

  // 최고점/차점/최하점 계산
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const highestType = sorted[0][0] as EnneagramType;
  const secondType = sorted[1][0] as EnneagramType;
  const lowestType = sorted[sorted.length - 1][0] as EnneagramType;

  // 메시지 선택
  const randomIndices = {
    highestStrength: Math.floor(Math.random() * 3),
    secondStrength: Math.floor(Math.random() * 3),
    lowestStrength: Math.floor(Math.random() * 3),
    cheer: Math.floor(Math.random() * 3),
    challenge: Math.floor(Math.random() * 3),
    disclaimer: Math.floor(Math.random() * ENNEAGRAM_DATA.disclaimers.length),
  };

  const highestStrengthMsg = ENNEAGRAM_DATA.strengths[highestType][randomIndices.highestStrength];
  const secondStrengthMsg = ENNEAGRAM_DATA.strengths[secondType][randomIndices.secondStrength];
  const lowestStrengthMsg = ENNEAGRAM_DATA.strengths[lowestType][randomIndices.lowestStrength];
  const cheerMsg = ENNEAGRAM_DATA.cheers[highestType][randomIndices.cheer];
  const challengeMsg = ENNEAGRAM_DATA.challenges[highestType][randomIndices.challenge];
  const disclaimerMsg = ENNEAGRAM_DATA.disclaimers[randomIndices.disclaimer];

  // 텍스트 렌더링 함수
  const drawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, fontSize: string) => {
    ctx.font = `${fontSize} Pretendard, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = dark;
    ctx.textAlign = 'left';

    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, currentY);
    }
    return currentY;
  };

  // 강점 섹션
  ctx.fillStyle = accent;
  ctx.font = '600 10px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('✨ 강점', padding, padding + 110);

  ctx.fillStyle = dark;
  ctx.font = '11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(highestStrengthMsg, padding, padding + 130);
  ctx.fillText(secondStrengthMsg, padding, padding + 150);

  // 성장 과제 섹션
  ctx.fillStyle = accent;
  ctx.font = '600 10px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('🌱 성장 과제', padding, padding + 175);

  ctx.fillStyle = dark;
  ctx.font = '11px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(lowestStrengthMsg, padding, padding + 195);

  // 응원 메시지 박스
  ctx.fillStyle = light;
  ctx.fillRect(padding, padding + 210, width - padding * 2, 35);

  ctx.fillStyle = dark;
  ctx.font = '10px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💌 ' + cheerMsg, width / 2, padding + 232);

  // 오늘의 도전
  ctx.fillStyle = accent;
  ctx.font = '600 10px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🎯 오늘의 도전', padding, padding + 270);

  ctx.fillStyle = dark;
  ctx.font = '10px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  const challengeLines = challengeMsg.match(/.{1,40}/g) || [];
  challengeLines.slice(0, 2).forEach((line, idx) => {
    ctx.fillText(line, padding, padding + 290 + idx * 15);
  });

  // 차트
  const typeColors: Record<string, string> = {
    '1': '#C41E3A',
    '2': '#E75480',
    '3': '#FF6B6B',
    '4': '#7C3AED',
    '5': '#0891B2',
    '6': '#D97706',
    '7': '#16A34A',
    '8': '#EA580C',
    '9': '#059669',
  };

  const maxScore = Math.max(...Object.values(scores));
  const normalizedScores = Object.entries(scores).reduce((acc, [type, score]) => {
    acc[type] = (score / maxScore) * 100;
    return acc;
  }, {} as Record<string, number>);

  const chartStartY = height - padding - 80;
  const barWidth = (width - padding * 2) / 9 - 1.5;

  ['8', '9', '1', '2', '3', '4', '5', '6', '7'].forEach((type, idx) => {
    const isHighest = type === highestType;
    const isSecond = type === secondType;
    const isLowest = type === lowestType;

    let barColor = '#9CA3AF';
    let barOpacity = 0.5;

    if (isHighest) {
      barColor = typeColors[type];
      barOpacity = 1;
    } else if (isSecond) {
      barColor = typeColors[type];
      barOpacity = 0.8;
    } else if (isLowest) {
      barColor = typeColors[type];
      barOpacity = 0.6;
    }

    const barHeight = Math.max(8, normalizedScores[type] * 0.35);
    const x = padding + idx * (barWidth + 1.5);
    const y = chartStartY - barHeight * 2;

    ctx.fillStyle = barColor;
    ctx.globalAlpha = barOpacity;
    ctx.fillRect(x, y, barWidth, barHeight * 2);
    ctx.globalAlpha = 1;
  });

  // 번호
  ctx.fillStyle = '#6B7280';
  ctx.globalAlpha = 0.7;
  ctx.font = '600 8px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ['8', '9', '1', '2', '3', '4', '5', '6', '7'].forEach((num, idx) => {
    const x = padding + idx * (barWidth + 1.5) + barWidth / 2;
    ctx.fillText(num, x, chartStartY + 20);
  });
  ctx.globalAlpha = 1;

  // 주의사항
  ctx.fillStyle = dark;
  ctx.globalAlpha = 0.85;
  ctx.font = '8px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'left';
  const disclaimerLines = disclaimerMsg.match(/.{1,50}/g) || [];
  disclaimerLines.slice(0, 2).forEach((line, idx) => {
    ctx.fillText(line, padding, height - padding - 15 + idx * 12);
  });
  ctx.globalAlpha = 1;

  // PNG로 다운로드
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
