import { ENNEAGRAM_DATA, EnneagramType } from '@/lib/enneagramData';

interface ResultCardSVGProps {
  scores: Record<string, number>;
  topType: EnneagramType;
  health: number;
}

export function ResultCardSVG({ scores, topType, health }: ResultCardSVGProps) {
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

  // 색상 테마
  const theme = ENNEAGRAM_DATA.colorThemes[highestType];
  const { bg, accent, light, dark } = theme;

  // 유형별 색상 (차트용)
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

  // 최대 점수로 정규화 (0-100)
  const maxScore = Math.max(...Object.values(scores));
  const normalizedScores = Object.entries(scores).reduce((acc, [type, score]) => {
    acc[type] = (score / maxScore) * 100;
    return acc;
  }, {} as Record<string, number>);

  // SVG 생성
  const width = 375;
  const height = 667;
  const padding = 20;
  const charSize = 170;
  const chartHeight = 45;

  // 차트 바 높이 계산
  const chartBars = ['8', '9', '1', '2', '3', '4', '5', '6', '7'].map((type) => {
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
    return { type, barColor, barOpacity, barHeight };
  });

  const chartWidth = width - padding * 2;
  const barWidth = chartWidth / 9 - 1.5;
  const chartStartX = padding;
  const chartStartY = height - padding - 80;

  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      {/* 배경 */}
      <rect width={width} height={height} fill={bg} />

      {/* 배경 데코레이션 (원형) */}
      <circle cx={width * 0.8} cy={height * 0.15} r={80} fill={accent} opacity="0.15" />
      <circle cx={width * 0.2} cy={height * 0.7} r={60} fill={accent} opacity="0.1" />

      {/* 제목 섹션 */}
      <text x={width / 2} y={padding + 30} fontSize="56" fontWeight="bold" fill={accent} textAnchor="middle">
        {highestType}
      </text>
      <text x={width / 2} y={padding + 55} fontSize="18" fontWeight="600" fill={dark} textAnchor="middle">
        {ENNEAGRAM_DATA.typeInfo[highestType].name}
      </text>

      {/* 구분선 */}
      <line x1={padding} y1={padding + 75} x2={width - padding} y2={padding + 75} stroke={light} strokeWidth="1" />

      {/* 강점 섹션 */}
      <text x={padding} y={padding + 110} fontSize="10" fontWeight="600" fill={accent}>
        ✨ 강점
      </text>
      <text x={padding} y={padding + 130} fontSize="11" fill={dark} fontFamily="Pretendard, sans-serif">
        {highestStrengthMsg}
      </text>
      <text x={padding} y={padding + 150} fontSize="11" fill={dark} fontFamily="Pretendard, sans-serif">
        {secondStrengthMsg}
      </text>

      {/* 성장 과제 섹션 */}
      <text x={padding} y={padding + 175} fontSize="10" fontWeight="600" fill={accent}>
        🌱 성장 과제
      </text>
      <text x={padding} y={padding + 195} fontSize="11" fill={dark} fontFamily="Pretendard, sans-serif">
        {lowestStrengthMsg}
      </text>

      {/* 응원 메시지 */}
      <rect x={padding} y={padding + 210} width={width - padding * 2} height="35" fill={light} rx="4" />
      <text x={width / 2} y={padding + 232} fontSize="10" fill={dark} textAnchor="middle" fontFamily="Pretendard, sans-serif">
        💌 {cheerMsg}
      </text>

      {/* 오늘의 도전 */}
      <text x={padding} y={padding + 270} fontSize="10" fontWeight="600" fill={accent}>
        🎯 오늘의 도전
      </text>
      <text x={padding} y={padding + 290} fontSize="10" fill={dark} fontFamily="Pretendard, sans-serif">
        {challengeMsg.substring(0, 40)}
      </text>
      <text x={padding} y={padding + 305} fontSize="10" fill={dark} fontFamily="Pretendard, sans-serif">
        {challengeMsg.substring(40)}
      </text>

      {/* 차트 */}
      <g>
        {chartBars.map((bar, idx) => {
          const x = chartStartX + idx * (barWidth + 1.5);
          const y = chartStartY - bar.barHeight * 2;
          return (
            <g key={bar.type}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={bar.barHeight * 2}
                fill={bar.barColor}
                opacity={bar.barOpacity}
                rx="2"
              />
            </g>
          );
        })}
      </g>

      {/* 번호 */}
      {['8', '9', '1', '2', '3', '4', '5', '6', '7'].map((num, idx) => (
        <text
          key={num}
          x={chartStartX + idx * (barWidth + 1.5) + barWidth / 2}
          y={chartStartY + 20}
          fontSize="8"
          fontWeight="600"
          fill="#6B7280"
          opacity="0.7"
          textAnchor="middle"
        >
          {num}
        </text>
      ))}

      {/* 주의사항 */}
      <text x={padding} y={height - padding - 15} fontSize="8" fill={dark} opacity="0.85" fontFamily="Pretendard, sans-serif">
        {disclaimerMsg.substring(0, 50)}
      </text>
      <text x={padding} y={height - padding} fontSize="8" fill={dark} opacity="0.85" fontFamily="Pretendard, sans-serif">
        {disclaimerMsg.substring(50)}
      </text>
    </svg>
  );
}

// SVG를 PNG로 변환하는 함수
export async function downloadCardAsPNG(svg: SVGSVGElement, filename: string) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 375 * 2; // 2배 해상도
  canvas.height = 667 * 2;

  const svgString = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
}
