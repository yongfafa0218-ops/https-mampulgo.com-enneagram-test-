import { forwardRef, useMemo } from 'react';
import { ENNEAGRAM_DATA, EnneagramType } from '@/lib/enneagramData';

interface ResultCardProps {
  scores: Record<string, number>;
  topType: EnneagramType;
  health: number;
  gender: 'male' | 'female' | null;
}

export const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ scores, topType, health, gender }, ref) => {
    // 최고점/차점/최하점 계산
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const highestType = sorted[0][0] as EnneagramType;
    const secondType = sorted[1][0] as EnneagramType;
    const lowestType = sorted[sorted.length - 1][0] as EnneagramType;

    // 메시지 선택 (useMemo로 마운트 시 1회만 결정)
    const randomIndices = useMemo(() => {
      return {
        highestStrength: Math.floor(Math.random() * 3),
        secondStrength: Math.floor(Math.random() * 3),
        lowestStrength: Math.floor(Math.random() * 3),
        cheer: Math.floor(Math.random() * 3),
        challenge: Math.floor(Math.random() * 3),
        disclaimer: Math.floor(Math.random() * ENNEAGRAM_DATA.disclaimers.length),
      };
    }, []);

    const highestStrengthMsg = ENNEAGRAM_DATA.strengths[highestType][randomIndices.highestStrength];
    const secondStrengthMsg = ENNEAGRAM_DATA.strengths[secondType][randomIndices.secondStrength];
    const lowestStrengthMsg = ENNEAGRAM_DATA.strengths[lowestType][randomIndices.lowestStrength];
    const cheerMsg = ENNEAGRAM_DATA.cheers[highestType][randomIndices.cheer];
    const challengeMsg = ENNEAGRAM_DATA.challenges[highestType][randomIndices.challenge];
    const disclaimerMsg = ENNEAGRAM_DATA.disclaimers[randomIndices.disclaimer];

    // 색상 테마
    const theme = ENNEAGRAM_DATA.colorThemes[highestType];
    const { bg, accent, light, dark } = theme;

    // 캐릭터 이미지 (마운트 시 1회만 결정)
    const charIndex = useMemo(() => Math.floor(Math.random() * 3), []);
    
    // GitHub/Netlify에 포함된 남녀별 로컬 이미지 사용
    const selectedGender = gender || 'male';
    const typeNames: Record<EnneagramType, string> = {
      '1': 'perfect',
      '2': 'helper',
      '3': 'achiever',
      '4': 'romantic',
      '5': 'investigator',
      '6': 'loyalist',
      '7': 'enthusiast',
      '8': 'challenger',
      '9': 'peacemaker',
    };
    const typeNum = String(highestType).padStart(2, '0');
    const typeName = typeNames[highestType];
    const typeImages = [1, 2, 3].map((number) =>
      `/mampulgo/characters/${typeNum}_${typeName}/${selectedGender}_${typeNum}_${typeName}_${String(number).padStart(2, '0')}.png`
    );
    const mainCharPath = typeImages[charIndex] || `/mampulgo/characters/${typeNum}_${typeName}/${selectedGender}_${typeNum}_${typeName}_01.png`;

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

    // 텍스트 길이 제한 (html2canvas 호환 - -webkit-box 대신 사용)
    const truncate = (text: string, maxLen: number) => {
      if (text.length <= maxLen) return text;
      return text.slice(0, maxLen - 1) + '…';
    };

    return (
      <div
        ref={ref}
        style={{
          width: '375px',
          height: '750px',
          backgroundColor: bg,
          color: '#1F2937',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px',
          margin: '0',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 배경 데코레이션 - 원형 요소들 */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '120px',
            height: '120px',
            backgroundColor: accent,
            borderRadius: '50%',
            opacity: 0.15,
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
            opacity: 0.1,
          }}
        />

        {/* 1. 상단 섹션: 절대 위치 기반 */}
        <div style={{ position: 'absolute', top: '40px', left: '18px', right: '18px', textAlign: 'center', zIndex: 1 }}>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 800,
              lineHeight: '1.4',
              color: dark,
            }}
          >
            {ENNEAGRAM_DATA.typeInfo[highestType].title}
          </div>
        </div>

        {/* 2. 숫자 (절대 위치) */}
        <div
          style={{
            position: 'absolute',
            top: '130px',
            left: '35px',
            fontSize: '130px',
            fontWeight: 900,
            lineHeight: '0.8',
            color: accent,
            zIndex: 10,
          }}
        >
          {highestType}
        </div>

        {/* 3. 유형명 (절대 위치 - 숫자 아래) */}
        <div
          style={{
            position: 'absolute',
            top: '280px',
            left: '35px',
            fontSize: '17px',
            fontWeight: 800,
            color: dark,
            lineHeight: '1.3',
            zIndex: 10,
          }}
        >
          {ENNEAGRAM_DATA.typeInfo[highestType].name}
        </div>

        {/* 4. 캐릭터 이미지 (절대 위치) - 길게 배치 */}
        <div
          style={{
            position: 'absolute',
            top: '140px',
            right: '20px',
            width: '220px',
            height: '320px',
            zIndex: 1,
          }}
        >
          <img
            src={mainCharPath}
            alt="character"
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* 5. 강점 섹션 */}
        <div style={{ marginTop: '380px', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: accent }}>
            ✨ 강점
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4', color: dark, marginBottom: '4px' }}>
            {truncate(highestStrengthMsg, 40)}
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4', color: dark }}>
            {truncate(secondStrengthMsg, 40)}
          </div>
        </div>

        {/* 4. 의식적 훈련 섹션 */}
        <div style={{ marginBottom: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: accent }}>
            🌱 의식적 훈련
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4', color: dark }}>
            {truncate(lowestStrengthMsg, 40)}
          </div>
        </div>

        {/* 5. 응원 섹션 */}
        <div
          style={{
            backgroundColor: light,
            padding: '8px 10px',
            borderRadius: '8px',
            marginBottom: '8px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '3px', color: accent }}>
            💜 응원
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.3', color: dark }}>
            {truncate(cheerMsg, 50)}
          </div>
        </div>

        {/* 6. 오늘의 도전 섹션 */}
        <div
          style={{
            backgroundColor: light,
            padding: '8px 10px',
            borderRadius: '8px',
            marginBottom: '10px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '3px', color: accent }}>
            🎯 오늘의 도전
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.3', color: dark }}>
            {truncate(challengeMsg, 50)}
          </div>
        </div>

        {/* 7. 그래프 */}
        <div style={{ marginBottom: '8px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '40px' }}>
            {['8', '9', '1', '2', '3', '4', '5', '6', '7'].map(type => {
              let barColor = '#CCCCCC'; // 기본: 밝은 회색
              if (type === highestType) {
                barColor = accent; // 최고점: accent 색
              } else if (type === secondType) {
                barColor = '#CCAA66'; // 차점: 갈색
              } else if (type === lowestType) {
                barColor = '#9B59B6'; // 최하점: 자주색
              }
              return (
                <div
                  key={type}
                  style={{
                    flex: 1,
                    backgroundColor: barColor,
                    height: `${normalizedScores[type as EnneagramType]}%`,
                    borderRadius: '2px',
                    minHeight: '4px',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
            {['8', '9', '1', '2', '3', '4', '5', '6', '7'].map(type => (
              <div key={type} style={{ flex: 1, textAlign: 'center', fontSize: '8px', color: '#666' }}>
                {type}
              </div>
            ))}
          </div>
        </div>

        {/* 8. 주의사항 */}
        <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.3', position: 'relative', zIndex: 1, marginTop: '20px' }}>
          ⭐ {disclaimerMsg}
        </div>
      </div>
    );
  }
);

ResultCard.displayName = 'ResultCard';
