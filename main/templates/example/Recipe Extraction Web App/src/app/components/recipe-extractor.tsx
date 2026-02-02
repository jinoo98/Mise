import { useState } from 'react';
import { Search, Youtube, ChefHat, Clock, Users, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';

interface Recipe {
  name: string;
  channel: string;
  videoUrl: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  info: {
    servings: number;
    cookTime: string;
    difficulty: string;
    calories: string;
  };
  tips: string[];
}

// Mock 데이터
const mockRecipes: { [key: string]: Recipe } = {
  '김치찌개': {
    name: '김치찌개',
    channel: '백종원의 요리비책',
    videoUrl: 'https://youtube.com/example',
    ingredients: [
      { name: '묵은지', amount: '1/4포기' },
      { name: '돼지고기', amount: '200g' },
      { name: '두부', amount: '1/2모' },
      { name: '대파', amount: '1대' },
      { name: '양파', amount: '1/2개' },
      { name: '고춧가루', amount: '1큰술' },
      { name: '된장', amount: '1큰술' },
      { name: '설탕', amount: '1작은술' },
      { name: '다진 마늘', amount: '1큰술' },
    ],
    steps: [
      '묵은지는 한입 크기로 썰고, 돼지고기도 먹기 좋은 크기로 썰어주세요.',
      '냄비에 식용유를 두르고 돼지고기를 먼저 볶아주세요.',
      '고기가 어느 정도 익으면 묵은지를 넣고 함께 볶아주세요.',
      '고춧가루, 된장, 설탕, 다진 마늘을 넣고 볶아주세요.',
      '물을 넣고 끓여주세요. 김치국물이 있다면 함께 넣으면 더 맛있어요.',
      '양파와 대파를 넣고 10분 정도 더 끓여주세요.',
      '마지막으로 두부를 넣고 5분 정도 더 끓이면 완성입니다.',
    ],
    info: {
      servings: 2,
      cookTime: '30분',
      difficulty: '쉬움',
      calories: '약 350kcal',
    },
    tips: [
      '묵은지가 너무 시다면 설탕을 조금 더 넣어주세요.',
      '돼지고기 대신 참치 캔을 사용해도 맛있어요.',
      '취향에 따라 청양고추를 추가하면 더 매콤해집니다.',
    ],
  },
  '백종원': {
    name: '간장계란밥',
    channel: '백종원의 요리비책',
    videoUrl: 'https://youtube.com/example',
    ingredients: [
      { name: '밥', amount: '1공기' },
      { name: '계란', amount: '2개' },
      { name: '간장', amount: '2큰술' },
      { name: '참기름', amount: '1큰술' },
      { name: '김', amount: '적당량' },
      { name: '대파', amount: '적당량' },
      { name: '깨', amount: '약간' },
    ],
    steps: [
      '계란은 반숙으로 삶아주세요. (끓는 물에 6분 30초)',
      '간장, 참기름, 다진 대파를 섞어 양념장을 만들어주세요.',
      '따뜻한 밥 위에 반숙 계란을 올려주세요.',
      '양념장을 뿌리고 김을 올려주세요.',
      '깨를 뿌리고 잘 섞어서 드세요.',
    ],
    info: {
      servings: 1,
      cookTime: '10분',
      difficulty: '매우 쉬움',
      calories: '약 450kcal',
    },
    tips: [
      '계란은 완전히 익히지 말고 반숙으로 하는 것이 포인트입니다.',
      '취향에 따라 버터를 추가하면 더 고소합니다.',
      '마요네즈를 조금 추가해도 맛있어요.',
    ],
  },
  '파스타': {
    name: '크림 파스타',
    channel: '쿠킹하루',
    videoUrl: 'https://youtube.com/example',
    ingredients: [
      { name: '스파게티 면', amount: '200g' },
      { name: '베이컨', amount: '100g' },
      { name: '양파', amount: '1/2개' },
      { name: '마늘', amount: '3쪽' },
      { name: '생크림', amount: '200ml' },
      { name: '파마산 치즈', amount: '50g' },
      { name: '올리브유', amount: '2큰술' },
      { name: '소금', amount: '적당량' },
      { name: '후추', amount: '적당량' },
    ],
    steps: [
      '큰 냄비에 물을 끓이고 소금을 넣어 스파게티 면을 삶아주세요.',
      '베이컨은 먹기 좋은 크기로, 양파와 마늘은 잘게 다져주세요.',
      '팬에 올리브유를 두르고 마늘을 먼저 볶아 향을 내주세요.',
      '베이컨과 양파를 넣고 노릇하게 볶아주세요.',
      '생크림을 넣고 중불에서 저어가며 끓여주세요.',
      '파마산 치즈를 넣고 녹여주세요.',
      '삶은 면을 넣고 소스와 잘 섞어주세요.',
      '소금과 후추로 간을 맞추고 완성입니다.',
    ],
    info: {
      servings: 2,
      cookTime: '25분',
      difficulty: '보통',
      calories: '약 650kcal',
    },
    tips: [
      '면을 삶을 때 면수를 조금 남겨두면 소스 농도 조절에 유용합니다.',
      '생크림 대신 우유를 사용하면 더 가벼운 맛이 됩니다.',
      '파슬리 가루를 뿌리면 더 풍미가 좋아집니다.',
    ],
  },
};

export function RecipeExtractor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Mock API 호출 시뮬레이션
    setTimeout(() => {
      const foundRecipe = Object.entries(mockRecipes).find(
        ([key]) => searchQuery.toLowerCase().includes(key.toLowerCase())
      );

      if (foundRecipe) {
        setRecipe(foundRecipe[1]);
      } else {
        // 기본 레시피
        setRecipe(mockRecipes['김치찌개']);
      }
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 검색 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-primary" />
            유튜브 레시피 추출
          </CardTitle>
          <CardDescription>
            유튜브 채널명 또는 음식 이름을 입력하면 레시피를 추출합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="예: 백종원, 김치찌개, 파스타..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? '검색 중...' : '검색'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 레시피 결과 */}
      {recipe && (
        <div className="space-y-4">
          {/* 레시피 헤더 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{recipe.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    {recipe.channel}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <ChefHat className="w-3 h-3 mr-1" />
                  {recipe.info.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm text-muted-foreground">인분</div>
                  <div>{recipe.info.servings}인분</div>
                </div>
                <div>
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm text-muted-foreground">조리시간</div>
                  <div>{recipe.info.cookTime}</div>
                </div>
                <div>
                  <ChefHat className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <div className="text-sm text-muted-foreground">칼로리</div>
                  <div>{recipe.info.calories}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 재료 */}
          <Card>
            <CardHeader>
              <CardTitle>재료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                  >
                    <span>{ingredient.name}</span>
                    <Badge variant="outline">{ingredient.amount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 조리 과정 */}
          <Card>
            <CardHeader>
              <CardTitle>조리 과정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 요리 팁 */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                요리 팁
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 초기 상태 안내 */}
      {!recipe && !isSearching && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Youtube className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="mb-2">레시피를 검색해보세요</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              유튜브 채널명이나 음식 이름을 입력하면 자동으로 레시피를 추출합니다.
              <br />
              (예시: 백종원, 김치찌개, 파스타)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
