import { useState } from 'react';
import { CookingPot, Plus, X, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';

interface Recipe {
  name: string;
  category: string;
  ingredients: string[];
  difficulty: string;
  cookTime: string;
}

// Mock 레시피 데이터베이스
const recipeDatabase: Recipe[] = [
  {
    name: '김치찌개',
    category: '한식',
    ingredients: ['김치', '돼지고기', '두부', '대파', '양파', '고춧가루', '마늘'],
    difficulty: '쉬움',
    cookTime: '30분',
  },
  {
    name: '된장찌개',
    category: '한식',
    ingredients: ['된장', '두부', '감자', '양파', '대파', '애호박', '마늘'],
    difficulty: '쉬움',
    cookTime: '25분',
  },
  {
    name: '볶음밥',
    category: '한식',
    ingredients: ['밥', '계란', '양파', '당근', '대파', '김치'],
    difficulty: '매우 쉬움',
    cookTime: '15분',
  },
  {
    name: '김치볶음밥',
    category: '한식',
    ingredients: ['밥', '김치', '계란', '대파', '참기름', '김'],
    difficulty: '매우 쉬움',
    cookTime: '10분',
  },
  {
    name: '계란말이',
    category: '한식',
    ingredients: ['계란', '당근', '대파', '소금'],
    difficulty: '보통',
    cookTime: '10분',
  },
  {
    name: '토마토 파스타',
    category: '양식',
    ingredients: ['파스타면', '토마토', '마늘', '올리브유', '양파', '바질'],
    difficulty: '보통',
    cookTime: '25분',
  },
  {
    name: '크림 파스타',
    category: '양식',
    ingredients: ['파스타면', '생크림', '베이컨', '마늘', '양파', '치즈'],
    difficulty: '보통',
    cookTime: '25분',
  },
  {
    name: '야채볶음',
    category: '중식',
    ingredients: ['양파', '당근', '양배추', '대파', '마늘', '간장'],
    difficulty: '쉬움',
    cookTime: '15분',
  },
  {
    name: '계란국',
    category: '한식',
    ingredients: ['계란', '대파', '멸치', '국간장', '마늘'],
    difficulty: '매우 쉬움',
    cookTime: '10분',
  },
  {
    name: '감자조림',
    category: '한식',
    ingredients: ['감자', '간장', '설탕', '대파', '양파', '마늘'],
    difficulty: '쉬움',
    cookTime: '20분',
  },
  {
    name: '두부김치',
    category: '한식',
    ingredients: ['두부', '김치', '돼지고기', '대파', '참기름'],
    difficulty: '쉬움',
    cookTime: '15분',
  },
];

const commonIngredients = [
  '김치', '계란', '두부', '대파', '양파', '마늘', '돼지고기', '밥',
  '당근', '감자', '양배추', '파스타면', '토마토', '치즈', '베이컨',
  '간장', '고춧가루', '된장', '참기름', '설탕', '소금', '후추',
];

interface MatchedRecipe extends Recipe {
  matchPercentage: number;
  missingIngredients: string[];
  hasIngredients: string[];
}

export function IngredientMatch() {
  const [myIngredients, setMyIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<MatchedRecipe[]>([]);

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !myIngredients.includes(trimmed)) {
      const newIngredients = [...myIngredients, trimmed];
      setMyIngredients(newIngredients);
      findMatchingRecipes(newIngredients);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = myIngredients.filter((ing) => ing !== ingredient);
    setMyIngredients(newIngredients);
    findMatchingRecipes(newIngredients);
  };

  const findMatchingRecipes = (ingredients: string[]) => {
    if (ingredients.length === 0) {
      setMatchedRecipes([]);
      return;
    }

    const matched = recipeDatabase.map((recipe) => {
      const hasIngredients = recipe.ingredients.filter((ing) =>
        ingredients.some((myIng) => myIng.toLowerCase() === ing.toLowerCase())
      );
      const missingIngredients = recipe.ingredients.filter(
        (ing) => !ingredients.some((myIng) => myIng.toLowerCase() === ing.toLowerCase())
      );
      const matchPercentage = Math.round(
        (hasIngredients.length / recipe.ingredients.length) * 100
      );

      return {
        ...recipe,
        matchPercentage,
        missingIngredients,
        hasIngredients,
      };
    });

    // 매칭 퍼센트 높은 순으로 정렬, 최소 30% 이상만 표시
    const sorted = matched
      .filter((recipe) => recipe.matchPercentage >= 30)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    setMatchedRecipes(sorted);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* 재료 입력 섹션 */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>보유 재료</CardTitle>
            <CardDescription>
              가지고 있는 재료를 추가하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 재료 입력 */}
            <div className="flex gap-2">
              <Input
                placeholder="재료명 입력..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addIngredient(inputValue);
                  }
                }}
              />
              <Button onClick={() => addIngredient(inputValue)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* 보유 재료 목록 */}
            {myIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {myIngredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="pl-3 pr-1 py-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {ingredient}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 hover:bg-primary/20"
                      onClick={() => removeIngredient(ingredient)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* 빠른 추가 */}
            <div>
              <div className="text-sm font-medium mb-2">자주 사용하는 재료</div>
              <div className="flex flex-wrap gap-2">
                {commonIngredients
                  .filter((ing) => !myIngredients.includes(ing))
                  .slice(0, 8)
                  .map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addIngredient(ingredient)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {ingredient}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 통계 카드 */}
        {myIngredients.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>매칭 통계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">보유 재료</span>
                <Badge variant="secondary">{myIngredients.length}개</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">만들 수 있는 요리</span>
                <Badge className="bg-primary">{matchedRecipes.length}개</Badge>
              </div>
              {matchedRecipes.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">최고 매칭률</span>
                  <Badge variant="outline" className="border-primary text-primary">
                    {matchedRecipes[0].matchPercentage}%
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 추천 레시피 섹션 */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">추천 레시피</h3>
          {matchedRecipes.length > 0 && (
            <Badge variant="secondary">
              {matchedRecipes.length}개 발견
            </Badge>
          )}
        </div>

        {/* 레시피 목록 */}
        {matchedRecipes.length > 0 ? (
          <div className="space-y-4">
            {matchedRecipes.map((recipe, index) => (
              <Card
                key={index}
                className={
                  recipe.matchPercentage === 100
                    ? 'border-primary bg-primary/5'
                    : ''
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{recipe.name}</CardTitle>
                        {recipe.matchPercentage === 100 && (
                          <Badge className="bg-primary">
                            <Check className="w-3 h-3 mr-1" />
                            완벽 매칭!
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {recipe.category} · {recipe.difficulty} · {recipe.cookTime}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {recipe.matchPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">매칭률</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 매칭 진행률 */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {recipe.hasIngredients.length} / {recipe.ingredients.length} 재료 보유
                      </span>
                    </div>
                    <Progress value={recipe.matchPercentage} className="h-2" />
                  </div>

                  {/* 보유 재료 */}
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-600" />
                      보유 재료
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.hasIngredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 부족 재료 */}
                  {recipe.missingIngredients.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        필요 재료 ({recipe.missingIngredients.length}개)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recipe.missingIngredients.map((ing) => (
                          <Badge key={ing} variant="outline" className="border-orange-200 text-orange-700">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : myIngredients.length > 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="mb-2">매칭되는 레시피가 없습니다</h3>
              <p className="text-sm text-muted-foreground">
                더 많은 재료를 추가해보세요
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CookingPot className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="mb-2">재료를 추가해보세요</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                가지고 있는 재료를 추가하면 만들 수 있는 요리를 추천해드립니다
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
