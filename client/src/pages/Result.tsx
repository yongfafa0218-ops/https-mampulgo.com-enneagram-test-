import { useState, useRef, useCallback } from 'react';
import { ENNEAGRAM_DATA, EnneagramType } from '@/lib/enneagramData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ResultCard } from '@/components/ResultCard';
import { getEnneagramBlogUrl } from '@/lib/blogUrls';

interface ResultPageProps {
  scores: Record<string, number>;
  topType: EnneagramType;
  health: number;
  gender: 'male' | 'female' | null;
  onRestart: () => void;
}

type ResultStep = 'graph' | 'interpretation' | 'growth' | 'challenge' | 'card';

export default function ResultPage({ scores, topType, health, gender, onRestart }: ResultPageProps) {
  const [currentStep, setCurrentStep] = useState<ResultStep>('graph');
  const [bias, setBias] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 점수 정렬
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const highestType = sorted[0][0] as EnneagramType;
  const secondType = sorted[1][0] as EnneagramType;
  const lowestType = sorted[sorted.length - 1][0] as EnneagramType;

  // 그래프 데이터
  const ORDER = ['8', '9', '1', '2', '3', '4', '5', '6', '7'] as EnneagramType[];
  const chartData = ORDER.map(type => ({
    type,
    score: scores[type] + (bias ? 10 : 0),
  }));

  // 이미지를 fetch로 가져와서 data URL로 변환 (CORS 우회)
  const toDataUrl = async (src: string): Promise<string> => {
    const resp = await fetch(src);
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // 카드 다운로드 - 화면에 보이는 ResultCard를 그대로 캡처
  const handleDownloadCard = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const targetEl = cardRef.current;
      if (!targetEl) {
        throw new Error('카드 요소를 찾을 수 없습니다.');
      }

      // 이미지를 data URL로 변환하여 CORS 우회
      const images = targetEl.querySelectorAll('img');
      const originalSrcs: string[] = [];
      await Promise.all(
        Array.from(images).map(async (img, i) => {
          if (!img.complete) {
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }
          originalSrcs[i] = img.src;
          try {
            const dataUrl = await toDataUrl(img.src);
            img.src = dataUrl;
          } catch (e) {
            console.warn('이미지 변환 실패:', e);
          }
        })
      );

      const { default: html2canvas } = await import('html2canvas');

      // 모바일 여부 확인 - 모바일에서는 scale 줄이기
      const isMobile = window.innerWidth < 768;
      const canvasScale = isMobile ? 1.5 : 3;

      // 현재 카드의 실제 크기를 가져옴
      const rect = targetEl.getBoundingClientRect();

      const canvas = await html2canvas(targetEl, {
        scale: canvasScale,
        useCORS: false,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        width: rect.width,
        height: rect.height,
        imageTimeout: 5000,
      });

      // 원래 src 복원
      Array.from(images).forEach((img, i) => {
        if (originalSrcs[i]) img.src = originalSrcs[i];
      });

      // 다운로드 - toDataURL 방식 (모바일 호환)
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `mampulgo-${highestType}-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error('카드 저장 실패:', error);
      alert('카드 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDownloading(false);
    }
  }, [highestType, isDownloading]);


  // 그래프 화면
  if (currentStep === 'graph') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900">3) 결과 그래프</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bias}
                  onChange={(e) => setBias(e.target.checked)}
                  className="rounded"
                />
                +10 보정
              </label>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              표시 순서: 8 → 9 → 1 → 2 → 3 → 4 → 5 → 6 → 7
            </p>

            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.type}
                        fill={entry.type === highestType ? '#0891B2' : '#6366F1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg mb-6">
              <span className="text-sm text-purple-700">컨디션 {health}/10</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onRestart}
                variant="outline"
                className="flex-1"
              >
                ◀ 처음부터
              </Button>
              <Button
                onClick={() => setCurrentStep('interpretation')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                해석 보기 →
              </Button>
            </div>


          </Card>
        </div>
      </div>
    );
  }

  // 해석 보기
  if (currentStep === 'interpretation') {
    const typeInfo = ENNEAGRAM_DATA.typeInfo[highestType];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {highestType}형 - {typeInfo.name}
            </h2>
            <p className="text-sm text-slate-500 mb-6">{typeInfo.definition}</p>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">기본 해석</h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {typeInfo.basicInterpretation}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('graph')}
                variant="outline"
                className="flex-1"
              >
                ◀ 그래프로
              </Button>
              <Button
                onClick={() => setCurrentStep('growth')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                성장 방향 →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 성장/스트레스 방향
  if (currentStep === 'growth') {
    const typeInfo = ENNEAGRAM_DATA.typeInfo[highestType];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">성장과 스트레스 방향</h2>

            <div className="space-y-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">↗️ 성장 방향: {typeInfo.growthType}형</h3>
                <p className="text-sm text-green-800">
                  스트레스를 받을 때 이 유형의 긍정적인 특성을 발휘하면 성장할 수 있습니다.
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">↘️ 스트레스 방향: {typeInfo.stressType}형</h3>
                <p className="text-sm text-orange-800">
                  스트레스를 받을 때 이 유형의 부정적인 특성이 나타날 수 있습니다.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">🪶 날개 유형: {typeInfo.wingType}형</h3>
                <p className="text-sm text-purple-800">
                  당신의 유형과 인접한 이 유형의 특성도 함께 나타날 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('interpretation')}
                variant="outline"
                className="flex-1"
              >
                ◀ 이전
              </Button>
              <Button
                onClick={() => setCurrentStep('challenge')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                도전 과제 →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 오늘의 도전
  if (currentStep === 'challenge') {
    const challenges = ENNEAGRAM_DATA.challenges[highestType];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">오늘의 도전</h2>

            <div className="space-y-4 mb-6">
              {challenges.map((challenge, i) => (
                <div key={i} className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-amber-900">🎯 {challenge}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setCurrentStep('growth')}
                variant="outline"
                className="flex-1"
              >
                ◀ 이전
              </Button>
              <Button
                onClick={() => setCurrentStep('card')}
                className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
              >
                결과 카드 →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 결과 카드
  if (currentStep === 'card') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">나만의 결과 카드</h2>

          {/* 카드 미리보기 - ref로 이 카드를 그대로 캡처 */}
          <div className="flex justify-center mb-8 overflow-auto">
            <ResultCard ref={cardRef} scores={scores} topType={highestType} health={health} gender={gender} />
          </div>

          {/* 다운로드 버튼 */}
          <div className="flex gap-3 mb-6 justify-center max-w-md mx-auto">
            <Button
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
            >
              {isDownloading ? '⏳ 저장 중...' : '📥 카드 다운로드'}
            </Button>
            <Button
             onClick={onRestart}
             variant="outline"
             className="flex-1"
           >
             🏠 처음으로
           </Button>
         </div>

          {/* 더 깊이 알아보기 버튼 */}
          <div className="mx-auto flex max-w-md justify-center">
            <a
              data-testid="deep-dive-button"
              href={getEnneagramBlogUrl(highestType)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 text-center font-semibold text-white shadow-md transition-all hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg"
            >
              📖 더 깊이 알아보기
            </a>
          </div>


       </div>
      </div>
    );
  }

  return null;
}
