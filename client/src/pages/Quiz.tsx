import { useState, useEffect, useRef } from 'react';
import { ENNEAGRAM_DATA, EnneagramType } from '@/lib/enneagramData';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ResultPage from './Result';

type QuizStep = 'start' | 'gender' | 'condition' | 'quiz' | 'result';

type Gender = 'male' | 'female';

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState<QuizStep>('start');
  const [gender, setGender] = useState<Gender | null>(null);
  const [health, setHealth] = useState(7);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [topType, setTopType] = useState<EnneagramType | null>(null);

  // 문항 셔플 - 마운트 시 한 번만
  useEffect(() => {
    const shuffled = [...ENNEAGRAM_DATA.questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);

  }, []);

  const currentQuestion = questions[currentQuestionIndex] || null;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const progress = questions.length > 0 ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (value: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNextQuestion = () => {
    if (!currentAnswer) {
      alert('답변을 선택해 주세요.');
      return;
    }

    if (isLastQuestion) {
      // 모든 문항 완료 - 점수 계산
      const newScores: Record<string, number> = {
        '1': 0, '2': 0, '3': 0, '4': 0, '5': 0,
        '6': 0, '7': 0, '8': 0, '9': 0
      };

      Object.entries(answers).forEach(([questionId, selectedValue]) => {
        const question = ENNEAGRAM_DATA.questions.find(q => q.id === parseInt(questionId));
        if (question) {
          newScores[question.type] += selectedValue;
        }
      });

      setScores(newScores);

      // 최고점 유형 찾기
      const sorted = Object.entries(newScores).sort((a, b) => b[1] - a[1]);
      const topTypeResult = sorted[0][0] as EnneagramType;
      setTopType(topTypeResult);
      setCurrentStep('result');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    window.history.replaceState({}, document.title, window.location.pathname);
    setCurrentStep('start');
    setHealth(7);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScores(null);
    setTopType(null);
    const shuffled = [...ENNEAGRAM_DATA.questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  };

  // 결과 페이지
  if (currentStep === 'result' && scores && topType) {
    return <ResultPage scores={scores} topType={topType} health={health} gender={gender} onRestart={handleRestart} />
  }

  // 시작 화면
  if (currentStep === 'start') {
    return (
      <div className="min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-start sm:items-center justify-center px-4 py-6 sm:p-8">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center shadow-lg">
          <div className="mb-6">
            <img src="/mampulgo/characters/로고3.png" alt="맘풀고" className="w-48 h-48 mx-auto mb-4" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">안녕하세요!</h1>
          <p className="text-slate-700 mb-8 leading-relaxed">
            컨디션을 체크하고, 45개 문항에 답한 뒤 그래프와 카드를 받아보세요.
          </p>
          <Button
            onClick={() => setCurrentStep('gender')}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            시작하기 ▶
          </Button>


        </Card>
      </div>
    );
  }

  // 성별 선택
  if (currentStep === 'gender') {
    return (
      <div className="min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-start sm:items-center justify-center px-4 py-6 sm:p-8">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">성별을 선택하세요</h2>
          <p className="text-sm text-slate-600 mb-8">결과 카드의 캐릭터 성별을 선택해주세요.</p>

          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => {
                setGender('male');
                setCurrentStep('condition');
              }}
              className="flex-1 h-16 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              👨 남자
            </Button>
            <Button
              onClick={() => {
                setGender('female');
                setCurrentStep('condition');
              }}
              className="flex-1 h-16 text-lg font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
            >
              👩 여자
            </Button>
          </div>

          <Button
            onClick={() => setCurrentStep('start')}
            variant="outline"
            className="w-full"
          >
            ◀ 이전
          </Button>
        </Card>
      </div>
    );
  }

  // 컨디션 체크
  if (currentStep === 'condition') {
    const healthMessages = [
      '스트레스 영향이 강할 수 있습니다. 충분한 휴식이 필요합니다.',
      '균형이 필요한 상태입니다.',
      '현재 안정적 상태로 성장 방향이 잘 드러납니다.',
    ];
    const healthMsg = healthMessages[health <= 3 ? 0 : health <= 6 ? 1 : 2];

    return (
      <div className="min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-start sm:items-center justify-center px-4 py-6 sm:p-8">
        <Card className="w-full max-w-lg p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">2) 건강 상태 체크</h2>
          <p className="text-sm text-slate-600 mb-6">신체·정서·마음 상태를 포함한 오늘의 컨디션을 선택하세요.</p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Slider
                value={[health]}
                onValueChange={(val) => setHealth(val[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <div className="ml-4 text-3xl font-bold text-blue-500 min-w-12 text-center">{health}</div>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 (나쁨)</span>
              <span>10 (좋음)</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-6 p-3 bg-blue-50 rounded-lg">{healthMsg}</p>

          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentStep('gender')}
              variant="outline"
              className="flex-1"
            >
              ◀ 이전
            </Button>
            <Button
              onClick={() => setCurrentStep('quiz')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              다음 →
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 문항 응답
  if (currentStep === 'quiz' && currentQuestion) {
    return (
      <div className="min-h-[100dvh] overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-start sm:items-center justify-center px-4 py-6 sm:p-8">
        <Card className="w-full max-w-4xl p-6 sm:p-8 shadow-lg">
          {/* 진행률 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-sm text-slate-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 문항 */}
          <h3 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h3>

          {/* 선택지 */}
          <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-8">
            {[1, 2, 3, 4, 5].map(value => {
              const labels: Record<number, string> = {
                1: '전혀\n그렇지 않다',
                2: '그렇지\n않다',
                3: '보통이다',
                4: '그렇다',
                5: '매우\n그렇다'
              };
              return (
                <div key={value} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleAnswerSelect(value)}
                    className={`w-full p-3 rounded-lg font-semibold transition-all ${
                      currentAnswer === value
                        ? 'bg-blue-500 text-white scale-105'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {value}
                  </button>
                  <div className="text-xs text-slate-600 text-center leading-tight whitespace-pre-line">
                    {labels[value]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 네비게이션 */}
          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              variant="outline"
              disabled={currentQuestionIndex === 0}
              className="flex-1"
            >
              ◀ 이전
            </Button>
            <Button
              onClick={handleNextQuestion}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isLastQuestion ? '완료 ✓' : '다음 →'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
