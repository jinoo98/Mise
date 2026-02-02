import { useState, useMemo } from 'react';
import { Calculator, Search, Flame, Utensils, ShoppingCart, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Separator } from '@/app/components/ui/separator';

interface Ingredient {
  name: string;
  amount: string;
  price: number;
}

interface PresetRecipe {
  name: string;
  ingredients: Ingredient[];
  baseServings: number;
}

const presetRecipes: PresetRecipe[] = [
  {
    name: '김치찌개',
    baseServings: 2,
    ingredients: [
      { name: '묵은지', amount: '1/4포기', price: 3000 },
      { name: '돼지고기', amount: '200g', price: 4000 },
      { name: '두부', amount: '1/2모', price: 1500 },
      { name: '대파', amount: '1대', price: 500 },
      { name: '양파', amount: '1/2개', price: 300 },
    ],
  },
  {
    name: '간장계란밥',
    baseServings: 1,
    ingredients: [
      { name: '밥', amount: '1공기', price: 500 },
      { name: '계란', amount: '2개', price: 600 },
      { name: '간장', amount: '2큰술', price: 200 },
      { name: '참기름', amount: '1큰술', price: 400 },
      { name: '김', amount: '적당량', price: 800 },
    ],
  },
  {
    name: '크림 파스타',
    baseServings: 2,
    ingredients: [
      { name: '스파게티 면', amount: '200g', price: 2000 },
      { name: '베이컨', amount: '100g', price: 3000 },
      { name: '생크림', amount: '200ml', price: 2500 },
      { name: '파마산 치즈', amount: '50g', price: 3500 },
      { name: '마늘', amount: '3쪽', price: 300 },
    ],
  },
  {
    name: '된장찌개',
    baseServings: 3,
    ingredients: [
      { name: '된장', amount: '2큰술', price: 1000 },
      { name: '애호박', amount: '1/2개', price: 1200 },
      { name: '두부', amount: '1모', price: 3000 },
      { name: '감자', amount: '1개', price: 800 },
    ],
  },
];

