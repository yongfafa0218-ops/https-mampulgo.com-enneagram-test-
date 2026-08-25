import React, { useEffect, useRef } from 'react';
import { ENNEAGRAM_DATA } from '@/lib/enneagramData';

interface ResultCardHTMLProps {
  scores: Record<number, number>;
  topType: number;
  health: number;
}

export const ResultCardHTML = React.forwardRef<HTMLDivElement, ResultCardHTMLProps>(
  ({ scores, topType }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      // 유형 정보 가져오기
      const typeInfoData = ENNEAGRAM_DATA.typeInfo as any;
      const colorThemesData = ENNEAGRAM_DATA.colorThemes as any;
      const typeInfo = typeInfoData[topType];
      const colorTheme = colorThemesData[topType];
      
      // 날개 유형 계산
      const tn = topType;
      const w1 = tn === 1 ? 9 : tn - 1;
      const w2 = tn === 9 ? 1 : tn + 1;
      const wingType = scores[w1] >= scores[w2] ? w1 : w2;
      
      // 최하점 유형 계산
      const sorted = Object.entries(scores)
        .map(([k, v]) => [parseInt(k), v] as [number, number])
        .sort((a, b) => b[1] - a[1]);
      const lowestType = sorted[sorted.length - 1][0];

      // 데이터 선택
      const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
      const pickN = (arr: any[], n: number) => {
        const copy = [...arr];
        const result = [];
        for (let i = 0; i < n && copy.length; i++) {
          result.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
        }
        return result;
      };

      const strengthsData = ENNEAGRAM_DATA.strengths as any;
      const cheersData = ENNEAGRAM_DATA.cheers as any;
      const challengesData = ENNEAGRAM_DATA.challenges as any;

      const strengths = pickN(strengthsData[topType], 2);
      strengths.push(pick(strengthsData[wingType]));
      const growthPoints = pickN(strengthsData[lowestType], 3);
      const cheer = pick(cheersData[topType]);
      const challenge = pick(challengesData[topType]);
      const disclaimer = pick(ENNEAGRAM_DATA.disclaimers);

      // 그래프 생성
      const gOrder = [8, 9, 1, 2, 3, 4, 5, 6, 7];
      const mx = Math.max(...Object.values(scores));
      const graphHTML = gOrder
        .map((t) => {
          const v = scores[t];
          const h = Math.max(8, Math.round((v / mx) * 80));
          let color = 'rgba(0,0,0,.12)';
          if (t === topType) color = colorTheme.hex;
          else if (t === wingType) color = colorTheme.hex + '88';
          else if (t === lowestType) color = colorTheme.hex + '55';
          
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end">
            <div style="width:55%;height:${h}px;min-height:8px;background:${color};border-radius:4px 4px 0 0"></div>
            <span style="font-weight:700;opacity:.6;color:${colorTheme.hex};font-size:clamp(7px,1.5vw,9px);margin-top:3px">${t}</span>
          </div>`;
        })
        .join('');

      const graphArea = `<div style="display:flex;align-items:flex-end;justify-content:space-around;gap:2%;height:90px;margin-bottom:6px;padding:0 4%">${graphHTML}</div>`;

      // 강점/성장 포인트 HTML
      const strHTML = strengths
        .map(
          (s) =>
            `<span style="color:${colorTheme.hex};border:1px solid ${colorTheme.hex}40;background:rgba(255,255,255,.25);font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;font-size:clamp(9px,2vw,11px)">${s}</span>`
        )
        .join('');

      const wkHTML = growthPoints
        .map(
          (w) =>
            `<span style="color:${colorTheme.hex};border:1px solid ${colorTheme.hex}30;background:rgba(0,0,0,.1);opacity:.7;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;font-size:clamp(9px,2vw,11px)">${w}</span>`
        )
        .join('');

      const traitsHTML = `<div style="display:flex;flex-direction:column;gap:5%">
        <div style="font-weight:800;letter-spacing:.5px;opacity:.5;text-transform:uppercase;font-size:clamp(8px,1.8vw,10px);color:${colorTheme.hex}">✨ 강점</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${strHTML}</div>
        <div style="font-weight:800;letter-spacing:.5px;opacity:.5;text-transform:uppercase;font-size:clamp(8px,1.8vw,10px);color:${colorTheme.hex}">🌱 성장 과제</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${wkHTML}</div>
      </div>`;

      const bottomHTML = `<div style="padding:4% 8% 5%">
        ${graphArea}
        <div style="font-weight:700;line-height:1.4;margin-bottom:3px;color:${colorTheme.hex};font-size:clamp(11px,2.4vw,13px)">🎯 오늘의 도전: ${challenge}</div>
        <div style="font-weight:600;opacity:.7;font-style:italic;margin-bottom:5px;color:${colorTheme.hex};font-size:clamp(9px,2vw,11px)">${cheer}</div>
        <div style="opacity:.4;text-align:center;line-height:1.4;color:${colorTheme.hex};font-size:clamp(7px,1.6vw,9px)">${disclaimer}</div>
      </div>`;

      // 카드 HTML 생성 (Centered 레이아웃)
      const cardHTML = `
        <div style="position:absolute;inset:0;z-index:0;background:${colorTheme.hex}"></div>
        <div style="position:relative;z-index:1;width:100%;height:100%;display:flex;flex-direction:column">
          <div style="display:flex;flex-direction:column;align-items:center;padding:5% 8% 2%;gap:3px;text-align:center">
            <div style="font-size:clamp(18px,4.5vw,24px);font-weight:900;line-height:1.3;margin:0;color:#FFFFFF">${typeInfo.name}</div>
            <div style="font-size:clamp(10px,2.2vw,13px);font-weight:600;opacity:.7;margin:3px 0 0;color:#FFFFFF">오늘도 당신의 귀한 사랑을 응원합니다!</div>
            <div style="display:flex;flex-direction:column;align-items:center">
              <div style="font-size:clamp(48px,12vw,62px);font-weight:900;line-height:.9;margin-top:3px;color:#FFFFFF">${topType}</div>
              <div style="font-size:clamp(12px,2.4vw,15px);font-weight:700;opacity:.6;margin-top:3px;color:#FFFFFF">${typeInfo.title}</div>
            </div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:2% 8% 0;gap:3%;overflow:hidden">
            <div style="flex:0 0 32%;width:100%;display:flex;justify-content:center;position:relative">
              <img style="display:block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.12));max-height:100%;width:65%;border-radius:12px" src="/mampulgo/characters/${String(topType).padStart(2, '0')}_${typeInfo.name.toLowerCase()}_01.png" alt=""/>
            </div>
            <div style="width:100%;text-align:center;align-items:center;display:flex;flex-direction:column;gap:4%;overflow:hidden">
              <div style="font-weight:700;line-height:1.5;opacity:.85;color:#FFFFFF;font-size:clamp(12px,2.6vw,14px)">${typeInfo.basicInterpretation.split('\n')[0]}</div>
              ${traitsHTML.replace(/gap:4px/g, 'gap:3px').replace('gap:5%', 'gap:4%').replace(/color:\${colorTheme.hex}/g, 'color:#FFFFFF')}
            </div>
          </div>
          ${bottomHTML.replace('padding:4% 8% 5%', 'padding:3% 8% 5%;text-align:center').replace(/color:\${colorTheme.hex}/g, 'color:#FFFFFF')}
        </div>
      `;

      containerRef.current.innerHTML = cardHTML;
    }, [scores, topType]);

    return (
      <div
        ref={ref}
        style={{
          width: '375px',
          height: '667px',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        />
      </div>
    );
  }
);

ResultCardHTML.displayName = 'ResultCardHTML';
