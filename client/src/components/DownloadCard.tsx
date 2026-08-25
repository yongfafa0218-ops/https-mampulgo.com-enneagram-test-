/**
 * DownloadCard - html2canvas 다운로드 전용 카드 컴포넌트
 * 
 * 핵심 원칙:
 * 1. 고정 크기 375x667px (스케일링 없음)
 * 2. 모든 스타일 완전한 인라인 스타일 (CSS 변수 의존 제거)
 * 3. -webkit-box, clamp() 등 html2canvas 비호환 CSS 사용하지 않음
 * 4. position:absolute 기반 레이아웃으로 겹침 방지
 * 5. 폰트 크기 모두 고정 px 값
 */
import { forwardRef, useMemo } from 'react';
import { ENNEAGRAM_DATA, EnneagramType } from '@/lib/enneagramData';

interface DownloadCardProps {
  scores: Record<string, number>;
  topType: EnneagramType;
  health: number;
}

export const DownloadCard = forwardRef<HTMLDivElement, DownloadCardProps>(
  ({ scores, topType, health }, ref) => {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const highestType = sorted[0][0] as EnneagramType;
    const secondType = sorted[1][0] as EnneagramType;
    const lowestType = sorted[sorted.length - 1][0] as EnneagramType;

    const randomIndices = useMemo(() => ({
      highestStrength: Math.floor(Math.random() * 3),
      secondStrength: Math.floor(Math.random() * 3),
      lowestStrength: Math.floor(Math.random() * 3),
      cheer: Math.floor(Math.random() * 3),
      challenge: Math.floor(Math.random() * 3),
      disclaimer: Math.floor(Math.random() * ENNEAGRAM_DATA.disclaimers.length),
    }), []);

    const highestStrengthMsg = ENNEAGRAM_DATA.strengths[highestType][randomIndices.highestStrength];
    const secondStrengthMsg = ENNEAGRAM_DATA.strengths[secondType][randomIndices.secondStrength];
    const lowestStrengthMsg = ENNEAGRAM_DATA.strengths[lowestType][randomIndices.lowestStrength];
    const cheerMsg = ENNEAGRAM_DATA.cheers[highestType][randomIndices.cheer];
    const challengeMsg = ENNEAGRAM_DATA.challenges[highestType][randomIndices.challenge];
    const disclaimerMsg = ENNEAGRAM_DATA.disclaimers[randomIndices.disclaimer];

    const theme = ENNEAGRAM_DATA.colorThemes[highestType];
    const { bg, accent, light, dark } = theme;

    const charIndex = useMemo(() => Math.floor(Math.random() * 3), []);
    const typeNum = String(highestType).padStart(2, '0');
    const typeMap: Record<string, string> = {
      '1': 'perfect', '2': 'helper', '3': 'achiever', '4': 'romantic', '5': 'investigator',
      '6': 'loyalist', '7': 'enthusiast', '8': 'challenger', '9': 'peacemaker'
    };
    const typeName = typeMap[highestType];
    const charNum = String(charIndex + 1).padStart(2, '0');
    const mainCharPath = `/mampulgo/characters/${typeNum}_${typeName}/${typeNum}_${typeName}_${charNum}.png`;

    // 유형별 색상 (차트용)
    const typeColors: Record<string, string> = {
      '1': '#C41E3A', '2': '#E75480', '3': '#FF6B6B', '4': '#7C3AED',
      '5': '#0891B2', '6': '#D97706', '7': '#16A34A', '8': '#EA580C', '9': '#059669',
    };

    const maxScore = Math.max(...Object.values(scores));
    const normalizedScores = Object.entries(scores).reduce((acc, [type, score]) => {
      acc[type] = (score / maxScore) * 100;
      return acc;
    }, {} as Record<string, number>);

    // 텍스트 길이 제한 함수
    const truncate = (text: string, maxLen: number) => {
      if (text.length <= maxLen) return text;
      return text.slice(0, maxLen - 1) + '…';
    };

    return (
      <div
        ref={ref}
        style={{
          width: '375px',
          height: '667px',
          backgroundColor: bg,
          color: '#1F2937',
          fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px',
          margin: '0',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* 배경 데코레이션 */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '120px',
            height: '120px',
            backgroundColor: accent,
            borderRadius: '50%',
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '140px',
            height: '140px',
            backgroundColor: accent,
            borderRadius: '50%',
            opacity: 0.08,
          }}
        />

        {/* 1. 상단: 유형명 + 제목 */}
        <div style={{ textAlign: 'center', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7, marginBottom: '5px', letterSpacing: '0.5px' }}>
            {ENNEAGRAM_DATA.typeInfo[highestType].title}
          </div>
          <div
            style={{
              fontSize: '50px',
              fontWeight: 900,
              lineHeight: '1',
              margin: '2px 0',
              color: dark,
              textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
            }}
          >
            {highestType}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: accent, marginTop: '2px', letterSpacing: '0.3px' }}>
            {ENNEAGRAM_DATA.typeInfo[highestType].name}
          </div>
        </div>

        {/* 2. 캐릭터 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '170px',
            margin: '6px 0 10px 0',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <img
            src={mainCharPath}
            alt="character"
            style={{ height: '100%', objectFit: 'contain' }}
            crossOrigin="anonymous"
          />
        </div>

        {/* 3. 구분선 */}
        <div
          style={{
            height: '1.5px',
            background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`,
            margin: '8px 0',
          }}
        />

        {/* 4. 강점 */}
        <div style={{ marginBottom: '9px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: accent, opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
            ✨ 강점
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: dark, lineHeight: '1.4', marginBottom: '5px' }}>
            {truncate(highestStrengthMsg, 40)}
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: dark, lineHeight: '1.4' }}>
            {truncate(secondStrengthMsg, 40)}
          </div>
        </div>

        {/* 5. 성장 과제 */}
        <div style={{ marginBottom: '9px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: accent, opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
            ⚠️ 성장 과제
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: dark, lineHeight: '1.4' }}>
            {truncate(lowestStrengthMsg, 40)}
          </div>
        </div>

        {/* 6. 응원 메시지 */}
        <div
          style={{
            backgroundColor: light,
            padding: '7px 9px',
            borderRadius: '6px',
            marginBottom: '7px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: accent, marginBottom: '2.5px' }}>
            💌 응원
          </div>
          <div style={{ fontSize: '10.5px', fontWeight: 500, color: dark, lineHeight: '1.3' }}>
            {truncate(cheerMsg, 50)}
          </div>
        </div>

        {/* 7. 도전 과제 */}
        <div
          style={{
            backgroundColor: light,
            padding: '6px 9px',
            borderRadius: '6px',
            marginBottom: '4px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '9px', fontWeight: 700, color: accent, marginBottom: '2px' }}>
            🎯 오늘의 도전
          </div>
          <div style={{ fontSize: '10px', fontWeight: 500, color: dark, lineHeight: '1.3', overflow: 'hidden', maxHeight: '27px' }}>
            {truncate(challengeMsg, 45)}
          </div>
        </div>

        {/* 8. 미니 점수 차트 */}
        <div style={{ marginBottom: '3px', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '45px',
              gap: '1.5px',
              marginBottom: '3px',
            }}
          >
            {(['8', '9', '1', '2', '3', '4', '5', '6', '7'] as EnneagramType[]).map((type) => {
              const isHighest = type === highestType;
              const isSecond = type === secondType;
              const isLowest = type === lowestType;

              let barColor = '#9CA3AF';
              let barOpacity = 0.5;

              if (isHighest) { barColor = typeColors[type]; barOpacity = 1; }
              else if (isSecond) { barColor = typeColors[type]; barOpacity = 0.8; }
              else if (isLowest) { barColor = typeColors[type]; barOpacity = 0.6; }

              const barHeight = Math.max(8, normalizedScores[type] * 0.35);

              return (
                <div
                  key={type}
                  style={{
                    flex: '1',
                    height: `${barHeight}px`,
                    backgroundColor: barColor,
                    borderRadius: '2px',
                    opacity: barOpacity,
                    border: isHighest ? `1.5px solid ${barColor}` : 'none',
                  }}
                />
              );
            })}
          </div>

          {/* 번호 */}
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1.5px' }}>
            {(['8', '9', '1', '2', '3', '4', '5', '6', '7'] as EnneagramType[]).map((type) => (
              <div
                key={type}
                style={{
                  flex: '1',
                  textAlign: 'center',
                  fontSize: '7.5px',
                  fontWeight: 600,
                  color: '#6B7280',
                  opacity: 0.7,
                }}
              >
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* 9. 주의사항 */}
        <div
          style={{
            fontSize: '8px',
            fontWeight: 500,
            opacity: 0.8,
            lineHeight: '1.3',
            borderTop: `1px solid ${accent}30`,
            paddingTop: '4px',
            marginTop: 'auto',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
            maxHeight: '22px',
          }}
        >
          ✨ {truncate(disclaimerMsg, 60)}
        </div>
      </div>
    );
  }
);

DownloadCard.displayName = 'DownloadCard';