export function RecipePricing() {
  const [selectedRecipe, setSelectedRecipe] = useState<PresetRecipe | null>(null);
  const [targetServings, setTargetServings] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [excludedItems, setExcludedItems] = useState<Record<string, boolean>>({});
  const [purchasedItems, setPurchasedItems] = useState<Record<string, boolean>>({});

  const filteredRecipes = useMemo(() => {
    return presetRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectRecipe = (recipe: PresetRecipe) => {
    setSelectedRecipe(recipe);
    setSearchQuery(recipe.name);
    setIsSearchFocused(false);
    setExcludedItems({});
    setPurchasedItems({});
  };

  const ratio = selectedRecipe && selectedRecipe.baseServings > 0
    ? targetServings / selectedRecipe.baseServings
    : 1;

  const totalCost = useMemo(() => {
    if (!selectedRecipe) return 0;
    const buyingCost = selectedRecipe.ingredients.reduce((sum, ing) => {
      if (excludedItems[ing.name]) return sum;
      return sum + ing.price;
    }, 0);
    return Math.round(buyingCost * ratio);
  }, [selectedRecipe, excludedItems, ratio]);

  const costPerServing = targetServings > 0 ? Math.round(totalCost / targetServings) : 0;

  const toggleExclude = (name: string) => {
    setExcludedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const togglePurchase = (name: string) => {
    setPurchasedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // 수량 계산 로직 (중첩 표기 오류 해결 및 수량 정규화)
  const calculateAmount = (amountStr: string) => {
    // 1. 숫자/분수 부분만 정확히 찾아내기 위한 정규식
    const numMatch = amountStr.match(/(\d+\/\d+)|(\d+(\.\d+)?)/);
    if (!numMatch) return amountStr;

    const originalValueStr = numMatch[0]; // 원래 문자열 속의 숫자 부분 (ex: "1/2")
    let value: number;

    // 2. 값 수치화
    if (originalValueStr.includes('/')) {
      const [num, den] = originalValueStr.split('/').map(Number);
      value = num / den;
    } else {
      value = parseFloat(originalValueStr);
    }

    // 3. 인원 비율 계산
    const calculatedValue = value * ratio;
    let displayValue: string;

    // 4. 표시 방식 결정 (분수 우선 -> 안되면 소수점 1자리)
    if (Math.abs(calculatedValue - 0.5) < 0.01) displayValue = "1/2";
    else if (Math.abs(calculatedValue - 0.25) < 0.01) displayValue = "1/4";
    else if (Math.abs(calculatedValue - 0.75) < 0.01) displayValue = "3/4";
    else if (Number.isInteger(calculatedValue)) {
      displayValue = calculatedValue.toString();
    } else {
      // 매끄럽지 않으면 소수점 1자리까지 (ex: 0.3, 0.7)
      displayValue = calculatedValue.toFixed(1).replace(/\.0$/, '');
    }

    // 5. 원래 문자열에서 숫자 부분만 새 값으로 교체 (기존 단위 유지)
    return amountStr.replace(originalValueStr, displayValue);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 검색 영역 */}
          <Card className="overflow-visible border-none shadow-md bg-white/50 backdrop-blur-sm z-20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">오늘의 요리는 무엇인가요?</CardTitle>
              <CardDescription>레시피를 검색하면 인원 수에 맞는 견적을 뽑아드립니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="요리 이름 검색 (예: 김치찌개, 파스타)"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchFocused) setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  className="pl-10 h-12 text-lg bg-white shadow-sm border-slate-200 focus-visible:ring-[#E11D48]"
                />
                {isSearchFocused && searchQuery && (
                  <div className="absolute w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                    {filteredRecipes.map((recipe) => (
                      <div key={recipe.name} className="px-4 py-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors" onClick={() => handleSelectRecipe(recipe)}>
                        <div className="flex items-center gap-3">
                          <Utensils className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-slate-700">{recipe.name}</span>
                        </div>
                        <Badge variant="secondary">기준 {recipe.baseServings}인분</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!searchQuery && (
                <div className="flex gap-2 flex-wrap items-center">
                  <span className="text-xs text-muted-foreground mr-1">추천:</span>
                  {presetRecipes.map((recipe) => (
                    <Badge key={recipe.name} variant="outline" className="cursor-pointer hover:bg-[#E11D48] hover:text-white hover:border-[#E11D48] transition-all py-1.5 px-3" onClick={() => handleSelectRecipe(recipe)}>
                      {recipe.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 필요한 재료 영역 */}
          {selectedRecipe && (
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center flex-wrap gap-2 text-slate-700">
                  <ShoppingCart className="w-5 h-5" />
                  <span>필요한 재료</span>
                  <span className="ml-4 text-sm text-[#E11D48] font-normal">
                    (이미 있는 재료는 체크해서 제외해주세요)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRecipe.ingredients.map((ingredient, index) => {
                  const unitPrice = Math.round(ingredient.price / selectedRecipe.baseServings);
                  const scaledPrice = Math.round(ingredient.price * ratio);
                  const isExcluded = excludedItems[ingredient.name];

                  return (
                    <div
                      key={index}
                      className={`group cursor-pointer transition-opacity ${isExcluded ? 'opacity-40' : 'opacity-100'}`}
                      onClick={() => toggleExclude(ingredient.name)}
                    >
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isExcluded ? 'bg-[#E11D48] border-[#E11D48]' : 'border-slate-300'}`}>
                            {isExcluded && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div>
                            <div className={`font-semibold ${isExcluded ? 'line-through text-slate-500' : 'text-slate-800'}`}>{ingredient.name}</div>
                            <div className="text-xs text-muted-foreground">기본 {ingredient.amount}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${isExcluded ? 'text-slate-400' : 'text-slate-700'}`}>{scaledPrice.toLocaleString()}원</div>
                          <div className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded mt-0.5">
                            {unitPrice.toLocaleString()}원 × {targetServings}인분
                          </div>
                        </div>
                      </div>
                      {!isExcluded && (
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-400 to-[#E11D48] opacity-80" style={{ width: `${(scaledPrice / (totalCost || 1)) * 100}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽 단가 계산기 */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-white sticky top-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-[#E11D48]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Calculator className="w-5 h-5 text-[#E11D48]" /> 단가 계산기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold text-slate-600">인원수 설정</Label>
                  <div className="bg-white border-2 border-slate-100 shadow-sm px-3 py-1 rounded-md text-lg font-black text-[#E11D48] min-w-[3.5rem] text-center">{targetServings}</div>
                </div>
                <input type="range" min="1" max="20" step="1" value={targetServings} onChange={(e) => setTargetServings(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E11D48]" />
              </div>
              <Separator />
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-slate-500">총 예상 장보기 비용</span>
                  <span className="text-2xl font-bold text-slate-800 tracking-tight">{totalCost.toLocaleString()}원</span>
                </div>
                <div className="bg-[#E11D48] p-6 rounded-xl text-white shadow-xl relative overflow-hidden group">
                  <div className="relative z-10 text-xs font-bold opacity-80 uppercase tracking-wider">1인분 평균 단가</div>
                  <div className="relative z-10 text-4xl font-black mt-1 drop-shadow-md">{costPerServing.toLocaleString()}원</div>
                  <Flame className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10 rotate-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 스마트 장보기 리스트 영역 */}
      {selectedRecipe && selectedRecipe.ingredients.some(ing => !excludedItems[ing.name]) && (
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> 스마트 장보기
                </CardTitle>
                <CardDescription>{targetServings}인분 조리에 필요한 실질적인 구매 목록입니다.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-white text-green-700 border-green-200 font-bold">
                {Object.values(purchasedItems).filter(Boolean).length} / {selectedRecipe.ingredients.filter(ing => !excludedItems[ing.name]).length} 구매완료
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 gap-px bg-slate-100">
              {selectedRecipe.ingredients
                .filter(ing => !excludedItems[ing.name])
                .map((ing, i) => {
                  const isPurchased = purchasedItems[ing.name];
                  return (
                    <div
                      key={i}
                      onClick={() => togglePurchase(ing.name)}
                      className={`flex flex-col p-5 bg-white transition-all cursor-pointer hover:bg-slate-50 active:bg-slate-100 ${isPurchased ? 'bg-slate-50/80' : ''}`}
                    >
                      <div className="flex items-center gap-4 flex-1 mb-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isPurchased ? 'bg-green-500 border-green-500 scale-90' : 'border-slate-300'}`}>
                          {isPurchased && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold transition-all ${isPurchased ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {ing.name}
                          </div>
                          <div className={`text-sm font-semibold mt-0.5 ${isPurchased ? 'text-slate-300' : 'text-[#E11D48]'}`}>
                            필요 수량: {calculateAmount(ing.amount)}
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-50 ml-10">
                        <button className={`flex items-center gap-2 text-xs font-medium transition-colors ${isPurchased ? 'text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                          <ExternalLink className="w-3 h-3" />
                          <span>구매 사이트 연결하기 (준비 중)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}